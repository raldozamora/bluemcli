import axios, { AxiosInstance, AxiosResponse } from "axios";
import chalk from "chalk";
import FormData from "form-data";
import fs from "fs";
import getAPI from "../config/api.js";
import SystemParameters from "../config/config.js";
import { zipDirectory } from "../utils/getDirectoryFiles.js";
import getSpinner from "../utils/getSpinner.js";
import getUniqueId from "../utils/getUniqueId.js";
import handleError from "../utils/handleError.js";

export default async function handleSnapshotAction(
  action: string,
  repoId: number | undefined,
  snapshotId: number | undefined,
  filepaths: string[] | undefined,
  remappingsFile: string | undefined,
  tools: string[] | undefined
) {
  const api = await getAPI();

  if (repoId) repoId = parseInt(repoId.toString());
  if (snapshotId) snapshotId = parseInt(snapshotId.toString());

  switch (action) {
    case "list":
      return listSnapshots(api, repoId);
    case "create":
      return createSnapshot(api, repoId, filepaths, remappingsFile);
    case "analyze":
      return analyzeSnapshot(api, snapshotId, tools);
    case "create-analyze":
      return createSnapshot(api, repoId, filepaths, remappingsFile, tools);
    default:
      handleError({
        error: {
          message:
            "Invalid action: [${action}] must be in [list, create, analyze, create-analyze]."
        }
      });
  }
}

async function analyzeSnapshot(
  api: AxiosInstance,
  snapshotId: number | undefined,
  tools: string[] | undefined
) {
  if (!snapshotId)
    return handleError({ error: { message: "Missing snapshot ID." } });

  const {
    data: { tools: analysisTools }
  } = await api.get("/analyses/tools");

  // FIXME: allow all tools when ready
  const toolsToRun = tools ?? ["static", "symbolic"];

  if (!toolsToRun.every((tool) => analysisTools.includes(tool))) {
    const invalidTools = toolsToRun.filter(
      (tool) => !analysisTools.includes(tool)
    );
    return handleError({
      error: { message: `Invalid tool: ${invalidTools.join(",")}` }
    });
  }

  const spinner = getSpinner("Analyzing snapshot...");
  let response: AxiosResponse;
  try {
    response = await api.post(`/snapshots/${snapshotId}/analyses`, {
      tools: toolsToRun
    });
  } catch (processError) {
    if (axios.isAxiosError(processError)) {
      return handleError({
        response: processError.response
      });
    } else {
      return handleError({
        error: {
          message: processError.message
        }
      });
    }
  } finally {
    spinner.stop();
  }

  if (
    !response.data.analysisRequest ||
    !response.data.analysisRequest.analyses
  ) {
    return handleError({
      error: {
        message: "Analysis could not be created."
      }
    });
  }

  const { analysisRequest } = response.data;
  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify(analysisRequest));
  } else {
    console.log(chalk.green(`\nAnalysis created:`));
    console.table([
      ...analysisRequest.analyses.map((analysis) => ({
        ["Request ID"]: analysisRequest.id,
        ["Requested at"]: analysis.requestedAt,
        ["Tool"]: analysis.tool.name,
        ["Error"]: analysis.error,
        ["Status"]: analysis.status
      }))
    ]);
  }
}

async function createSnapshot(
  api: AxiosInstance,
  repoId: number | undefined,
  filepaths: string[] | undefined,
  remappingsFile: string | undefined,
  toolsToRunAfterCreated: string[] = []
) {
  if (!repoId)
    return handleError({ error: { message: "Missing repository ID." } });
  if (!filepaths || !filepaths.length)
    return handleError({ error: { message: "Missing file path." } });
  if (filepaths.some((filepath) => !fs.existsSync(filepath)))
    return handleError({ error: { message: "File does not exist." } });

  const directories = filepaths.filter((filepath) =>
    fs.lstatSync(filepath).isDirectory()
  );

  const spinner = getSpinner("Uploading file...");

  const files: { name: string; path: string; stream: fs.ReadStream }[] = [];

  for (const directory of directories) {
    files.push({
      name: `${getUniqueId()}.zip`,
      path: "/",
      stream: zipDirectory(directory)
    });
  }
  for (const filepath of filepaths) {
    if (!directories.includes(filepath)) {
      files.push({
        name: filepath.split("/").slice(-1)[0],
        path: "",
        stream: fs.createReadStream(filepath)
      });
    }
  }

  if (remappingsFile) {
    files.push({
      name: "remappings.txt",
      path: "",
      stream: fs.createReadStream(remappingsFile)
    });
  }

  const formData = new FormData();
  for (const { stream: fileStream } of files) {
    formData.append("files", fileStream);
  }

  let response: AxiosResponse;
  try {
    response = await api.post(`/repositories/${repoId}/snapshots`, formData);
  } catch (processError) {
    if (axios.isAxiosError(processError)) {
      return handleError({
        response: processError.response
      });
    } else {
      return handleError({
        error: {
          message: processError.message
        }
      });
    }
  } finally {
    spinner.stop();
  }

  if (toolsToRunAfterCreated.length) {
    return analyzeSnapshot(api, response.data.id, toolsToRunAfterCreated);
  } else {
    const outputData = { ID: response.data.id, Name: response.data.name };
    if (SystemParameters.getInstance().isJsonOutput()) {
      console.log(JSON.stringify(outputData));
    } else {
      console.log(chalk.green(`\nSnapshot created:`));
      console.table([outputData]);
    }
  }
}

async function listSnapshots(api: AxiosInstance, repoId: number | undefined) {
  if (!repoId)
    return handleError({ error: { message: "Missing repository ID." } });

  const spinner = getSpinner("Retrieving snapshots...");

  let response: AxiosResponse;
  try {
    response = await api.get(`/repositories/${repoId}/snapshots`);
  } catch (processError) {
    if (axios.isAxiosError(processError)) {
      return handleError({
        response: processError.response
      });
    } else {
      return handleError({
        error: {
          message: processError.message
        }
      });
    }
  } finally {
    spinner.stop();
  }
  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify(response.data.snapshots));
  } else {
    console.log(chalk.green(`\nSnapshots:`));
    const result = response.data.snapshots.map((snapshot: any) => {
      return {
        ID: snapshot.id,
        ["Created at"]: snapshot.createdAt,
        ["# files"]: snapshot._count.files ?? 0,
        ["# analyses"]: snapshot._count.analyses ?? 0
      };
    });

    console.table(result);
  }
}

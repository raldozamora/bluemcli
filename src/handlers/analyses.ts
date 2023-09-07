import axios, { AxiosInstance, AxiosResponse } from "axios";
import chalk from "chalk";
import getAPI from "../config/api.js";
import SystemParameters from "../config/config.js";
import getSpinner from "../utils/getSpinner.js";
import handleError from "../utils/handleError.js";

export async function handleAnalysisAction(
  action: string,
  snapshotId: number | undefined,
  analysisId: number | undefined
) {
  const api = await getAPI();

  if (snapshotId) snapshotId = parseInt(snapshotId.toString());
  if (analysisId) analysisId = parseInt(analysisId.toString());

  switch (action) {
    case "list":
      return listAnalyses(api, snapshotId);
    case "get":
      return getAnalysis(api, analysisId);
    case "report":
      return getRepoAnalysis(api, analysisId);
    default:
      handleError({
        error: {
          message: `Invalid action: [${action}] must be in [list, get, report].`
        }
      });
  }
}

async function listAnalyses(
  api: AxiosInstance,
  snapshotId: number | undefined
) {
  if (!snapshotId)
    handleError({
      error: { message: "Missing required argument: snapshotId" }
    });

  const spinner = getSpinner("Retrieving analyses...");
  let response: AxiosResponse;
  try {
    response = await api.get(`/snapshots/${snapshotId}/analyses`);
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
    console.log(JSON.stringify(response.data.analyses));
  } else {
    console.log(chalk.green(`\nAnalyses:`));
    console.table(
      response.data.map((analysis: any) => {
        return {
          ["Request ID"]: analysis.analysisRequestId,
          ["Analysis ID"]: analysis.id,
          Tool: analysis.tool.name,
          Status: analysis.status,
          ["Requested at"]: analysis.requestedAt,
          ["Completed"]: !!analysis.completedAt ? "Yes" : "No",
          Target: analysis.target.name
        };
      })
    );
  }
}

async function getAnalysis(api: AxiosInstance, analysisId: number | undefined) {
  if (!analysisId) {
    handleError({
      error: {
        message: "Missing required argument: analysisId"
      }
    });
  }

  const spinner = getSpinner("Retrieving analysis...");
  let response: AxiosResponse;
  try {
    response = await api.get(`/analyses/${analysisId}`);

  } catch (processError) {
    console.log(processError)
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
  const analysis = response.data;
  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify({
      analysisId: analysis.id,
      tool: analysis.tool,
      observations: analysis.observations,
      error: analysis.error
    }));
  } else {
    console.log(chalk.green(`\nRetrieved analysis:`));
    console.table([
      {
        ["Analysis ID"]: analysis.id,
        ["Tool"]: analysis.tool,
        ["Observations"]: analysis.observations.length,
        ["Error"]: analysis?.error
      },
    ]);
    console.log(
      chalk.gray(
        `(The raw analysis output can be seen by adding the --output=json at the end of the command)`
      )
    );

    /*
    // additional details of each tool
    for (const result of response.data.results) {
      if (result.result && result.result.length > 0) {
        console.log(chalk.green(`Result [${result.tool.name}]:`));
        console.log(JSON.stringify(JSON.parse(result.result), null, 2));
      }
    } */
  }
}

async function getRepoAnalysis(
  api: AxiosInstance,
  analysisId: number | undefined
) {
  if (!analysisId) {
    handleError({
      error: {
        message: "Missing required argument: analysisId"
      }
    });
  }

  const spinner = getSpinner("Retrieving analysis report...");
  let response: AxiosResponse;
  try {
    response = await api.get(`/analyses/${analysisId}/report`);
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

  if (response.data.errorMessage) {
    return handleError({
      error: {
        message: response.data.errorMessage
      }
    });
  }

  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify(response.data));
  } else {
    console.log(chalk.green(`\Download URL of generated PDF report:`));
    console.log(response.data.downloadURLOfGeneratedReport);
  }
}

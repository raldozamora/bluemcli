import axios, { AxiosInstance, AxiosResponse } from "axios";
import chalk from "chalk";
import getAPI from "../config/api.js";
import SystemParameters from "../config/config.js";
import getSpinner from "../utils/getSpinner.js";
import handleError from "../utils/handleError.js";

export async function handleRepositoryAction(action: string, name: string) {
  const api = await getAPI();

  switch (action) {
    case "list":
      return listRepositories(api);
    case "create":
      return createRepository(api, name);
    default:
      handleError({
        error: {
          message: `Invalid action: [${action}] must be in [list, create].`
        }
      });
  }
}

async function createRepository(api: AxiosInstance, name: string) {
  if (!name)
    handleError({ error: { message: "Missing required argument: name" } });

  const spinner = getSpinner("Creating repository...");

  let response: AxiosResponse;
  try {
    response = await api.post("/repositories", { name });
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
  const result = { ID: response.data.id, Name: response.data.name };
  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify(result));
  } else {
    console.log(chalk.green(`\nCreated repository:`));
    console.table([result]);
  }
}

async function listRepositories(api: AxiosInstance) {
  const spinner = getSpinner("Retrieving repositories...");
  let response: AxiosResponse;
  try {
    response = await api.get("/repositories");
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

  const result = response.data.repositories.map((repo: any) => {
    return {
      ID: repo.id,
      Name: repo.name,
      ["Created at"]: repo.createdAt,
      ["# snapshots"]: repo._count.snapshots ?? 0,
      ["# analyses"]: repo._count.analyses ?? 0
    };
  });

  if (SystemParameters.getInstance().isJsonOutput()) {
    console.log(JSON.stringify(response.data.repositories));
  } else {
    console.log(chalk.green(`\nRepositories:`));
    console.table(result);
  }
}

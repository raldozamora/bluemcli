import axios, { AxiosInstance, AxiosResponse } from "axios";
import getAPI from "../config/api.js";
import handleError from "../utils/handleError.js";
import getSpinner from "../utils/getSpinner.js";
import chalk from "chalk";

export default async function handleToolsAction(action: string) {
  const api = await getAPI();

  switch (action) {
    case "list":
      return listTools(api);
    default:
      handleError({
        error: {
          message:
            "Invalid action: [${action}] must be in [list, create, analyze, create-analyze]."
        }
      });
  }
}

async function listTools(api: AxiosInstance) {
  const spinner = getSpinner("Retrieving tools...");

  let response: AxiosResponse;
  try {
    response = await api.get("/analyses/tools");
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
  console.log(chalk.green(`\nTools:`));
  const result = response.data.tools.map((tool: string) => {
    return {
      name: tool
    };
  });

  console.table(result);
}

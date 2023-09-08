import { OptionValues, program } from "commander";
import SystemParameters, * as config from "./config/config.js";
import { handleAnalysisAction } from "./handlers/analyses.js";
import { handleRepositoryAction } from "./handlers/repositories.js";
import handleSnapshotAction from "./handlers/snapshots.js";
import handleToolsAction from "./handlers/tools.js";

program
  .name("testmachine")
  .description("TestMachine AI's CLI. Analyze smart contracts.")
  .version(config.CLI_VERSION)
  .option("-v|--verbose", "Enable verbose logging.")
  .option(
    "-o|--output <outputFormat>",
    "Set result output type. Currently supported formats: json"
  )
  .option(
    "-t|--token <tokenOrTokenPath>",
    "The API token to use. This can be either a file path or a string"
  )
  .on("option:token", (tokenOrTokenPath: string) => {
    // A set environment variable takes precedence.
    process.env[config.TOKEN_KEY] ??= tokenOrTokenPath;
  })
  .on("option:output", (outputFormat: string) => {
    if (outputFormat.toUpperCase() === "JSON")
      SystemParameters.getInstance().enableJsonOutput();
  });

program
  .command("repo")
  .description("Manage repositories.")
  .argument("<action>", "The action to perform. Must be in [list, create].")
  .option("--name <name>", "The name of the repository to create.")
  .action(async (action: string, options: OptionValues) => {
    const { name } = options;
    handleRepositoryAction(action, name);
  });

program
  .command("snapshot")
  .description("Manage snapshots.")
  .argument(
    "<action>",
    "The action to perform. Must be in [list, create, analyze, create-analyze]."
  )
  .option(
    "--repo-id <id>",
    "The ID of the repository to create this snapshot under - get this from `repo list`."
  )
  .option(
    "--snapshot-id <id>",
    "The ID of the snapshot - get this from `snapshot list`."
  )
  .option("--tools <tools...>", "List of tools to run.")
  .option("--file <path...>", "The file to upload for a new snapshot.")
  .option(
    "--remappings <path>",
    "The file defining remappings used to solve dependencies on contracts."
  )
  .action(async (action, options) => {
    let { repoId, snapshotId, tools, file, remappings } = options;
    if (repoId) repoId = parseInt(repoId.toString());
    if (snapshotId) snapshotId = parseInt(snapshotId.toString());

    await handleSnapshotAction(
      action,
      repoId,
      snapshotId,
      file,
      remappings,
      tools
    );
  });

program
  .command("analyses")
  .description("Manage analyses.")
  .argument(
    "<action>",
    "The action to perform. Must be in [list, get, report]."
  )
  .option(
    "--snapshot-id <id>",
    "The ID of the snapshot to analyze - get this from `snapshot list`."
  )
  .option(
    "--analysis-id <id>",
    "The ID of the analysis - get this from `analyses list`."
  )
  .action(async (action, options) => {
    let { snapshotId, analysisId } = options;
    if (snapshotId) snapshotId = parseInt(snapshotId.toString());
    if (analysisId) analysisId = parseInt(analysisId.toString());

    await handleAnalysisAction(action, snapshotId, analysisId);
  });

program
  .command("tools")
  .description("Query available tools")
  .argument("<action>", "The action to perform. Must be in [list].")
  .action(async (action: string, options: OptionValues) => {
    const { name } = options;
    handleToolsAction(action);
  }); 

export default program;

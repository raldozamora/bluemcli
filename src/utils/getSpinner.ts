import chalk from "chalk";
import ora from "ora";

export default function getSpinner(message: string) {
  return ora(chalk.blue(message)).start();
}
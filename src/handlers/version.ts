import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
// import {version} from '../../src/package.json';
// const { version } = require('./package.json');

export default async function handleVersionAction() {
  console.log("vamoooooooooooooozzz");
  const zzz = process.env.npm_package_version;
  console.log(zzz);
  console.log("vamoooooooooooooovvversion.txt");
  const myVersion = fs.readFileSync("version.txt").toString();
  console.log(myVersion);
  //const { version } = require('./package.json');
  // console.log(version);  

  // esto también lee nomás el package donde estás parado, no bluemachineclie

  // npm pkg get version
  
  /*
  // use npm to get version of CLI installed locally
  console.log(chalk.green(`\ntestmachine.ai/cli version:`));

  let testMachineCLIVersion =
    "unable to get version for package testmachine/cli";
  try {
    const getVersionOutput = execSync("npm ls @testmachine.ai/cli version");

    const lines = getVersionOutput.toString().split(/\r?\n/);
    lines.forEach(function (line) {
      const packageNamePosition = line.search("@testmachine.ai/cli@");
      if (packageNamePosition >= 0) {
        testMachineCLIVersion = line.substring(packageNamePosition + 20);
      }
    });
  } catch (error) {
    // Package not installed or not found
  }
  console.log(testMachineCLIVersion);
  */
}

#!/usr/bin/env node

/*

  What should the CLI do?

  0. List available respoitories
  1. Create a new repository
  2. Create a new snapshot (upload files)
  3. Analyze a snapshot
  4. List snapshots in a given repository
  5. List analyses in a given repository

  resources:
    - repositories
    - snapshots
    - analyses

  actions:
    - list
    - create
    - analyze

  commands:
    - repository list
    - repository create
    - snapshot list --repository <repository-name>
    - snapshot create --repository <repository-name> --files <files>
    - snapshot analyze --snapshot-id <snapshot-id>
    - analysis list --snapshot <snapshot-id>

*/

import program from "./cli.js";

export default async function testmachine() {
  program.parse();
}

testmachine();

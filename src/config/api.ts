import axios from "axios";
import fs from "fs";
import * as config from "./config.js";
import handleError from "../utils/handleError.js";

export default async function getAPI() {
  const tokenOrTokenPath = process.env[config.TOKEN_KEY];

  if (!tokenOrTokenPath) {
    handleError({ error: { message: "No token provided." } });

    // The error handler will exit the process,
    // this is just to satisfy the type checker.
    return axios.create({});
  }

  let token = tokenOrTokenPath;

  try {
    if (fs.lstatSync(tokenOrTokenPath).isFile())
      token = fs.readFileSync(tokenOrTokenPath, "utf8");
  } catch (error) {
    // The token is not a path, so we assume it's a token.
  }

  return axios.create({
    baseURL: config.API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

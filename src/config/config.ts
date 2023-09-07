// Singleton class to hold global parameters
class SystemParameters {
  private static instance: SystemParameters;
  private jsonOutput: boolean = false;
  //todo private verbose = false;
  private constructor() {}

  public static getInstance(): SystemParameters {
    if (!SystemParameters.instance) {
      SystemParameters.instance = new SystemParameters();
    }

    return SystemParameters.instance;
  }

  public enableJsonOutput() {
    SystemParameters.instance.jsonOutput = true;
  }
  public isJsonOutput(): boolean {
    return SystemParameters.instance.jsonOutput;
  }
}

export const CLI_VERSION = '0.0.2';
export const API_URL = process.env.TM_API_URL || 'https://api.testmachine.ai';
// export const API_URL = 'https://api-pr-166-wvaj.onrender.com';
export const TOKEN_KEY = 'TM_TOKEN_KEY';
export default SystemParameters;

import { AxiosResponse } from 'axios';
import chalk from 'chalk';
import dedent from 'dedent';

export default function handleError({
  error,
  response,
}: {
  error?: {message: string};
  response?: AxiosResponse;
}) {
  console.log(chalk.red(dedent`\n
    =====================
           ERROR
    =====================
  `));
  if (error) {
    console.error(error.message);
  }
  if (response) {
    console.error('Response status code: ', response.status);
    console.log('Error: ', response.data);
  }

  process.exit(1);
}

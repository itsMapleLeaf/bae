import chalk from "chalk"

export class Logger {
  constructor(private prefix: string) {}

  info(...values: unknown[]) {
    console.info(chalk.magenta(this.prefix), chalk.blue("i"), ...values)
  }

  warn(...values: unknown[]) {
    console.warn(chalk.magenta(this.prefix), chalk.yellow("w"), ...values)
  }

  error(...values: unknown[]) {
    console.error(chalk.magenta(this.prefix), chalk.red("e"), ...values)
  }

  debug(...values: unknown[]) {
    console.debug(chalk.magenta(this.prefix), chalk.gray("d"), ...values)
  }
}

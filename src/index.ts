import { Command } from "@commander-js/extra-typings";
import { kebabCase } from "lodash";
import { join } from "node:path";
import { copySync } from "fs-extra";

const program = new Command();

program
  .name("dollardojo-express")
  .description("Express framework generator made by DollarDojo.")
  .version("1.0.0");

program
  .command("generate")
  .description(
    "Scaffolds an Express application with ESlint, Jest, Prettier, Prisma, and other tooling configured."
  )
  .argument(
    "<directory>",
    "install directory, relative to current working directory"
  )
  .action((directory) => {
    const installDirectory = kebabCase(directory);

    const installPath = join(__dirname, installDirectory);
    const templatePath = join(`${__dirname}`, "_template");

    copySync(templatePath, installPath);
  });

program.parse();

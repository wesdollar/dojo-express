#!/usr/bin/env node
import { Command } from "@commander-js/extra-typings";
import { kebabCase } from "lodash";
import { join } from "node:path";
import { copySync } from "fs-extra";
import { renameSync } from "node:fs";
import { blue, cyan, inverse, dim } from "chalk";
import { cwd } from "node:process";

const program = new Command();

program
  .name("dollardojo-express")
  .description("Express framework generator made by DollarDojo.")
  .version("1.0.2");

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

    const installPath = join(cwd(), installDirectory);
    const templatePath = join(__dirname, "_template");

    copySync(templatePath, installPath);
    renameSync(join(installPath, ".env.example"), join(installPath, ".env"));

    console.log(
      `${blue("Success!")} Application generated at ${cyan(installPath)}!\n`
    );

    console.log(
      `Run Express from port ${inverse(
        3002
      )}. You can custome the port in ${inverse(
        ".env"
      )} file in project root.\n\n`
    );

    console.log(blue("To start the service:\n"));

    console.log(dim(`cd ${installDirectory}`));
    console.log(dim("npm run dev"));
  });

program.parse();

import { inc, ReleaseType } from "semver";
import { Command } from "@commander-js/extra-typings";
import { readFileSync } from "node:fs";
import { outputFileSync, copySync } from "fs-extra";
import { red, green, inverse } from "chalk";
import { execSync, spawn } from "node:child_process";
import { chdir } from "node:process";

const program = new Command();

program
  .name("dollardojo-version-bumper")
  .description("Bumps package.json version and optionally publishes to NPM.")
  .version("1.0.0");

program
  .description(
    "Bumps value stored in version.txt to patch. Use options to bump minor and major. Publishes to NPM by default."
  )
  .option("-M, --major", "major version bump")
  .option("-m, --minor", "minor version bump")
  .action(({ minor, major }) => {
    execSync("npm run build");

    const currentVersion = readFileSync(`${__dirname}/version.txt`).toString();
    const packageContents = readFileSync(
      `${__dirname}/package-template.txt`
    ).toString();
    const versionToken = "~~VERSION~~";
    let bumpSetting = "patch" as ReleaseType;

    if (minor) {
      bumpSetting = "minor";
    }

    if (major) {
      bumpSetting = "major";
    }

    const updatedVersion = inc(currentVersion, bumpSetting)?.toString();

    if (!updatedVersion) {
      return console.error(red("no version.txt found"));
    }

    const updatedPackageContents = packageContents.replace(
      versionToken,
      `"${updatedVersion}"`
    );

    outputFileSync(`${__dirname}/dist/package.json`, updatedPackageContents);
    copySync(`${__dirname}/src/README.md`, `${__dirname}/dist/README.md`);
    outputFileSync(`${__dirname}/version.txt`, updatedVersion);
    copySync(`${__dirname}/src/_template`, `${__dirname}/dist/_template`);

    console.log(
      green(
        `package.json has been created with version ${inverse(updatedVersion)}`
      )
    );

    chdir(`${__dirname}/dist`);

    const npmPublish = spawn("npm", ["publish", "--access", "public"], {
      stdio: "inherit",
    });

    npmPublish.stdout?.on("data", (data) => {
      console.log(data.toString());
    });

    npmPublish.stderr?.on("data", (data) => {
      console.error(`grep stderr: ${data}`);
    });

    npmPublish.on("close", (code) => {
      if (code !== 0) {
        return console.log(`grep process exited with code ${code}`);
      }

      console.log(green(`\nYour package has been published!`));
    });
  });

program.parse();

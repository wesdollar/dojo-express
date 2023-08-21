import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["src"],
  setupFiles: ["dotenv-flow/config"],
  testEnvironment: "node",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};

export default config;

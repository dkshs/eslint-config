import fs from "node:fs/promises";
import { builtinRules } from "eslint/use-at-your-own-risk";
import { flatConfigsToRulesDTS } from "eslint-typegen/core";
import { dkshs } from "../src";

const configs = await dkshs({
  plugins: {
    "": {
      rules: Object.fromEntries(builtinRules.entries()),
    },
  },
  react: true,
  nextjs: true,
  tailwindcss: true,
  reactQuery: true,
});

const configNames = configs.map((i) => i.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false,
});

dts += `
// Names of all the configs
export type ConfigNames = ${configNames.map((i) => `'${i}'`).join(" | ")}
`;

await fs.writeFile("src/typegen.d.ts", dts);

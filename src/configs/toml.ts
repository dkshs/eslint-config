import type { FlatConfigItem, OptionsFiles, OptionsOverrides } from "../types";
import { GLOB_TOML } from "../globs";
import { interopDefault } from "../utils";

export async function toml(
  options: OptionsOverrides & OptionsFiles = {},
): Promise<FlatConfigItem[]> {
  const { files = [GLOB_TOML], overrides = {} } = options;

  const [pluginToml, parserToml] = await Promise.all([
    interopDefault(import("eslint-plugin-toml")),
    interopDefault(import("toml-eslint-parser")),
  ] as const);

  return [
    {
      plugins: {
        toml: pluginToml,
      },
    },
    {
      files,
      languageOptions: {
        parser: parserToml,
      },
      rules: {
        "toml/comma-style": "error",
        "toml/keys-order": "error",
        "toml/no-space-dots": "error",
        "toml/no-unreadable-number-separator": "error",
        "toml/precision-of-fractional-seconds": "error",
        "toml/precision-of-integer": "error",
        "toml/tables-order": "error",
        "toml/vue-custom-block/no-parsing-error": "error",

        "unicorn/filename-case": "off",

        ...overrides,
      },
    },
  ];
}

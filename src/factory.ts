import type { Awaitable, FlatConfigItem, OptionsConfig } from "./types";
import {
  hasNextJs,
  hasReact,
  hasTailwind,
  hasTypeScript,
  isInEditorEnv,
} from "./env";
import {
  comments,
  ignores,
  imports,
  javascript,
  jsonc,
  markdown,
  nextJs,
  node,
  prettier,
  promise,
  react,
  sortKeys,
  sortPackageJson,
  sortTsconfig,
  tailwindcss,
  toml,
  typescript,
  unicorn,
  yml,
} from "./configs";
import { composer } from "./utils";

const flatConfigProps: (keyof FlatConfigItem)[] = [
  "files",
  "ignores",
  "languageOptions",
  "linterOptions",
  "processor",
  "plugins",
  "rules",
  "settings",
];

export type ResolvedOptions<T> = T extends boolean ? never : NonNullable<T>;

export function resolveSubOptions<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
): ResolvedOptions<OptionsConfig[K]> {
  return typeof options[key] === "boolean" ? ({} as any) : options[key] || {};
}

export function getOverrides<K extends keyof OptionsConfig>(
  options: OptionsConfig,
  key: K,
) {
  return resolveSubOptions(options, key).overrides || {};
}

/**
 * Merges ESLint configurations with optional support for Markdown, React, Next.js, TailwindCSS, and Prettier.
 *
 * @param options - Optional settings for Markdown, React, Next.js, TailwindCSS and Prettier.
 * @param config - The user configurations to be merged with the generated configurations.
 * @returns Merged ESLint configurations based on provided options.
 */
export function dkshs(
  options: OptionsConfig & FlatConfigItem = {},
  ...userConfigs: Awaitable<FlatConfigItem | FlatConfigItem[]>[]
) {
  const {
    isInEditor = isInEditorEnv,
    nextjs: enableNextJs = hasNextJs,
    react: enableReact = hasReact,
    tailwindcss: enableTailwindCSS = hasTailwind,
    typescript: enableTypescript = hasTypeScript,
  } = options;

  const prettierOptions =
    typeof options.prettier === "object" ? options.prettier : {};

  const configs: Awaitable<FlatConfigItem[]>[] = [];

  // Base configs
  configs.push(
    ignores(),
    javascript({ isInEditor, overrides: getOverrides(options, "javascript") }),
    comments(),
    imports(),
    unicorn(),
    node(),
    promise(),
    sortKeys(),
  );

  if (enableTypescript) {
    configs.push(
      typescript({
        ...resolveSubOptions(options, "typescript"),
        overrides: getOverrides(options, "typescript"),
      }),
    );
  }

  if (options.jsonc ?? true) {
    configs.push(
      jsonc({ overrides: getOverrides(options, "jsonc") }),
      sortPackageJson(),
      sortTsconfig(),
    );
  }

  if (options.yaml ?? true) {
    configs.push(yml({ overrides: getOverrides(options, "yaml") }));
  }

  if (options.toml ?? true) {
    configs.push(toml({ overrides: getOverrides(options, "toml") }));
  }

  if (options.markdown ?? true) {
    configs.push(markdown({ overrides: getOverrides(options, "markdown") }));
  }

  if (enableReact) {
    configs.push(
      react({
        overrides: getOverrides(options, "react"),
        typescript: !!enableTypescript,
      }),
    );
  }

  if (enableNextJs) {
    configs.push(nextJs({ overrides: getOverrides(options, "nextjs") }));
  }

  if (enableTailwindCSS) {
    configs.push(
      tailwindcss({
        isInEditor,
        overrides: getOverrides(options, "tailwindcss"),
      }),
    );
  }

  if (options.prettier ?? true) configs.push(prettier(prettierOptions));

  // User can optionally pass a flat config item to the first argument
  // We pick the known keys as ESLint would do schema validation
  const fusedConfig = flatConfigProps.reduce((acc, key) => {
    if (key in options) acc[key] = options[key] as any;
    return acc;
  }, {} as FlatConfigItem);
  if (Object.keys(fusedConfig).length > 0) configs.push([fusedConfig]);

  return composer(...configs, ...(userConfigs as any));
}

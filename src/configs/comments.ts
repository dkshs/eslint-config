import type { FlatConfigItem } from "../types";
import { pluginComments } from "../plugins";

export function comments(): FlatConfigItem[] {
  return [
    {
      name: "ncontiero/comments/rules",
      plugins: {
        "eslint-comments": pluginComments,
      },
      rules: {
        "eslint-comments/disable-enable-pair": [
          "error",
          { allowWholeFile: true },
        ],
        "eslint-comments/no-aggregating-enable": "error",
        "eslint-comments/no-duplicate-disable": "error",
        "eslint-comments/no-unlimited-disable": "error",
        "eslint-comments/no-unused-enable": "error",
      },
    },
  ];
}

export default {
  entryPointStrategy: "packages",
  entryPoints: ["./packages/picker"],
  packageOptions: {
    entryPoints: ["src/index.ts"],
    readme: "README.md",
    includeVersion: true,
    exclude: ["**/__tests__/**/*", "**/e2e/**/*", "**/node_modules/**/*"],
  },
  out: "docs",
  plugin: ["typedoc-plugin-rename-defaults", "typedoc-plugin-mdn-links", "typedoc-plugin-replace-text"],
  exclude: ["node_modules", "__tests__/**/*", "packages/*/{__tests__,e2e}/**/*"],
  includeVersion: true,
  hideGenerator: true,
  disableSources: false,
  tsconfig: "tsconfig.json",
  readme: "README.md",
  githubPages: true,
  gitRemote: "origin",
  highlightLanguages: ["typescript", "javascript", "css", "html", "json", "scss", "jsx", "tsx", "bash"],
  replaceText: {
    inCodeCommentText: true,
    inCodeCommentTags: true,
    inMarkdown: false,
    replacements: [
      // {
      //   pattern:"",
      //   replace: '',
      // },
    ],
  },
  navigationLinks: {
    Examples: "https://github.com/freeshineit/picker/tree/main/site",
    Github: "https://github.com/freeshineit/picker",
  },
};

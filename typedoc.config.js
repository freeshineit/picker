export default {
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  plugin: ['typedoc-plugin-rename-defaults', 'typedoc-plugin-mdn-links', 'typedoc-plugin-replace-text'],
  exclude: ['node_modules'],
  includeVersion: true,
  hideGenerator: true,
  disableSources: false,
  tsconfig: 'tsconfig.json',
  readme: 'README.md',
  githubPages: true,
  gitRemote: 'origin',
  highlightLanguages: ['typescript', 'javascript', 'css', 'html', 'json', 'scss', 'jsx', 'tsx', 'bash'],
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
    Examples: 'https://github.com/freeshineit/drag-scroll/tree/main/examples',
    Github: 'https://github.com/freeshineit/drag-scroll',
  },
};

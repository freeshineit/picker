如果你想让你的 npm 包优先提供 ESM (`.mjs`) 产物，同时优雅降级支持 CommonJS (`.cjs` 或 `.js`)（让使用环境如 Vite、Webpack 或 Node.js 自动选择最合适的格式），你需要正确配置 `package.json` 中的 `exports` 和 `main`、`module` 字段。

这是业界标准的 "Dual Package Setup" (双重包结构) 配置方式：

```json
{
  "name": "your-package-name",
  "type": "module", // (可选) 标记包里的 .js 默认为 ESM。如果你的 CJS 产物是以 .cjs 结尾，或者 ESM 产物以 .mjs 结尾，这个��段可以不写。

  // 1. 传统兼容字段 (给不支持 exports 的老版本打包工具看的)
  "main": "./dist/index.cjs", // 或 "./dist/index.js"，指向 CommonJS 入口
  "module": "./dist/index.mjs", // 指向 ESM 入口 (Webpack 和 Rollup 会优先读这个)

  // 2. TypeScript 类型声明入口 (可选)
  "types": "./dist/index.d.ts",

  // 3. 现代环境首选字段 (Node.js 12+, Webpack 5, Vite 等)
  "exports": {
    ".": {
      "types": "./dist/index.d.ts", // 如果有类型，必须放在最前面
      "import": "./dist/index.mjs", // 当环境使用 import 语句时（ESM环境），加载这个文件
      "require": "./dist/index.cjs", // 当环境使用 require() 时（CJS环境），加载这个文件
      "default": "./dist/index.cjs" // 兜底选项，给无法识别前两种情况的环境使用
    },
    // 如果你允许外部引入特定的 CSS 或资源文件：
    "./style.css": "./dist/style.css"
  }
}
```

## 关键点解析：

1. `exports` 字段优先级最高：现代打包工具（Vite、Webpack 5）和 Node.js（v12+）在解析依赖时，会优先查看 `exports。`

- 如果用户写了 `import { Foo } from 'your-package'`，工具会命中 `"import": "./dist/index.mjs"`。
- 如果用户写了 `const { Foo } = require('your-package')`，工具会命中 `"require": "./dist/index.cjs"`。

2. 顺序很重要：在 `exports` 对象中，条件的顺序是有意义的。通常建议的顺序是：`types` -> `import` -> `require` -> `default`。后缀名区分：为了明确告诉 Node.js 文件的模块类型：

3. 建议将 ESM 产物打包成 `.mjs`（或者如果 `type: "module"`，则为 `.js`）。

- 建议将 CJS 产物打包成 `.cjs`（或者如果省略 `type`，则为 `.js`）。
- 这样配置后，包的调用方不需要做任何设置，他们的构建工具和运行环境会自动根据 `import` 或 `require` 语法以及自身能力，挑选出最合适的那个文件。

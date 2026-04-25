## pnpm workspace

![CI](https://github.com/freeshineit/picker/workflows/build/badge.svg)

一个基于 pnpm workspace + lerna 的 monorepo 项目模板，包含多个包和示例站点。

## 特性

- 🚀 pnpm workspace - 快速、节省磁盘空间的包管理器
- 📦 Lerna - 多包管理和发布
- 🔧 TypeScript - 类型安全
- 🎨 ESLint + Prettier - 代码质量和格式化
- 🪝 Husky + Commitlint - Git 钩子和提交规范
- ⚡️ Rollup - 构建工具

## 环境要求

- Node.js >= 18.3
- pnpm >= 8.0

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式（并行启动所有包）
pnpm dev

# 构建所有包
pnpm build


# 代码检查和格式化
pnpm lint           # 修复 lint 问题
pnpm lint:check     # 只检查不修复
pnpm fmt            # 格式化代码
pnpm fmt:check      # 检查格式
pnpm type-check     # TypeScript 类型检查

# 清理
pnpm clean:dist     # 清理所有构建产物
pnpm clean          # 清理所有 node_modules 和构建产物

# 生成文档
pnpm docs
```

## 包管理

```bash
# 在根目录安装依赖（-w 表示 workspace root）
pnpm add <package> -w -D

# 给指定子包安装依赖
pnpm add <package> -r --filter <package-name>

# 示例：给 pkg2 安装 lodash-es
pnpm add lodash-es -r --filter pkg2

# 子包相互引用
pnpm add <package-a> -r --filter <package-b>

# 执行指定子包的脚本
pnpm run --filter <package-name> <script-name>

# 示例：执行 pkg2 的 dev 脚本
pnpm run --filter pkg2 dev

# 执行所有子包的脚本（注意星号）
pnpm run --filter '*' build
```

## 项目结构

```
.
├── packages/          # 核心包
│   ├── picker/       # js 库
├── site/             # 示例站点
│   ├── with-react/   # React 示例
│   ├── with-vue2/    # Vue 2 示例
│   └── with-vue3/    # Vue 3 示例
├── common/           # 公共工具
└── config/           # 配置文件
```

## 包说明

包入口文件`src/index.ts`, 默认构建产物 cjs, esm。 当 `src` 下有 `main.ts` 时，才会构建 umd 产物。

备注：如果想更新构建入口请更新 `config/rollup/src/index.mjs` 文件中的配置。

## 发布

```bash
# 查看所有包
pnpm list

# 版本管理
pnpm version

# 发布到 npm（使用 git tag 进行版本发布）
pnpm release
```

## Git 提交规范

项目使用 commitlint 规范提交信息，支持以下类型：

- `feat`: 新功能
- `fix`: 修复 bug
- `enhance`: 增强功能
- `refactor`: 重构
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关
- `chore`: 构建/工具链相关
- `perf`: 性能优化
- `ci`: CI 配置
- `build`: 构建相关
- `revert`: 回滚

示例：`feat(store): add new state management feature`

## License

MIT

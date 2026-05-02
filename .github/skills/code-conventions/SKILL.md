---
name: code-conventions
description: "本项目代码规范参考。当需要编写新代码、审查代码风格、生成测试用例、撰写 commit message、添加注释时使用。覆盖：TypeScript 命名约定、类结构顺序、模块导入导出、测试组织、Prettier 格式化规则、commit 规范、JSDoc 注释风格。"
argument-hint: "要检查或生成的代码类型（如 class / test / commit）"
---

# 代码规范

## 1. TypeScript 命名约定

### 类型 / 接口 / 类

- **类型**：`export type`，PascalCase
  ```ts
  export type PickerPlacement = "top" | "tl" | "tr" | "bottom" | "bl" | "br";
  ```
- **接口**：`export interface`，PascalCase
  ```ts
  export interface PickerOptions { ... }
  ```
- **类**：`class`，PascalCase
  ```ts
  class Picker { ... }
  ```

### 成员前缀规则

| 类型                      | 前缀        | 示例                                 |
| ------------------------- | ----------- | ------------------------------------ |
| 公共 DOM 引用（实例属性） | `$`         | `$container`, `$wrapperContent`      |
| 私有 DOM 引用（实例属性） | `_$`        | `private readonly _$popupContainer`  |
| 私有普通属性              | `_`         | `private _open = false`              |
| 模块级常量（公开）        | `_$...$_`   | `const _$PICKER_PLACEMENT$_`         |
| 模块级常量（私有/默认）   | `__$...$__` | `const __$PICKER_DEFAULT_OPTIONS$__` |

### 访问修饰符

显式声明 `private` / `protected` / `public`，不省略。

### 类型标注

- 函数参数、返回值必须显式标注
- getter/setter 必须标注类型
- 使用可选链 `?.` 和非空断言 `!`
- 联合类型用 `|` 分隔

---

## 2. 类结构顺序

严格按以下顺序组织类成员：

```
1. static 属性
2. 公共实例属性（$container 等 DOM 引用在最前）
3. 私有/受保护实例属性
4. constructor
5. 公共 getter / setter
6. 公共方法
7. 私有/受保护方法（用分隔注释标记）
```

私有方法区分隔注释格式：

```ts
// --------------------------------------------------------------------------
// Private methods
```

---

## 3. 模块导入 / 导出

### 导入顺序

1. 外部包（第三方）
2. 内部相对路径
3. 类型专用导入用 `import type`

```ts
import type Picker from "."; // 类型导入
import "./style/_style.scss"; // 副作用导入放最后
```

### 导出方式

- 类型 / 接口：具名导出 `export type` / `export interface`
- 主类：`export default`
- 单例：`export default instance`

---

## 4. 代码格式（Prettier）

| 规则         | 值                                |
| ------------ | --------------------------------- |
| 缩进         | 2 空格（`useTabs: false`）        |
| 分号         | 必须（`semi: true`）              |
| 引号         | 双引号（`singleQuote: false`）    |
| 尾逗号       | 全部（`trailingComma: "all"`）    |
| 最大行宽     | 200 字符（`printWidth: 200`）     |
| 对象括号间距 | 有（`bracketSpacing: true`）      |
| JSX 括号同行 | 是（`bracketSameLine: true`）     |
| 箭头函数括号 | 总是（`arrowParens: "always"`）   |
| 对象属性引号 | 按需（`quoteProps: "as-needed"`） |
| 换行符       | 自动（`endOfLine: "auto"`）       |

如需对某行跳过格式化，使用 `// prettier-ignore`。

---

## 5. 注释风格

### JSDoc（类 / 接口 / 公共方法）

使用中文描述，包含 `@remarks`、`@example`、`@param`、`@returns`：

````ts
/**
 * Picker 弹窗，支持 PC 和移动端
 * @remarks
 * 通用弹窗组件，可用于日期选择器、时间选择器等场景。
 *
 * @example
 * ```ts
 * const picker = new Picker(el, { placement: "bottom" });
 * ```
 */
class Picker { ... }

/**
 * 打开或关闭弹窗
 * @param open - true 为打开，false 为关闭
 */
set open(open: boolean) { ... }
````

### 内联注释

- 使用中文
- 复杂逻辑必须逐步注释
- 步骤注释格式：`// 步骤描述` 或 `// 1. 步骤一`

### 模块级常量块

用中文 ASCII 分隔注释区分常量区域：

```ts
// ==========================================================================
// Constants
```

---

## 6. 测试约定

### 文件位置

`packages/<name>/__tests__/*.test.ts`

### 命名风格

- `describe` 块：中文描述
- `test` / `it`：中文描述，以"应该"开头

```ts
describe("Picker", () => {
  describe("初始化", () => {
    test("应该正确创建 Picker 实例", () => { ... });
    test("应该支持函数形式的 container", () => { ... });
  });
});
```

### beforeEach / afterEach 标准模板

```ts
beforeEach(() => {
  jest.useFakeTimers();
  container = document.createElement("div");
  document.body.appendChild(container);
  pickers = [];
});

afterEach(() => {
  pickers.forEach((picker) => {
    try {
      picker.destroy();
    } catch (_error) {
      /* ignore */
    }
  });
  jest.clearAllTimers();
  jest.useRealTimers();
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});
```

### Mock 规范

- 回调函数：`jest.fn()`
- 方法监听：`jest.spyOn(obj, "method")`
- DOM 属性 mock：`jest.spyOn(el, "prop", "get").mockReturnValue(...)`
- 定时器：`jest.useFakeTimers()` + `jest.advanceTimersByTime(ms)` / `jest.runAllTimers()`
- 还原：`afterEach` 中调用 `jest.restoreAllMocks()`

---

## 7. Commit Message 规范

### Type 列表

| Type       | 用途                    |
| ---------- | ----------------------- |
| `feat`     | 新功能                  |
| `fix`      | Bug 修复                |
| `enhance`  | 功能增强（非 breaking） |
| `chore`    | 构建、配置、依赖        |
| `test`     | 测试相关                |
| `docs`     | 文档                    |
| `refactor` | 代码重构                |
| `style`    | 代码风格（不影响功能）  |
| `revert`   | 回滚                    |
| `perf`     | 性能优化                |
| `ci`       | CI/CD                   |
| `build`    | 构建系统                |
| `release`  | 版本发布                |
| `version`  | 版本号更新              |

### 格式规则

- Header 最大 **100** 字符
- scope 小写：`fix(picker): ...`
- subject 允许中文

```
feat(picker): 新增弹窗自适应高度功能
fix: 修复移动端滚动锁定问题
docs: 更新 README 使用示例
```

---

## 8. 文件命名规范

| 类型        | 扩展名     | 示例                      |
| ----------- | ---------- | ------------------------- |
| 源码        | `.ts`      | `index.ts`, `provider.ts` |
| React 组件  | `.tsx`     | `App.tsx`                 |
| 测试        | `.test.ts` | `picker.test.ts`          |
| 样式        | `.scss`    | `_style.scss`             |
| 配置（ESM） | `.mjs`     | `eslint.config.mjs`       |
| 配置（CJS） | `.cjs`     | `babel.config.cjs`        |
| 类型声明    | `.d.ts`    | `global.d.ts`             |

---

## 快速检查清单

生成或审查代码时逐项确认：

- [ ] 类/接口/类型使用 PascalCase
- [ ] 私有属性前缀 `_`，私有 DOM 引用 `_$`，公共 DOM 引用 `$`
- [ ] 模块级常量用 `_$NAME$_` 或 `__$NAME$__`
- [ ] 访问修饰符显式声明
- [ ] 类成员顺序：static → public props → private props → constructor → getters/setters → public methods → private methods
- [ ] 双引号，2 空格缩进，有分号，尾逗号
- [ ] 行宽不超过 200 字符
- [ ] 公共 API 有中文/英文 TypeDoc
- [ ] 测试 describe/test 使用中文，test 以"应该"开头
- [ ] commit type 在允许列表内，header ≤ 100 字符

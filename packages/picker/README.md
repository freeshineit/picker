## @skax/picker

![build](https://github.com/freeshineit/picker/workflows/build/badge.svg) ![Download](https://img.shields.io/npm/dm/@skax/picker.svg) ![Version](https://img.shields.io/npm/v/@skax/picker.svg) ![License](https://img.shields.io/npm/l/@skax/picker.svg)

Picker 是一个通用的弹窗组件，可以用于日期选择器、时间选择器等场景。
它提供了丰富的配置选项，可以自定义弹窗的样式、位置、触发方式等。

## npm dist 文件目录

```text
.
├── index.cjs // commonjs 入口
├── index.mjs // esm 兼容
├── index.umd.js // umd 兼容
├── style // css 样式文件
│   ├── style/_style.scss // scss 样式文件
│   ├── style/index.scss // scss 样式文件
│   ├── css.js // css 样式文件入口
│   ├── index.js // scss 样式文件入口
│   └── css.css // css 样式文件
└── types // 类型定义
    └── index.d.ts
```

## 使用

### esm 引入

```ts
import "@skax/picker/dist/style/css.js";
import Picker from "@skax/picker";
const picker = new Picker(document.getElementById("picker-container"), {
  placement: "bottom",
  content: "<div>选择内容</div>", //  or () => <div>选择内容</div>
  trigger: "click",
});
picker.open = true; // 打开弹窗
picker.setPlacement("top"); // 设置弹窗位置
picker.innerHTML("<div>新内容</div>"); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

### umd 引入

```html
<link rel="stylesheet" href="./node_modules/@skax/picker/dist/style/css.css" />
<script src="./node_modules/@skax/picker/dist/index.umd.js"></script>
<script>
  const picker = new Picker(document.getElementById("picker-container"), {
    placement: "bottom",
    content: "<div>选择内容</div>", //  or () => <div>选择内容</div>
    trigger: "click",
  });
  picker.open = true; // 打开弹窗
  picker.setPlacement("top"); // 设置弹窗位置
  picker.innerHTML("<div>新内容</div>"); // 设置弹窗内容
  picker.destroy(); // 销毁弹窗
</script>
```

[demo](./public/mobile.html)

### 移动端适配

```ts
import "@skax/picker/dist/style/css.js";
import Picker from "@skax/picker";
const picker = new Picker(document.getElementById("picker-container"), {
  // placement: "bottom", // 移动端不支持（默认底部展示）
  content: "<div>选择内容</div>", //  or () => <div>选择内容</div>
  trigger: "click",
  mobile: true,
});
picker.open = true; // 打开弹窗
picker.setPlacement("top"); // 设置弹窗位置
picker.innerHTML("<div>新内容</div>"); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

### sass

```ts
import "@skax/picker/dist/style/index.js"; // import sass file
import Picker from "@skax/picker";
const picker = new Picker(document.getElementById("picker-container"), {
  placement: "bottom",
  content: "<div>选择内容</div>", //  or () => <div>选择内容</div>
  trigger: "click",
});
picker.open = true; // 打开弹窗
picker.setPlacement("top"); // 设置弹窗位置
picker.innerHTML("<div>新内容</div>"); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

## 示例

示例位于仓库 `packages/picker/public`，直接引用构建产物（`dist`），可用于快速验证各类定位、触发方式与边界约束。

| 示例                                         | 说明                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| [综合示例](./public/index.html)              | 容器 / body 挂载、偏移量、边界约束（`boundaryContainer`）与 API 使用 |
| [旋转容器](./public/rotate.html)             | 旋转 `0 / 90 / 180 / 270 / 360 / 450 / -90` 度挂载下的定位与边界约束 |
| [移动端](./public/mobile.html)               | 移动端底部弹层适配                                                   |
| [移动端 Picker](./public/mobile_picker.html) | 移动端 Picker 示例                                                   |
| [PC](./public/PC.html)                       | PC 端示例                                                            |
| [Null Container](./public/null.html)         | `container = null` 时通过 `picker.open` 控制显隐                     |

本地预览：`pnpm dev`，然后访问 <http://localhost:3000/index.html>。

## 配置项

`new Picker(container, options)` 的 `options` 支持以下配置：

| 属性                | 说明                                                                          | 类型                                                | 默认值                |
| ------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| `wrapClassName`     | 弹层外层容器（`$wrapperContent`）的类名                                       | `string`                                            | `""`                  |
| `open`              | 是否展开                                                                      | `boolean`                                           | `false`               |
| `placement`         | 展示位置                                                                      | `"top" \| "tl" \| "tr" \| "bottom" \| "bl" \| "br"` | `"br"`                |
| `offset`            | 相对源节点的偏移 `[x, y]`                                                     | `[number, number]`                                  | `[0, 0]`              |
| `zIndex`            | 弹窗层级                                                                      | `number`                                            | `1000`                |
| `content`           | 弹窗内容                                                                      | `string \| (() => string)`                          | `""`                  |
| `trigger`           | 触发行为                                                                      | `"click" \| "hover"`                                | `"click"`             |
| `triggerClose`      | `trigger` 为 `click` 时，再次点击 container 关闭弹窗                          | `boolean`                                           | `false`               |
| `mouseLeaveDelay`   | 鼠标移出后延时隐藏（秒）                                                      | `number`                                            | `0.1`                 |
| `mouseEnterDelay`   | 鼠标移入后延时显示（秒）                                                      | `number`                                            | `0.1`                 |
| `isMobile`          | 移动端模式，此时 `getPopupContainer`、`placement`、`trigger`、`offset` 不生效 | `boolean`                                           | `false`               |
| `getPopupContainer` | 内容挂载节点                                                                  | `() => HTMLElement`                                 | `() => document.body` |
| `boundaryContainer` | 边界节点，弹层不会溢出该范围；未设置时默认为 window 窗口                      | `HTMLElement \| (() => HTMLElement) \| null`        | `null`（window 窗口） |
| `onOpenChange`      | 面板展开或关闭变化时触发                                                      | `(open: boolean) => void`                           | -                     |

### 边界约束 boundaryContainer

默认情况下，弹层的**方向翻转**与**边界裁剪**以 window 窗口为参考。当弹层挂载在 `body`（全局浮层），但希望它不要溢出某个滚动容器或限制区域时，可通过 `boundaryContainer` 指定边界节点：

```ts
import "@skax/picker/dist/style/css.js";
import Picker from "@skax/picker";

const scrollBox = document.getElementById("scroll-box");
const picker = new Picker(document.getElementById("picker-container"), {
  placement: "bottom",
  content: "<div>选择内容</div>",
  // 弹层不会溢出 scrollBox
  boundaryContainer: () => scrollBox,
  // 也可直接传入元素：boundaryContainer: scrollBox
});
picker.open = true;
```

说明：

- `boundaryContainer` 与 `getPopupContainer` **相互独立**：前者决定「边界范围」，后者决定「挂载位置」。
- 未设置（或为 `null`）时等价于以浏览器视口为边界。

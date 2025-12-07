## @skax/picker

![build](https://github.com/freeshineit/picker/workflows/build/badge.svg) ![Download](https://img.shields.io/npm/dm/@skax/picker.svg) ![Version](https://img.shields.io/npm/v/@skax/picker.svg) ![License](https://img.shields.io/npm/l/@skax/picker.svg)

Picker 是一个通用的弹窗组件，可以用于日期选择器、时间选择器等场景。
它提供了丰富的配置选项，可以自定义弹窗的样式、位置、触发方式等。

## npm dist 文件目录

```tree
.
├── index.js // commonjs 入口
├── index.mjs // esm 兼容
├── index.umd.js // umd 兼容
├── style // css 样式文件
│   ├── _style.scss // scss 样式文件
│   ├── css.css // css 样式文件
│   ├── css.js // css 样式文件入口
│   ├── index.js // scss 样式文件入口
│   └── index.scss // scss 样式文件
└── types // 类型定义
    └── index.d.ts
```

## 使用

### esm 引入

```ts
import '@skax/picker/dist/style/css.js';
import Picker from '@skax/picker';
const picker = new Picker(document.getElementById('picker-container'), {
  placement: 'bottom',
  content: '<div>选择内容</div>', //  or () => <div>选择内容</div>
  trigger: 'click',
});
picker.open = true; // 打开弹窗
picker.setPlacement('top'); // 设置弹窗位置
picker.innerHTML('<div>新内容</div>'); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

### umd 引入

```html
<link rel="stylesheet" href="./node_modules/@skax/picker/dist/style/css.css" />
<script src="./node_modules/@skax/picker/dist/index.umd.js"></script>
<script>
  const picker = new Picker(document.getElementById('picker-container'), {
    placement: 'bottom',
    content: '<div>选择内容</div>', //  or () => <div>选择内容</div>
    trigger: 'click',
  });
  picker.open = true; // 打开弹窗
  picker.setPlacement('top'); // 设置弹窗位置
  picker.innerHTML('<div>新内容</div>'); // 设置弹窗内容
  picker.destroy(); // 销毁弹窗
</script>
```

[demo](./public/mobile.html)

### 移动端适配

```ts
import '@skax/picker/dist/style/css.js';
import Picker from '@skax/picker';
const picker = new Picker(document.getElementById('picker-container'), {
  // placement: "bottom", // 移动端不支持（默认底部展示）
  content: '<div>选择内容</div>', //  or () => <div>选择内容</div>
  trigger: 'click',
  mobile: true,
});
picker.open = true; // 打开弹窗
picker.setPlacement('top'); // 设置弹窗位置
picker.innerHTML('<div>新内容</div>'); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

### sass

```ts
import '@skax/picker/dist/style/index.js'; // import sass file
import Picker from '@skax/picker';
const picker = new Picker(document.getElementById('picker-container'), {
  placement: 'bottom',
  content: '<div>选择内容</div>', //  or () => <div>选择内容</div>
  trigger: 'click',
});
picker.open = true; // 打开弹窗
picker.setPlacement('top'); // 设置弹窗位置
picker.innerHTML('<div>新内容</div>'); // 设置弹窗内容
picker.destroy(); // 销毁弹窗
```

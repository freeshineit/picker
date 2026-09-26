# Picker 集成测试

本项目使用 [Playwright](https://playwright.dev/) 进行集成测试（E2E 测试），在真实浏览器环境中验证 Picker 组件的功能。

## 测试范围

### 基础功能 (picker.spec.ts)

| 测试项              | 描述                               |
| ------------------- | ---------------------------------- |
| Click 触发打开/关闭 | 点击目标按钮打开弹窗，再次点击关闭 |
| Hover 触发          | 鼠标移入打开弹窗，移出关闭         |
| 多 Picker 共存      | 多个 Picker 实例可以同时打开       |
| 禁用状态            | 禁用后点击不会打开弹窗             |
| 移动端模式          | 验证 mobile 样式类和遮罩层         |
| 内容更新            | 通过 `innerHTML` 方法更新弹窗内容  |
| 销毁/重建           | 销毁后重新创建 Picker              |
| 文档点击关闭        | 点击弹窗外区域关闭                 |
| 内部点击不关闭      | 点击弹窗内部不触发关闭             |

### Placement 测试

| 测试项            | 描述                               |
| ----------------- | ---------------------------------- |
| br 位置验证       | placement 为 br 时弹窗在按钮右下方 |
| setPlacement 切换 | 通过 setPlacement 方法切换弹窗位置 |

### 多 Picker 交互

| 测试项              | 描述                            |
| ------------------- | ------------------------------- |
| 独立开闭            | 打开/关闭一个 Picker 不影响其他 |
| PickerProvider 协作 | 多个 Picker 通过 Provider 协调  |

### 边界情况

| 测试项           | 描述                     |
| ---------------- | ------------------------ |
| 反复创建/销毁    | 多次创建和销毁实例不报错 |
| 函数形式 content | content 为函数时正常渲染 |

### 旋转容器 (picker.spec.ts)

| 测试项              | 描述                            |
| ------------------- | ------------------------------- |
| 0deg 六向位置       | top/bottom/tl/tr/bl/br 位置正确 |
| 旋转 90/180/270/-90 | 旋转挂载下弹层不显著重叠        |
| 视口边界            | 弹层不超出视口                  |
| body 挂载           | body 挂载时位置正确             |

### 健壮性 (robustness.spec.ts)

> 无头（headless）运行，验证异常路径与资源释放。

| 测试项                    | 描述                                                            |
| ------------------------- | --------------------------------------------------------------- |
| destroy 幂等 + 销毁后调用 | 重复销毁不报错；销毁后 `setPlacement`/`innerHTML`/`open` 不抛错 |
| 创建/销毁不残留 DOM       | 连续创建+销毁 200 次后 DOM 节点数回基线                         |
| 容器 position 不被覆盖    | `relative/absolute/fixed/sticky` 保持；默认设 `relative`        |
| 移动端销毁移除滚动锁      | 销毁后 `body` 不再带 `epicker-body-noscroll`                    |

## 运行测试

### 前提条件

确保已构建 Picker 组件（生成 dist 目录下的文件）：

```bash
pnpm build:picker
```

### 运行所有集成测试

```bash
pnpm test:pw
```

### 有头模式运行（可视化）

```bash
pnpm test:pw:headed
```

### 调试模式

```bash
pnpm test:pw:debug
```

### UI 模式

```bash
pnpm test:pw:ui
```

### 查看测试报告

```bash
pnpm test:pw:report
```

## 测试文件结构

```
packages/picker/
├── e2e/
│   ├── README.md               # 本文件
│   ├── picker.spec.ts           # 交互 / 定位 / 旋转 / 多实例 测试
│   ├── robustness.spec.ts       # 健壮性（销毁、DOM 释放、position 守卫）
│   └── fixtures/
│       ├── picker-test.html     # 基础交互测试页
│       ├── rotate-test.html     # 旋转容器测试页
│       ├── robustness-test.html # 健壮性测试页
│       └── common.css           # 测试页样式
├── dist/                        # 构建产物（测试依赖）
│   ├── index.umd.js
│   └── style/css.css
└── src/                         # 源码
```

> 所有测试默认以 **headless** 模式运行；需要可视化时使用 `pnpm test:pw:headed`。

## 测试原则

1. **真实浏览器环境**：测试在 Chromium 中运行，验证真实渲染效果
2. **独立测试**：每个测试独立加载页面，互不干扰
3. **覆盖关键路径**：覆盖主要用户交互路径
4. **可重复**：测试结果稳定，支持多次运行

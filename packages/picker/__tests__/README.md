# Picker 单元测试

本项目使用 Jest 进行单元测试。

## 安装依赖

```bash
pnpm install
```

## 运行测试

### 运行所有测试

```bash
pnpm test
```

### 监听模式运行测试

```bash
pnpm test:watch
```

### 生成测试覆盖率报告

```bash
pnpm test:coverage
```

## 测试文件说明

- `picker.test.ts` - Picker 主类的单元测试
  - 初始化测试
  - 配置选项测试
  - open 状态测试
  - disabled 状态测试
  - setPlacement 方法测试
  - innerHTML 方法测试
  - destroy 方法测试
  - 触发方式测试（click/hover）
  - getPopupContainer 测试
  - 延迟配置测试
  - 移动端模式测试

- `provider.test.ts` - PickerProvider 单例类的单元测试
  - 单例模式测试
  - 添加/移除 picker 测试
  - closeOther 方法测试

- `main.test.ts` - 主入口文件的测试

## 测试覆盖率

运行 `pnpm test:coverage` 后，可以在以下位置查看覆盖率报告：

- 终端输出：文本格式的覆盖率摘要
- `coverage/lcov-report/index.html`：HTML 格式的详细覆盖率报告

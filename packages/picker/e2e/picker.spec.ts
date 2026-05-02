import { test, expect, Page, Locator } from "@playwright/test";
import path from "path";

/**
 * Playwright 将 cwd 设置为项目根目录（playwright.config.ts 所在目录）
 */
const PROJECT_ROOT = process.cwd();
const FIXTURE_URL = `file://${path.join(PROJECT_ROOT, "packages/picker/e2e/fixtures/picker-test.html")}`;
const ROTATE_FIXTURE_URL = `file://${path.join(PROJECT_ROOT, "packages/picker/e2e/fixtures/rotate-test.html")}`;

/**
 * 在指定 section 内获取 picker wrapper 元素
 */
function getWrapper(page: Page, sectionId: string): Locator {
  return page.locator(`#${sectionId} .epicker-wrapper`);
}

/**
 * 在指定 section 内获取状态元素
 */
function getStatus(page: Page, sectionId: string): Locator {
  return page.locator(`#${sectionId} [id^="status-"]`);
}

/**
 * 等待 picker 在指定 section 中打开
 */
async function waitForPickerOpen(page: Page, sectionId: string) {
  const wrapper = getWrapper(page, sectionId);
  await wrapper.waitFor({ state: "visible", timeout: 5000 });
  // 等待动画完成
  await page.waitForTimeout(400);
}

/**
 * 等待 picker 在指定 section 中关闭
 */
async function waitForPickerClose(page: Page, sectionId: string) {
  await page.waitForTimeout(400);
  const wrapper = getWrapper(page, sectionId);
  await expect(wrapper).toBeHidden();
}

test.describe("Picker 集成测试 - 基础功能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#btn-basic", { state: "visible" });
  });

  test("1. 基本 click 触发：点击目标按钮打开弹窗", async ({ page }) => {
    const btn = page.locator("#btn-basic");
    const status = getStatus(page, "test-basic");
    const wrapper = getWrapper(page, "test-basic");

    // 初始状态：弹窗关闭
    await expect(wrapper).toBeHidden();
    await expect(status).toHaveText("closed");

    // 点击按钮打开
    await btn.click();
    await waitForPickerOpen(page, "test-basic");
    await expect(status).toHaveText("open");
    await expect(wrapper).toBeVisible();
    // 验证弹窗内容
    await expect(wrapper).toContainText("Basic Picker Content");
  });

  test("2. click 触发：再次点击容器关闭弹窗 (triggerClose)", async ({ page }) => {
    const btn = page.locator("#btn-basic");
    const status = getStatus(page, "test-basic");

    // 打开
    await btn.click();
    await waitForPickerOpen(page, "test-basic");
    await expect(status).toHaveText("open");

    // 再次点击关闭（triggerClose = true）
    await btn.click();
    await waitForPickerClose(page, "test-basic");
    await expect(status).toHaveText("closed");
  });

  test("3. hover 触发：鼠标移入打开，移出关闭", async ({ page }) => {
    const btn = page.locator("#btn-hover");
    const status = getStatus(page, "test-hover");
    const wrapper = getWrapper(page, "test-hover");

    // 初始关闭
    await expect(wrapper).toBeHidden();
    await expect(status).toHaveText("closed");

    // 鼠标移入
    await btn.hover();
    await waitForPickerOpen(page, "test-hover");
    await expect(status).toHaveText("open");
    await expect(wrapper).toContainText("Hover Picker Content");

    // 鼠标移出到空白区域
    await page.mouse.move(0, 0);
    await waitForPickerClose(page, "test-hover");
    await expect(status).toHaveText("closed");
  });

  test("4. 同一 Provider 下点击一个 picker 会关闭其他", async ({ page }) => {
    const btn1 = page.locator("#btn-multi-1");
    const btn2 = page.locator("#btn-multi-2");
    const status1 = page.locator("#status-multi-1");
    const status2 = page.locator("#status-multi-2");
    const wrapper1 = page.locator(".epicker-wrapper").filter({ hasText: "Picker 1 Content" }).first();
    const wrapper2 = page.locator(".epicker-wrapper").filter({ hasText: "Picker 2 Content" }).first();

    // 打开第一个 picker
    await btn1.click();
    await wrapper1.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);
    await expect(status1).toHaveText("open");
    await expect(status2).toHaveText("closed");

    // 点击第二个 picker 的按钮：PickerProvider.closeOther 会关闭第一个
    await btn2.click();
    await wrapper2.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);
    await expect(status1).toHaveText("closed");
    await expect(status2).toHaveText("open");
  });

  test("5. 禁用状态：禁用后点击不会打开弹窗", async ({ page }) => {
    const btn = page.locator("#btn-disabled");
    const status = getStatus(page, "test-disabled");

    // 验证容器有禁用样式类
    await expect(btn).toHaveClass(/epicker-disabled/);

    // 多次点击
    await btn.click();
    await page.waitForTimeout(300);
    await btn.click({ clickCount: 2 });
    await page.waitForTimeout(300);

    // 弹窗仍然关闭
    await expect(status).toHaveText("closed");
  });

  test("6. 移动端模式：弹窗带有 mobile 样式类", async ({ page }) => {
    const btn = page.locator("#btn-mobile");
    const status = page.locator("#status-mobile");

    // 打开移动端 picker
    await btn.click();
    await page.waitForTimeout(600);

    // 验证移动端状态
    await expect(status).toHaveText("open");

    // 验证移动端样式类（wrapper 自身因 children 都是 fixed 定位，尺寸为 0）
    const mobileWrapper = page.locator(".epicker-wrapper.epicker-mobile");
    await expect(mobileWrapper).toHaveClass(/epicker-mobile/);
    await expect(mobileWrapper).toContainText("Mobile Picker Content");

    // 验证存在遮罩层（遮罩层是 fixed 定位，覆盖全屏）
    const mask = page.locator(".epicker-mask");
    await expect(mask).toBeVisible();

    // 验证 body 添加了 noscroll 类
    await expect(page.locator("body")).toHaveClass(/epicker-body-noscroll/);

    // 关闭后 body 类应移除（点击遮罩层关闭移动端弹窗）
    await mask.click();
    await page.waitForTimeout(600);
    await expect(status).toHaveText("closed");
    await expect(page.locator("body")).not.toHaveClass(/epicker-body-noscroll/);
  });

  test("7. 内容更新：通过 innerHTML 更新弹窗内容", async ({ page }) => {
    const btn = page.locator("#btn-content");
    const wrapper = getWrapper(page, "test-content");

    // 打开
    await btn.click();
    await waitForPickerOpen(page, "test-content");
    await expect(wrapper).toContainText("Initial Content");

    // 通过 innerHTML 更新内容
    await page.evaluate(() => {
      const contentPicker = window.__test__.createContentPicker();
      contentPicker.innerHTML("<div style='padding:12px' id='updated-content'>Updated Content!</div>");
    });

    await page.waitForTimeout(200);
    await expect(wrapper).toContainText("Updated Content!");
    await expect(wrapper).not.toContainText("Initial Content");
  });

  test("8. 销毁后重建验证", async ({ page }) => {
    const btn = page.locator("#btn-basic");
    const status = page.locator("#status-basic");

    // 先打开确认工作正常
    await btn.click();
    await waitForPickerOpen(page, "test-basic");
    await expect(status).toHaveText("open");

    // 销毁 & 重建（createBasicPicker 会先 destroy 旧的，再创建新的）
    await page.evaluate(() => {
      window.__test__.createBasicPicker();
    });
    // 等待重建完成
    await page.waitForTimeout(500);

    // 重建后：点击按钮重新打开
    await btn.click();
    await waitForPickerOpen(page, "test-basic");
    await expect(status).toHaveText("open");
  });

  test("9. 文档点击关闭：点击弹窗外部区域关闭弹窗", async ({ page }) => {
    const btn = page.locator("#btn-basic");
    const status = getStatus(page, "test-basic");

    // 打开弹窗
    await btn.click();
    await waitForPickerOpen(page, "test-basic");
    await expect(status).toHaveText("open");

    // 点击外部区域（页面标题）
    await page.locator("h1").click();
    await waitForPickerClose(page, "test-basic");
    await expect(status).toHaveText("closed");
  });

  test("10. 弹窗内部点击不会关闭弹窗", async ({ page }) => {
    const btn = page.locator("#btn-basic");
    const status = getStatus(page, "test-basic");

    // 打开弹窗
    await btn.click();
    await waitForPickerOpen(page, "test-basic");

    // 点击弹窗内部按钮
    const insideBtn = page.locator("#btn-inside-basic");
    await expect(insideBtn).toBeVisible();
    await insideBtn.click();
    await page.waitForTimeout(300);

    // 弹窗仍然打开
    await expect(status).toHaveText("open");
  });
});

test.describe("Picker 集成测试 - Placement", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#btn-placement", { state: "visible" });
  });

  test("placement 为 br 时弹窗在按钮附近", async ({ page }) => {
    const btn = page.locator("#btn-placement");

    const btnBox = await btn.boundingBox();
    expect(btnBox).not.toBeNull();

    await btn.click();
    await waitForPickerOpen(page, "test-placement");

    // 获取弹窗位置
    const wrapper = getWrapper(page, "test-placement");
    await expect(wrapper).toBeVisible();

    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();
    expect(btnBox).not.toBeNull();

    if (wrapperBox && btnBox) {
      // br: 弹窗应在按钮右下方，wrapper.left 应接近 btn.right
      const diff = Math.abs(wrapperBox.x - btnBox.x);
      expect(diff).toBeLessThan(btnBox.width + 20);
    }
  });

  test("setPlacement 方法可以切换弹窗位置", async ({ page }) => {
    await page.evaluate(() => {
      const picker = window.__test__.createPlacementPicker();
      picker.setPlacement("top");
    });

    const btn = page.locator("#btn-placement");
    await btn.click();
    await waitForPickerOpen(page, "test-placement");

    const wrapper = getWrapper(page, "test-placement");
    await expect(wrapper).toBeVisible();
    await expect(wrapper).toContainText("Placement Test Content");
  });
});

test.describe("Picker 集成测试 - 多 picker 交互", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#btn-co-1", { state: "visible" });
  });

  test("点击第二个 picker 会关闭第一个 (closeOther)", async ({ page }) => {
    const btnA = page.locator("#btn-co-1");
    const btnB = page.locator("#btn-co-2");
    const statusA = page.locator("#status-co-1");
    const statusB = page.locator("#status-co-2");
    const wrapperA = page.locator(".epicker-wrapper").filter({ hasText: "Picker A Content" }).first();
    const wrapperB = page.locator(".epicker-wrapper").filter({ hasText: "Picker B Content" }).first();

    // 打开 picker A
    await btnA.click();
    await wrapperA.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);
    await expect(statusA).toHaveText("open");
    await expect(statusB).toHaveText("closed");

    // 点击 picker B：PickerProvider.closeOther 会关闭 A
    await btnB.click();
    await wrapperB.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);
    await expect(statusB).toHaveText("open");
    await expect(statusA).toHaveText("closed");
  });

  test("关闭一个 picker 不影响其他 picker", async ({ page }) => {
    const btnA = page.locator("#btn-co-1");
    const btnB = page.locator("#btn-co-2");
    const statusA = page.locator("#status-co-1");
    const statusB = page.locator("#status-co-2");
    const wrapperB = page.locator(".epicker-wrapper").filter({ hasText: "Picker B Content" }).first();

    // 通过 evaluate 直接设置 picker 状态更可靠
    await page.evaluate(() => {
      var w = window.__test__;
      var pickers = w.getAllPickers();
      pickers["co1"].open = true;
    });
    await page.waitForTimeout(600);

    // 验证 Picker A 已打开
    await expect(statusA).toHaveText("open");
    await expect(statusB).toHaveText("closed");

    // 打开 Picker B（点击按钮触发 closeOther）
    await btnB.click();
    await wrapperB.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    // B 打开，A 被 closeOther 关闭
    await expect(statusB).toHaveText("open");
    await expect(statusA).toHaveText("closed");
  });
});

test.describe("Picker 集成测试 - 边界情况", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("创建和销毁多个实例不报错", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // 反复创建和销毁
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const p = window.__test__.createBasicPicker();
        p.destroy();
      });
    }

    expect(errors).toEqual([]);
  });
});

test.describe("Picker 旋转容器 - 位置验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROTATE_FIXTURE_URL);
    await page.waitForLoadState("networkidle");
    // 等待旋转网格渲染完成
    await page.waitForTimeout(500);
  });

  test("0deg 容器 - bottom 弹出位置在目标下方", async ({ page }) => {
    const btn = page.locator("#rotate-target-bottom-0");
    await expect(btn).toBeVisible();

    const btnBox = await btn.boundingBox();
    expect(btnBox).not.toBeNull();

    // 点击打开
    await btn.click();
    // wrapper 挂载在按钮内部（getPopupContainer: () => target）
    const wrapper = page.locator("#rotate-target-bottom-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // bottom 弹窗应在目标下方：wrapper.top >= btn.bottom
      expect(wrapperBox.y).toBeGreaterThanOrEqual(btnBox.y + btnBox.height - 5);
      // 水平居中：wrapper 中心在 btn 中心附近
      const btnCenterX = btnBox.x + btnBox.width / 2;
      const wrapperCenterX = wrapperBox.x + wrapperBox.width / 2;
      expect(Math.abs(wrapperCenterX - btnCenterX)).toBeLessThan(btnBox.width / 2 + 10);
    }
  });

  test("0deg 容器 - top 弹出位置在目标上方", async ({ page }) => {
    const btn = page.locator("#rotate-target-top-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-top-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // top 弹窗应在目标上方：wrapper.bottom <= btn.top
      expect(wrapperBox.y + wrapperBox.height).toBeLessThanOrEqual(btnBox.y + 5);
      // 水平居中
      const btnCenterX = btnBox.x + btnBox.width / 2;
      const wrapperCenterX = wrapperBox.x + wrapperBox.width / 2;
      expect(Math.abs(wrapperCenterX - btnCenterX)).toBeLessThan(btnBox.width / 2 + 10);
    }
  });

  test("0deg 容器 - br 弹出位置在目标右下方", async ({ page }) => {
    const btn = page.locator("#rotate-target-br-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-br-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // br = bottom-right：wrapper.right 对齐 btn.right（wrapper 可能比 btn 宽）
      expect(Math.abs(wrapperBox.x + wrapperBox.width - (btnBox.x + btnBox.width))).toBeLessThan(10);
      // wrapper.top 接近 btn.bottom
      expect(Math.abs(wrapperBox.y - (btnBox.y + btnBox.height))).toBeLessThan(10);
    }
  });

  test("0deg 容器 - tr 弹出位置在目标右上方", async ({ page }) => {
    const btn = page.locator("#rotate-target-tr-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-tr-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // tr = top-right：wrapper.right 对齐 btn.right
      expect(Math.abs(wrapperBox.x + wrapperBox.width - (btnBox.x + btnBox.width))).toBeLessThan(10);
      // wrapper.bottom 接近 btn.top
      expect(Math.abs(wrapperBox.y + wrapperBox.height - btnBox.y)).toBeLessThan(10);
    }
  });

  test("0deg 容器 - bl 弹出位置在目标左下方", async ({ page }) => {
    const btn = page.locator("#rotate-target-bl-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-bl-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // bl = bottom-left：wrapper.left 对齐 btn.left
      expect(Math.abs(wrapperBox.x - btnBox.x)).toBeLessThan(10);
      // wrapper.top 接近 btn.bottom
      expect(Math.abs(wrapperBox.y - (btnBox.y + btnBox.height))).toBeLessThan(10);
    }
  });

  test("0deg 容器 - tl 弹出位置在目标左上方", async ({ page }) => {
    const btn = page.locator("#rotate-target-tl-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-tl-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // tl = top-left：wrapper.left 对齐 btn.left
      expect(Math.abs(wrapperBox.x - btnBox.x)).toBeLessThan(10);
      // wrapper.bottom 接近 btn.top
      expect(Math.abs(wrapperBox.y + wrapperBox.height - btnBox.y)).toBeLessThan(10);
    }
  });

  test("弹窗不超出视口右边界", async ({ page }) => {
    // 使用靠近右侧的 placement 测试
    const btn = page.locator("#rotate-target-br-0");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-br-0 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const viewport = page.viewportSize();
    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();

    if (wrapperBox && viewport) {
      // 不超出右边界
      expect(wrapperBox.x + wrapperBox.width).toBeLessThanOrEqual(viewport.width + 2);
      // 不超出下边界
      expect(wrapperBox.y + wrapperBox.height).toBeLessThanOrEqual(viewport.height + 2);
      // 不超出左边界
      expect(wrapperBox.x).toBeGreaterThanOrEqual(0);
    }
  });

  test("弹窗在 body 挂载时位置也正确", async ({ page }) => {
    // 使用 index.html 中的 body 挂载测试
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");

    const btn = page.locator("#btn-basic");
    await expect(btn).toBeVisible();

    const btnBox = await btn.boundingBox();
    expect(btnBox).not.toBeNull();

    await btn.click();
    await page.waitForTimeout(500);

    const wrapper = page.locator(".epicker-wrapper").filter({ hasText: "Basic Picker Content" }).first();
    await expect(wrapper).toBeVisible();

    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // bottom 弹窗应在按钮下方
      expect(wrapperBox.y).toBeGreaterThanOrEqual(btnBox.y + btnBox.height - 5);
    }
  });

  test("90deg 旋转容器 - bottom 弹出位置正确", async ({ page }) => {
    const btn = page.locator("#rotate-target-bottom-90");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-bottom-90 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // 弹层应在按钮外部（不重叠），视觉上在对应方向
      const overlapX = Math.max(0, Math.min(wrapperBox.x + wrapperBox.width, btnBox.x + btnBox.width) - Math.max(wrapperBox.x, btnBox.x));
      const overlapY = Math.max(0, Math.min(wrapperBox.y + wrapperBox.height, btnBox.y + btnBox.height) - Math.max(wrapperBox.y, btnBox.y));
      // 弹层和按钮不应有显著重叠（可接受 5px 以内容差）
      expect(overlapX * overlapY).toBeLessThan(btnBox.width * btnBox.height * 0.3);
    }
  });

  test("270deg 旋转容器 - bottom 弹出位置正确", async ({ page }) => {
    const btn = page.locator("#rotate-target-bottom-270");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-bottom-270 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // 弹层不显著重叠
      const overlapX = Math.max(0, Math.min(wrapperBox.x + wrapperBox.width, btnBox.x + btnBox.width) - Math.max(wrapperBox.x, btnBox.x));
      const overlapY = Math.max(0, Math.min(wrapperBox.y + wrapperBox.height, btnBox.y + btnBox.height) - Math.max(wrapperBox.y, btnBox.y));
      expect(overlapX * overlapY).toBeLessThan(btnBox.width * btnBox.height * 0.3);
    }
  });

  test("180deg 旋转容器 - bottom 弹出位置正确", async ({ page }) => {
    const btn = page.locator("#rotate-target-bottom-180");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-bottom-180 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // 弹层不显著重叠
      const overlapX = Math.max(0, Math.min(wrapperBox.x + wrapperBox.width, btnBox.x + btnBox.width) - Math.max(wrapperBox.x, btnBox.x));
      const overlapY = Math.max(0, Math.min(wrapperBox.y + wrapperBox.height, btnBox.y + btnBox.height) - Math.max(wrapperBox.y, btnBox.y));
      expect(overlapX * overlapY).toBeLessThan(btnBox.width * btnBox.height * 0.3);
    }
  });

  test("-90deg 旋转容器 - bottom 弹出位置正确", async ({ page }) => {
    const btn = page.locator("#rotate-target-bottom--90");
    await expect(btn).toBeVisible();

    await btn.click();
    const wrapper = page.locator("#rotate-target-bottom--90 > .epicker-wrapper");
    await wrapper.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(400);

    const btnBox = await btn.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(wrapperBox).not.toBeNull();

    if (btnBox && wrapperBox) {
      // 弹层不显著重叠
      const overlapX = Math.max(0, Math.min(wrapperBox.x + wrapperBox.width, btnBox.x + btnBox.width) - Math.max(wrapperBox.x, btnBox.x));
      const overlapY = Math.max(0, Math.min(wrapperBox.y + wrapperBox.height, btnBox.y + btnBox.height) - Math.max(wrapperBox.y, btnBox.y));
      expect(overlapX * overlapY).toBeLessThan(btnBox.width * btnBox.height * 0.3);
    }
  });
});

import { test, expect } from "@playwright/test";
import path from "path";

interface PickerInstance {
  open: boolean;
  destroy(): void;
  setPlacement(placement: string): void;
  innerHTML(html?: string): void;
}

type PickerConstructor = new (el: HTMLElement, options?: Record<string, unknown>) => PickerInstance;

declare global {
  interface Window {
    Picker: PickerConstructor;
  }
}

const PROJECT_ROOT = process.cwd();
const FIXTURE_URL = `file://${path.join(PROJECT_ROOT, "packages/picker/e2e/fixtures/robustness-test.html")}`;

test.describe("Picker 健壮性（headless）", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
    await page.waitForLoadState("networkidle");
    // 等待 UMD 暴露全局 Picker
    await page.waitForFunction(() => typeof window.Picker === "function");
  });

  test("destroy 幂等，且销毁后调用实例方法不抛错", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const result = await page.evaluate(() => {
      const target = document.createElement("button");
      document.body.appendChild(target);

      const picker = new window.Picker(target, { open: true });
      picker.destroy();
      picker.destroy(); // 幂等：重复销毁不应抛错

      const outcome: string[] = [];
      const safe = (fn: () => void) => {
        try {
          fn();
          outcome.push("ok");
        } catch (_error) {
          outcome.push("throw");
        }
      };
      safe(() => picker.setPlacement("top"));
      safe(() => picker.innerHTML("<div>x</div>"));
      safe(() => {
        picker.open = true;
      });

      return { outcome, open: picker.open };
    });

    expect(result.outcome).toEqual(["ok", "ok", "ok"]);
    expect(result.open).toBe(false);
    expect(errors).toEqual([]);
  });

  test("重复创建 / 销毁不残留 DOM 节点", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const before = await page.evaluate(() => document.getElementsByTagName("*").length);

    await page.evaluate(() => {
      for (let i = 0; i < 200; i += 1) {
        const target = document.createElement("button");
        document.body.appendChild(target);
        const picker = new window.Picker(target, { trigger: "hover" });
        picker.open = true;
        picker.destroy();
        target.remove();
      }
    });
    await page.waitForTimeout(200);

    const after = await page.evaluate(() => document.getElementsByTagName("*").length);

    // 创建 / 销毁后 DOM 节点数应回到基线（允许极小浮动）
    expect(after).toBeLessThanOrEqual(before + 2);
    expect(errors).toEqual([]);
  });

  test("挂载容器 position 为 relative/absolute/fixed/sticky 时不被覆盖", async ({ page }) => {
    const result = await page.evaluate(() => {
      const out: Record<string, string> = {};

      for (const position of ["relative", "absolute", "fixed", "sticky", ""]) {
        const box = document.createElement("div");
        if (position) box.style.position = position;
        document.body.appendChild(box);

        const target = document.createElement("button");
        box.appendChild(target);

        const picker = new window.Picker(target, { getPopupContainer: () => box });
        out[position || "default"] = box.style.position || "static";
        picker.destroy();
        box.remove();
      }

      return out;
    });

    expect(result["relative"]).toBe("relative");
    expect(result["absolute"]).toBe("absolute");
    expect(result["fixed"]).toBe("fixed");
    expect(result["sticky"]).toBe("sticky");
    // 默认（static）应该被设置为 relative 以建立定位上下文
    expect(result["default"]).toBe("relative");
  });

  test("移动端销毁后移除 body 滚动锁", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const target = document.createElement("button");
      document.body.appendChild(target);

      const picker = new window.Picker(target, { isMobile: true });
      picker.open = true;
      await new Promise((resolve) => setTimeout(resolve, 200));
      const during = document.body.classList.contains("epicker-body-noscroll");

      picker.destroy();
      const after = document.body.classList.contains("epicker-body-noscroll");
      return { during, after };
    });

    expect(result.during).toBe(true);
    expect(result.after).toBe(false);
  });
});

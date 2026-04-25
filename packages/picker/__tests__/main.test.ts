import Picker from "../src/main";
import PickerIndex from "../src/index";

describe("main.ts", () => {
  const pickers: Picker[] = [];

  afterEach(() => {
    pickers.forEach((picker) => {
      try {
        picker.destroy();
      } catch (_error) {
        // ignore cleanup errors in tests
      }
    });
    pickers.length = 0;
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  test("应该正确导出 Picker", () => {
    expect(Picker).toBe(PickerIndex);
  });

  test("导出的 Picker 应该是一个类", () => {
    expect(typeof Picker).toBe("function");
    expect(Picker.prototype.constructor).toBe(Picker);
  });

  test("应该能创建实例", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const picker = new Picker(container, {});
    pickers.push(picker);
    expect(picker).toBeInstanceOf(Picker);
  });
});

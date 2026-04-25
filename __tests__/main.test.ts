import Picker from "../packages/picker/src/main";
import PickerIndex from "../packages/picker/src/index";

describe("main.ts", () => {
  test("应该正确导出 Picker", () => {
    expect(Picker).toBe(PickerIndex);
  });

  test("导出的 Picker 应该是一个类", () => {
    expect(typeof Picker).toBe("function");
    expect(Picker.prototype.constructor).toBe(Picker);
  });

  test("应该能创建实例", () => {
    const container = document.createElement("div");
    const picker = new Picker(container, {});
    expect(picker).toBeInstanceOf(Picker);
  });
});

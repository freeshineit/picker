import pickerProvider from "../src/provider";
import Picker from "../src/index";

describe("PickerProvider", () => {
  let container: HTMLElement;
  let pickers: Picker[];

  const createPicker = (target: HTMLElement, options: ConstructorParameters<typeof Picker>[1] = {}) => {
    const picker = new Picker(target, options);
    pickers.push(picker);
    return picker;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    pickers = [];
    // 清空 pickers 数组
    pickerProvider.pickers = [];
  });

  afterEach(() => {
    pickers.forEach((picker) => {
      try {
        picker.destroy();
      } catch (_error) {
        // ignore cleanup errors in tests
      }
    });
    pickers = [];
    pickerProvider.pickers = [];
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  test("应该是单例模式", () => {
    const instance1 = pickerProvider;
    const instance2 = pickerProvider;
    expect(instance1).toBe(instance2);
  });

  test("应该能添加 picker", () => {
    const picker = createPicker(container);
    expect(pickerProvider.pickers).toContain(picker);
  });

  test("应该能移除 picker", () => {
    const picker = createPicker(container);
    expect(pickerProvider.pickers).toContain(picker);

    pickerProvider.remove(picker);
    expect(pickerProvider.pickers).not.toContain(picker);
  });

  test("移除不存在的 picker 应该显示警告", () => {
    const picker = createPicker(container);
    pickerProvider.remove(picker);

    const consoleSpy = jest.spyOn(console, "warn");
    pickerProvider.remove(picker);
    expect(consoleSpy).toHaveBeenCalledWith("Picker not found in the provider.");
  });

  test("closeOther 应该关闭其他 picker", () => {
    const container1 = document.createElement("div");
    const container2 = document.createElement("div");
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    const picker1 = createPicker(container1, { open: true });
    const picker2 = createPicker(container2, { open: true });

    expect(picker1.open).toBe(true);
    expect(picker2.open).toBe(true);

    const event = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(event, "target", { value: container1, enumerable: true });

    pickerProvider.closeOther(event);

    expect(picker1.open).toBe(true);
    expect(picker2.open).toBe(false);
  });
});

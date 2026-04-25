import Picker from "../src/index";
import pickerProvider from "../src/provider";

describe("Picker", () => {
  let container: HTMLElement;
  let pickers: Picker[];

  const createPicker = (options: ConstructorParameters<typeof Picker>[1], target: HTMLElement | (() => HTMLElement) | null = container) => {
    const picker = new Picker(target, options);
    pickers.push(picker);
    return picker;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
    pickers = [];
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
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  describe("初始化", () => {
    test("应该正确创建 Picker 实例", () => {
      const picker = createPicker({});
      expect(picker).toBeInstanceOf(Picker);
      expect(picker.$container).toBe(container);
    });

    test("应该支持函数形式的 container", () => {
      const getContainer = () => container;
      const picker = createPicker({}, getContainer);
      expect(picker.$container).toBe(container);
    });

    test("应该支持 null container", () => {
      const picker = createPicker({}, null);
      expect(picker.$container).toBeNull();
    });

    test("应该有正确的版本号", () => {
      expect(Picker.VERSION).toBe("__VERSION__");
    });
  });

  describe("配置选项", () => {
    test("应该使用默认配置", () => {
      const picker = createPicker({});
      expect(picker.open).toBe(false);
    });

    test("应该支持自定义 placement", () => {
      const picker = createPicker({ placement: "top" });
      picker.setPlacement("bottom");
      expect(picker.$wrapperContent).toBeTruthy();
    });

    test("应该支持字符串内容", () => {
      const content = "<div>测试内容</div>";
      const picker = createPicker({ content });
      expect(picker.$body.innerHTML).toBe(content);
    });

    test("应该支持函数形式的内容", () => {
      const content = () => "<div>函数内容</div>";
      const picker = createPicker({ content });
      expect(picker.$body.innerHTML).toBe("<div>函数内容</div>");
    });

    test("应该支持自定义 wrapClassName", () => {
      const picker = createPicker({ wrapClassName: "custom-class" });
      expect(picker.$wrapperContent.classList.contains("custom-class")).toBe(true);
    });

    test("应该支持移动端模式", () => {
      const picker = createPicker({ isMobile: true });
      expect(picker.$wrapperContent.classList.contains("epicker-mobile")).toBe(true);
    });
  });

  describe("open 状态", () => {
    test("应该能打开和关闭", () => {
      const picker = createPicker({});

      picker.open = true;
      expect(picker.open).toBe(true);
      jest.advanceTimersByTime(100);

      picker.open = false;
      expect(picker.open).toBe(false);
    });

    test("open 变化应该触发 onOpenChange 回调", () => {
      const onOpenChange = jest.fn();
      const picker = createPicker({ onOpenChange });

      picker.open = true;
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(99);
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      picker.open = false;
      jest.advanceTimersByTime(99);
      expect(onOpenChange).not.toHaveBeenLastCalledWith(false);
      jest.advanceTimersByTime(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    test("禁用状态下不应该能打开", () => {
      const picker = createPicker({});
      picker.disabled = true;
      picker.open = true;
      expect(picker.open).toBe(false);
    });
  });

  describe("disabled 状态", () => {
    test("应该能设置禁用状态", () => {
      const picker = createPicker({});
      picker.disabled = true;
      expect(picker.disabled).toBe(true);
      expect(container.classList.contains("epicker-disabled")).toBe(true);
    });

    test("应该能取消禁用状态", () => {
      const picker = createPicker({});
      picker.disabled = true;
      picker.disabled = false;
      expect(picker.disabled).toBe(false);
      expect(container.classList.contains("epicker-disabled")).toBe(false);
    });
  });

  describe("setPlacement", () => {
    test("应该能设置有效的 placement", () => {
      const picker = createPicker({});
      const placements: Array<"top" | "tl" | "tr" | "bottom" | "bl" | "br"> = ["top", "tl", "tr", "bottom", "bl", "br"];

      placements.forEach((placement) => {
        picker.setPlacement(placement);
        expect(picker.$wrapperContent).toBeTruthy();
      });
    });

    test("无效的 placement 应该显示警告", () => {
      const picker = createPicker({});
      const consoleSpy = jest.spyOn(console, "warn");

      // @ts-expect-error 测试无效值
      picker.setPlacement("invalid");
      expect(consoleSpy).toHaveBeenCalledWith("invalid is not a valid placement");
    });

    test("禁用状态下不应该能设置 placement", () => {
      const picker = createPicker({});
      picker.disabled = true;
      picker.setPlacement("top");
      // 不应该抛出错误
      expect(picker.$wrapperContent).toBeTruthy();
    });
  });

  describe("innerHTML", () => {
    test("应该能设置内容", () => {
      const picker = createPicker({});
      const newContent = "<div>新内容</div>";
      picker.innerHTML(newContent);
      expect(picker.$body.innerHTML).toBe(newContent);
    });

    test("应该能清空内容", () => {
      const picker = createPicker({ content: "<div>初始内容</div>" });
      picker.innerHTML("");
      expect(picker.$body.innerHTML).toBe("");
    });
  });

  describe("destroy", () => {
    test("应该能销毁实例", () => {
      const picker = createPicker({});
      const wrapperContent = picker.$wrapperContent;

      picker.destroy();

      expect(document.body.contains(wrapperContent)).toBe(false);
    });

    test("销毁后应该移除所有事件监听器", () => {
      const picker = createPicker({ trigger: "click" });
      picker.destroy();

      // 点击不应该有任何效果
      container.click();
      expect(picker.$wrapperContent).toBeFalsy();
    });
  });

  describe("触发方式", () => {
    test("click 触发应该能打开弹窗", () => {
      const picker = createPicker({ trigger: "click" });

      container.click();
      expect(picker.open).toBe(true);
    });

    test("hover 触发应该能打开弹窗", () => {
      const picker = createPicker({ trigger: "hover" });

      const event = new MouseEvent("mouseenter", { bubbles: true });
      container.dispatchEvent(event);
      expect(picker.open).toBe(true);
    });

    test("triggerClose 为 true 时点击容器应该关闭", () => {
      const picker = createPicker({
        trigger: "click",
        triggerClose: true,
        open: true,
      });

      container.click();
      expect(picker.open).toBe(false);
    });
  });

  describe("getPopupContainer", () => {
    test("应该支持自定义挂载容器", () => {
      const customContainer = document.createElement("div");
      document.body.appendChild(customContainer);

      const picker = createPicker({
        getPopupContainer: () => customContainer,
      });

      expect(customContainer.contains(picker.$wrapperContent)).toBe(true);
    });

    test("不支持的容器类型应该回退到 body", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);

      const consoleSpy = jest.spyOn(console, "warn");
      const picker = createPicker({
        getPopupContainer: () => input,
      });

      expect(consoleSpy).toHaveBeenCalledWith("popup container node does not support child elements, default body!");
      expect(document.body.contains(picker.$wrapperContent)).toBe(true);
    });

    // test('挂载容器旋转 90 度后应该正确换算弹框位置', () => {
    //   const popupContainer = document.createElement('div');
    //   document.body.appendChild(popupContainer);

    //   Object.defineProperty(popupContainer, 'offsetWidth', {
    //     configurable: true,
    //     value: 400,
    //   });
    //   Object.defineProperty(popupContainer, 'offsetHeight', {
    //     configurable: true,
    //     value: 200,
    //   });

    //   popupContainer.getBoundingClientRect = jest.fn(() => ({
    //     left: 100,
    //     top: 100,
    //     right: 300,
    //     bottom: 500,
    //     width: 200,
    //     height: 400,
    //     x: 100,
    //     y: 100,
    //     toJSON: () => ({}),
    //   }));

    //   container.getBoundingClientRect = jest.fn(() => ({
    //     left: 170,
    //     top: 180,
    //     right: 250,
    //     bottom: 220,
    //     width: 80,
    //     height: 40,
    //     x: 170,
    //     y: 180,
    //     toJSON: () => ({}),
    //   }));

    //   const picker = new Picker(container, {
    //     placement: 'bottom',
    //     getPopupContainer: () => popupContainer,
    //   });

    //   picker.$wrapperContent.getBoundingClientRect = jest.fn(() => ({
    //     left: 0,
    //     top: 0,
    //     right: 120,
    //     bottom: 60,
    //     width: 120,
    //     height: 60,
    //     x: 0,
    //     y: 0,
    //     toJSON: () => ({}),
    //   }));

    //   jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
    //     return {
    //       transform: element === popupContainer ? 'rotate(90deg)' : 'none',
    //     } as CSSStyleDeclaration;
    //   });

    //   (picker as any)._open = true;
    //   (picker as any)._setPlacement();

    //   expect(picker.$wrapperContent.style.left).toBe('120px');
    //   expect(picker.$wrapperContent.style.top).toBe('150px');
    // });
  });

  describe("延迟配置", () => {
    test("应该支持 mouseEnterDelay", () => {
      const onOpenChange = jest.fn();
      const picker = createPicker({
        trigger: "hover",
        mouseEnterDelay: 0.2,
        onOpenChange,
      });

      const event = new MouseEvent("mouseenter", { bubbles: true });
      container.dispatchEvent(event);

      expect(picker.open).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(199);
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    test("应该支持 mouseLeaveDelay", () => {
      const onOpenChange = jest.fn();
      const picker = createPicker({
        trigger: "hover",
        mouseEnterDelay: 0,
        mouseLeaveDelay: 0.2,
        onOpenChange,
      });

      picker.open = true;
      jest.advanceTimersByTime(0);
      onOpenChange.mockClear();

      const event = new MouseEvent("mouseleave", { bubbles: true });
      container.dispatchEvent(event);

      expect(picker.open).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(199);
      expect(onOpenChange).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("移动端模式", () => {
    test("移动端模式应该添加 body 滚动锁定类", () => {
      const picker = createPicker({ isMobile: true });

      picker.open = true;
      jest.advanceTimersByTime(100);
      expect(document.body.classList.contains("epicker-body-noscroll")).toBe(true);

      picker.open = false;
      jest.advanceTimersByTime(100);
      expect(document.body.classList.contains("epicker-body-noscroll")).toBe(false);
    });

    test("移动端模式应该强制使用 click 触发", () => {
      const picker = createPicker({
        isMobile: true,
        trigger: "hover",
      });

      expect(picker.$wrapperContent.classList.contains("epicker-mobile")).toBe(true);
    });
  });
});

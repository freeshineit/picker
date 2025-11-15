import type Picker from '.';

/**
 * PickerProvider 单例类
 */
class PickerProvider {
  private static instance: PickerProvider;

  pickers: Picker[] = [];
  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * 获取单例实例
   * @returns Picker 实例
   */
  public static getInstance(): PickerProvider {
    if (!PickerProvider.instance) {
      PickerProvider.instance = new PickerProvider();
    }
    return PickerProvider.instance;
  }

  /**
   * 添加picker
   * @param picker Picker 实例
   */
  public add(picker: Picker) {
    this.pickers.push(picker);
  }

  /**
   * 移除picker
   * @param picker Picker 实例
   */
  public remove(picker: Picker) {
    const index = this.pickers.indexOf(picker);
    if (index > -1) {
      this.pickers.splice(index, 1);
    } else {
      console.warn('Picker not found in the provider.');
    }
  }

  /**
   * 关闭其他picker
   * @param e 事件
   */
  public closeOther(e: Event) {
    for (const p of this.pickers) {
      if (p && !(e.target === p.$container || p.$container?.contains?.(e.target as Element) || e.target === p.$wrapperContent || p.$wrapperContent?.contains?.(e.target as Element))) {
        p.open = false;
      }
    }
  }
}

const pickerProvider = PickerProvider.getInstance();

export default pickerProvider;

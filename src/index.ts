import pickerProvider from './provider';

/**
 * picker 位置
 *
 * |   top    |     tl    |     tr    | bottom     |     bl     |     br     |
 * |:--------:|:---------:|:---------:|:----------:|:----------:|:----------:|
 * |  顶部中间 |  顶部左侧   |  顶部右侧  |   底部中间   |  底部左侧   |   底部右侧  |
 *
 * @public
 */

const _$PICKER_PLACEMENT$_ = ['top', 'tl', 'tr', 'bottom', 'bl', 'br'];
/** 展示位置
 *
 * |   top    |     tl    |     tr    | bottom    |     bl     |     br     |
 * |:--------:|:---------:|:---------:|:----------:|:----------:|:----------:|
 * |  顶部中间  |  顶部左侧  |  顶部右侧  |   底部中间   |  底部左侧   |   底部右侧  |
 *
 */
export type PickerPlacement = 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';

/**
 * Picker 配置项
 */
export interface PickerOptions {
  /** 弹出框外层容器($wrapperContent)的类名className */
  wrapClassName?: string;
  /** 是否展开，默认false */
  open?: boolean;
  /** 展示位置  */
  placement?: PickerPlacement;
  /** 通过x中的offset[0]和y中的offset[1]偏移源节点 */
  offset?: [number, number];
  /** 弹窗的z-index 默认 1000 */
  zIndex?: number;
  /** 弹窗内容 子元素需要能接受 mouseover、mouseleave事件 */
  content?: string | (() => string);
  /**
   * 触发行为
   *
   * |  click  |   hover  |
   * |:--------:|:--------:|
   * |   点击    |   悬停   |
   */
  trigger?: 'click' | 'hover';
  /** 鼠标移出后(mouseleave)延时多少才隐藏，单位：秒, 默认 0.1 */
  mouseLeaveDelay?: number;
  /** 鼠标移入后（mouseover）延时多少才隐藏，单位：秒, 默认 0.1 */
  mouseEnterDelay?: number;
  /**
   * 是否移动端, getPopupContainer, placement trigger 和 offset 不在生效
   * 内容会在窗口底部展示
   */
  isMobile?: boolean;
  /** 内容挂载节点 */
  getPopupContainer?: () => HTMLElement;
  /** 面板展开或关闭变化时触发 */
  onOpenChange?: (open: boolean) => void;
}

/**
 * 默认样式前缀
 */
const _$PICKER_PREFIX_CLS$_ = 'epicker';

/**
 * Picker 默认值
 */

const __$PICKER_DEFAULT_OPTIONS$__ = {
  getPopupContainer: () => document.body,
  wrapClassName: '',
  open: false,
  placement: 'br',
  offset: [0, 0],
  zIndex: 1000,
  content: '',
  trigger: 'click',
  mouseLeaveDelay: 0.1,
  mouseEnterDelay: 0.1,
  isMobile: false,
};

/**
 * Picker 弹窗, 支持 PC 和移动端
 * @remarks
 * Picker 是一个通用的弹窗组件，可以用于日期选择器、时间选择器等场景。
 * 它提供了丰富的配置选项，可以自定义弹窗的样式、位置、触发方式等。
 *
 * @example
 * ```ts
 * import "@skax/picker/dist/style/css";
 * import Picker from '@skax/picker';
 * const picker = new Picker(document.getElementById('picker-container'),
 * {
 *   placement: 'bottom',
 *   content: '<div>选择内容</div>', // or () => '<div>选择内容</div>'
 *   trigger: 'click',
 *   isMobile: false,
 * });
 * picker.open = true; // 打开弹窗
 * picker.setPlacement('top'); // 设置弹窗位置
 * picker.innerHTML('<div>新内容</div>'); // 设置弹窗内容（会覆盖之前的内容）
 * picker.destroy(); // 销毁弹窗
 * ```
 */
class Picker {
  /**
   * 版本号
   * @example
   * ```ts
   * Picker.VERSION; // 输出版本号
   * ```
   */
  static VERSION = '__VERSION__';

  /** 容器触发节点，当容器不存在，可以使用 picker.open 来触发打开 */
  $container: HTMLElement | null;
  /** picker 内容挂载节点 */
  private readonly _$popupContainer: HTMLElement;
  /** 内容节点 */
  $wrapperContent: HTMLElement;
  /** 内容主体节点 */
  $body!: HTMLElement;
  /** 是否打开 */
  private _open = false;
  private _OpenChange = false;
  /** 遮罩节点 */
  private _$mask!: HTMLElement;
  private readonly _options: Required<PickerOptions>;
  private _animationTimer: number | null = null;
  private _disabled = false;
  private _timer: number | null = null;

  // prettier-ignore
  /**
   * @description 创建一个 Picker 实例
   * @param {HTMLElement | (() => HTMLElement) | null} container - 容器元素，可以是 HTMLElement 或一个返回 HTMLElement 的函数。
   * @param {Partial<PickerOptions>} options - 选项对象，包含以下属性：
   * - `wrapClassName`: 前缀类名，默认为 ""。
   * - `isMobile`: 是否为移动端，默认为 false。
   */
  constructor(container: HTMLElement | (() => HTMLElement) | null, options: Partial<PickerOptions>) {
    // prettier-ignore
    this._options = Object.assign({}, __$PICKER_DEFAULT_OPTIONS$__, options || {}) as Required<PickerOptions>;
    // 移动端模式强制使用 click 触发
    if (this._options.isMobile) this._options.trigger = "click";
    pickerProvider.add(this);

    if (typeof container === "function") this.$container = container();
    else this.$container = container;

    this.$wrapperContent = document.createElement("div");
    this._initContentStyle();
    
    if (typeof this._options.getPopupContainer === "function") {
      this._$popupContainer = this._options.getPopupContainer();
    } else {
      this._$popupContainer = document.body;
    }
    if (["INPUT", "CANVAS", "VIDEO", "IMG"].includes(this._$popupContainer?.tagName)) {
      console.warn("popup container node does not support child elements, default body!");
      this._$popupContainer = document.body;
    }
    if (this._$popupContainer !== document.body) this._$popupContainer.style.position = "relative";
    this._$popupContainer?.appendChild(this.$wrapperContent);

    this._onContentClick = this._onContentClick.bind(this);
    this._onShow = this._onShow.bind(this);
    this._onWrapperShow = this._onWrapperShow.bind(this);
    this._onHide = this._onHide.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._eventListener();
    this.open = !!this._options.open;
  }

  /**
   * 获取当前打开状态
   * @example
   * ```ts
   * console.log(picker.open); // 获取当前打开状态
   * picker.open = true; // 打开
   * picker.open = false; // 关闭
   * ```
   */
  get open() {
    return this._open;
  }

  set open(open: boolean) {
    if (this._disabled) return;

    if (this._open !== !!open) {
      this._animationTimerClear();
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }

      if (open) {
        // prettier-ignore
        this._timer = setTimeout(() => {
            if (!this.$wrapperContent) return 
            this.$wrapperContent.style.display = "inline-flex";
            this.$wrapperContent.style.pointerEvents = "";
            // prettier-ignore
            if (this._options.isMobile) document.body.classList.add(`${_$PICKER_PREFIX_CLS$_}-body-noscroll`);
            this._animationTimer = setTimeout(() => {
              this._animationTimerClear();
              this.$wrapperContent.style.opacity = "1";
            }, 0);
            requestAnimationFrame(() => {
              this._setPlacement();
            });
            this._OpenChange = open;
            this._onOpenChange(open);
          },
          // prettier-ignore
          (this._options.mouseEnterDelay < 0 ? 0 : this._options.mouseEnterDelay) * 1000,
        );
      } else {
        // prettier-ignore
        this._timer = setTimeout(() => {
          if (!this.$wrapperContent) return 
            this.$wrapperContent.style.opacity = "0";
            this.$wrapperContent.style.pointerEvents = "none";
            // prettier-ignore
            if (this._options.isMobile) document.body.classList.remove(`${_$PICKER_PREFIX_CLS$_}-body-noscroll`);
            this._animationTimer = setTimeout(() => {
              this._animationTimerClear();
              this.$wrapperContent.style.display = "none";
            }, 301); // css 动画是 300ms
            this._OpenChange = open;
            this._onOpenChange(open);
          },
          // prettier-ignore
          (this._options.mouseLeaveDelay < 0 ? 0 : this._options.mouseLeaveDelay) * 1000,
        );
      }

      if (this._OpenChange === open) {
        if (this._timer) {
          clearTimeout(this._timer);
          this._timer = null;
        }
      }

      this._open = !!open;
    }
  }

  /**
   * 获取或设置禁用状态
   * @example
   * ```ts
   * picker.disabled = true; // 禁用
   * picker.disabled = false; // 启用
   * console.log(picker.disabled); // 获取禁用状态
   * ```
   */
  get disabled() {
    return this._disabled;
  }

  set disabled(disabled: boolean) {
    if (disabled) {
      this.$container?.classList?.add?.(`${_$PICKER_PREFIX_CLS$_}-disabled`);
    } else {
      this.$container?.classList?.remove?.(`${_$PICKER_PREFIX_CLS$_}-disabled`);
    }
    this._disabled = disabled;
  }

  /**
   * 设置弹出位置(移动端不生效)
   * @param placement - 弹出位置
   * @example
   * ```ts
   * picker.setPlacement("top");
   * picker.setPlacement("tl");
   * picker.setPlacement("tr");
   * picker.setPlacement("bottom");
   * picker.setPlacement("bl");
   * picker.setPlacement("br");
   * ```
   */
  setPlacement(placement: PickerPlacement) {
    if (this._disabled) return;
    if (_$PICKER_PLACEMENT$_.includes(placement)) {
      this._options.placement = placement;
    } else {
      console.warn(`${placement} is not a valid placement`);
    }
    this._setPlacement();
  }

  /**
   * 销毁
   * @example
   * ```ts
   * picker.destroy();
   * ```
   */
  destroy() {
    this._animationTimerClear();
    this._removeHtml();
    pickerProvider.remove(this);
    // this._$popupContainer 的 position 样式不会被移除
  }

  /**
   * 设置内容（会覆盖之前内容）
   * @param html - html 字符串内容
   * @example
   * ```ts
   * picker.innerHTML('<div>内容</div>');
   * ```
   */
  innerHTML(html?: string) {
    if (this.$body) {
      this.$body.innerHTML = html || '';
      this._setPlacement();
    }
  }

  // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  /**
   * picker 面板展开或关闭变化时触发
   * @param open - true: 展开, false:关闭
   */
  protected _onOpenChange(open: boolean) {
    this._options.onOpenChange?.(!!open);
  }

  /**
   * 移除动画定时器
   */
  private _animationTimerClear() {
    if (this._animationTimer) {
      clearTimeout(this._animationTimer);
      this._animationTimer = null;
    }
  }

  /**
   * 移除html
   */
  private _removeHtml() {
    this.$wrapperContent?.removeEventListener('click', this._onContentClick);
    this.$container?.removeEventListener?.('click', this._onContentClick);
    if (this._options.trigger === 'click') this.$container?.removeEventListener?.('click', this._onShow);
    if (this._options.trigger === 'hover') {
      this.$container?.removeEventListener?.('mouseenter', this._onShow);
      this.$container?.removeEventListener?.('mouseover', this._onShow);
      this.$container?.removeEventListener?.('mouseleave', this._onHide);
      // prettier-ignore
      this.$wrapperContent?.removeEventListener("mouseenter", this._onWrapperShow);
      this.$wrapperContent?.removeEventListener('mouseleave', this._onHide);
    }
    if (!this._options.isMobile) {
      window.removeEventListener('blur', this._onHide);

      document.removeEventListener('visibilitychange', this._onHide);

      window.removeEventListener('resize', this._onHide);

      document.removeEventListener('click', this._onDocumentClick);
    }

    if (this._$mask) {
      this._$mask.removeEventListener('click', this._onHide);
      this._$mask.remove();

      this._$mask = null!;
    }
    if (this._options.isMobile) document.body.classList.remove(`${_$PICKER_PREFIX_CLS$_}-body-noscroll`);

    if (this.$wrapperContent) {
      this.$wrapperContent.remove();

      this.$wrapperContent = null!;
    }
  }

  /**
   * 现实位置
   */
  private _setPlacement() {
    if (!this._open || this._options.isMobile || !this.$container) return;

    const $containerRect = this.$container?.getBoundingClientRect?.();
    const $wrapperContentRect = this.$wrapperContent.getBoundingClientRect();
    const $popupContainerRect = this._$popupContainer.getBoundingClientRect();

    // 容器的坐标 - 挂载的容器的坐标差
    // prettier-ignore
    const containerLeft = $containerRect.left - $popupContainerRect.left;
    const containerRight = -($containerRect.right - $popupContainerRect.right);
    // prettier-ignore
    const containerTop = $containerRect.y - $popupContainerRect.y;

    let left: number | undefined = containerLeft + ($containerRect.width - $wrapperContentRect.width) / 2;
    let right: number | undefined;
    const top = containerTop - $wrapperContentRect.height;
    const bottom = containerTop + $containerRect.height;

    if (/^t/.test(this._options.placement)) {
      switch (this._options.placement) {
        case 'top':
          right = undefined;
          break;
        case 'tl':
          right = undefined;
          left = containerLeft;
          break;
        case 'tr':
          left = undefined;
          right = containerRight;
          break;
        default:
          break;
      }
      this.$wrapperContent.style.cssText += `
        ${right !== undefined ? `right: ${right + (this._options.offset?.[0] || 0)}px;` : ''}
        ${left !== undefined ? `left: ${left + (this._options.offset?.[0] || 0)}px;` : ''}
        top: ${top + (this._options.offset?.[1] || 0)}px;
        z-index:${this._options.zIndex};
      `;
    } else if (/^b/.test(this._options.placement)) {
      switch (this._options.placement) {
        case 'bottom':
          right = undefined;
          break;
        case 'bl':
          right = undefined;
          left = containerLeft;
          break;
        case 'br':
          left = undefined;
          right = containerRight;
          break;
        default:
          break;
      }
      if (this.$wrapperContent)
        this.$wrapperContent.style.cssText += `
          ${right !== undefined ? `right: ${right + (this._options.offset?.[0] || 0)}px;` : ''}
          ${left !== undefined ? `left: ${left + (this._options.offset?.[0] || 0)}px;` : ''}
          top: ${bottom + (this._options.offset?.[1] || 0)}px;
          z-index:${this._options.zIndex};
        `;
    }
  }

  /**
   * 初始化内容样式
   */
  private _initContentStyle() {
    if (!this.$wrapperContent) return;
    // prettier-ignore
    this.$wrapperContent.classList.add(`${_$PICKER_PREFIX_CLS$_}`,`${_$PICKER_PREFIX_CLS$_}-wrapper`, `${_$PICKER_PREFIX_CLS$_}-${this._options.placement}`);
    // 提升优先级
    this.$wrapperContent.style.display = 'none';
    if (this._options.isMobile) {
      this.$wrapperContent.classList.add(`${_$PICKER_PREFIX_CLS$_}-mobile`);
      this._$mask = document.createElement('div');
      this._$mask.classList.add(`${_$PICKER_PREFIX_CLS$_}-mask`);
      this.$wrapperContent.appendChild(this._$mask);
    }
    this.$body = document.createElement('div');
    this.$body.classList.add(`${_$PICKER_PREFIX_CLS$_}-body`);
    this.$wrapperContent.appendChild(this.$body);

    if (typeof this._options.content === 'string') {
      this.innerHTML(this._options.content);
    } else if (typeof this._options.content === 'function') {
      this.innerHTML(this._options.content?.());
    }
    if (typeof this._options.wrapClassName === 'string') {
      try {
        this.$wrapperContent?.classList.add(...this._options.wrapClassName.split(' '));
      } catch (_error) {
        //
      }
    }
  }

  /**
   * 绑定事件
   */
  private _eventListener() {
    this.$wrapperContent.addEventListener('click', this._onContentClick);
    this.$container?.addEventListener?.('click', this._onContentClick);
    //
    if (this._options.trigger === 'click') this.$container?.addEventListener?.('click', this._onShow);
    if (this._options.trigger === 'hover') {
      this.$container?.addEventListener?.('mouseenter', this._onShow);
      this.$container?.addEventListener?.('mouseover', this._onShow);
      this.$container?.addEventListener?.('mouseleave', this._onHide);
      this.$wrapperContent.addEventListener('mouseenter', this._onWrapperShow);
      this.$wrapperContent.addEventListener('mouseleave', this._onHide);
    }
    if (this._$mask) this._$mask.addEventListener('click', this._onHide);
    if (!this._options.isMobile) {
      window.addEventListener('blur', this._onHide);

      document.addEventListener('visibilitychange', this._onHide);

      window.addEventListener('resize', this._onHide);

      document.addEventListener('click', this._onDocumentClick);
    }
  }

  /**
   * $wrapperContent click event
   * @param e - 内容点击事件
   */
  private _onContentClick(e: Event) {
    pickerProvider.closeOther(e);
  }

  /**
   * 显示事件
   */
  protected _onShow() {
    if (this._disabled) return;
    this.open = true;
  }

  /**
   * $wrapperContent 显示事件（输入进入前 为 false 阻止设置为 true）
   */
  private _onWrapperShow() {
    if (this._disabled) return;
    this._onShow();
  }

  /**
   * 隐藏事件
   */
  protected _onHide(e?: Event) {
    if (!this._open || this._disabled) return;
    if (e?.target === this._$mask) e?.stopPropagation();
    this.open = false;
  }

  /**
   * document 点击事件
   * @param event - 鼠标点击事件
   */
  private _onDocumentClick(event: Event) {
    if (
      !(
        this.$wrapperContent.contains(event.target as HTMLElement) ||
        this.$wrapperContent === event.target ||
        this.$container?.contains(event.target as HTMLElement) ||
        this.$container === event.target
      )
    ) {
      if (this._disabled) return;
      this._onHide();
    }
  }
}

export default Picker;

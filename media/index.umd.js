/**
 * picker component for js framework, support mobile and pc
 * 
 * @skax/picker v1.1.8-alpha.1
 * Copyright (c) 2025-12-12 ShineShao <xiaoshaoqq@gmail.com>
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Picker = factory());
})(this, (function () { 'use strict';

  function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
  }
  function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike) {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) {
          return {
            done: true
          };
        }
        return {
          done: false,
          value: o[i++]
        };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  /**
   * PickerProvider 单例类
   */
  var PickerProvider = /*#__PURE__*/function () {

    function PickerProvider() {
      this.pickers = [];
    }
    var _proto = PickerProvider.prototype;
    /**
    * 添加picker
    * @param picker Picker 实例
    */
    _proto.add = function add(picker) {
      this.pickers.push(picker);
    };
    /**
    * 移除picker
    * @param picker Picker 实例
    */
    _proto.remove = function remove(picker) {
      var index = this.pickers.indexOf(picker);
      if (index > -1) {
        this.pickers.splice(index, 1);
      } else {
        console.warn('Picker not found in the provider.');
      }
    };
    /**
    * 关闭其他picker
    * @param e 事件
    */
    _proto.closeOther = function closeOther(e) {
      for (var _iterator = _create_for_of_iterator_helper_loose(this.pickers), _step; !(_step = _iterator()).done;) {
        var p = _step.value;
        var _p_$container_contains, _p_$container, _p_$wrapperContent_contains, _p_$wrapperContent;
        if (p && !(e.target === p.$container || ((_p_$container = p.$container) == null ? void 0 : (_p_$container_contains = _p_$container.contains) == null ? void 0 : _p_$container_contains.call(_p_$container, e.target)) || e.target === p.$wrapperContent || ((_p_$wrapperContent = p.$wrapperContent) == null ? void 0 : (_p_$wrapperContent_contains = _p_$wrapperContent.contains) == null ? void 0 : _p_$wrapperContent_contains.call(_p_$wrapperContent, e.target)))) {
          p.open = false;
        }
      }
    };
    /**
    * 获取单例实例
    * @returns Picker 实例
    */
    PickerProvider.getInstance = function getInstance() {
      if (!PickerProvider.instance) {
        PickerProvider.instance = new PickerProvider();
      }
      return PickerProvider.instance;
    };
    return PickerProvider;
  }();
  var pickerProvider = PickerProvider.getInstance();

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    return Constructor;
  }
  /**
   * picker 位置
   *
   * |   top    |     tl    |     tr    | bottom     |     bl     |     br     |
   * |:--------:|:---------:|:---------:|:----------:|:----------:|:----------:|
   * |  顶部中间 |  顶部左侧   |  顶部右侧  |   底部中间   |  底部左侧   |   底部右侧  |
   *
   * @public
   */
  var _$PICKER_PLACEMENT$_ = ['top', 'tl', 'tr', 'bottom', 'bl', 'br'];
  /**
   * 默认样式前缀
   */
  var _$PICKER_PREFIX_CLS$_ = 'epicker';
  /**
   * Picker 默认值
   */
  var __$PICKER_DEFAULT_OPTIONS$__ = {
    getPopupContainer: function () {
      return document.body;
    },
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
    triggerClose: false
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
  var Picker = /*#__PURE__*/function () {

    function Picker(container, options) {
      var _this__$popupContainer, _this__$popupContainer1;
      /** 是否打开 */
      this._open = false;
      this._OpenChange = false;
      this._animationTimer = null;
      this._disabled = false;
      this._timer = null;
      // prettier-ignore
      this._options = Object.assign({}, __$PICKER_DEFAULT_OPTIONS$__, options || {});
      // 移动端模式强制使用 click 触发
      if (this._options.isMobile) this._options.trigger = "click";
      pickerProvider.add(this);
      if (typeof container === "function") this.$container = container();else this.$container = container;
      this.$wrapperContent = document.createElement("div");
      this._initContentStyle();
      if (typeof this._options.getPopupContainer === "function") {
        this._$popupContainer = this._options.getPopupContainer();
      } else {
        this._$popupContainer = document.body;
      }
      if (["INPUT", "CANVAS", "VIDEO", "IMG"].includes((_this__$popupContainer = this._$popupContainer) == null ? void 0 : _this__$popupContainer.tagName)) {
        console.warn("popup container node does not support child elements, default body!");
        this._$popupContainer = document.body;
      }
      if (this._$popupContainer !== document.body) this._$popupContainer.style.position = "relative";
      (_this__$popupContainer1 = this._$popupContainer) == null ? void 0 : _this__$popupContainer1.appendChild(this.$wrapperContent);
      this._onContentClick = this._onContentClick.bind(this);
      this._onShow = this._onShow.bind(this);
      this._onContainerClick = this._onContainerClick.bind(this);
      this._onWrapperShow = this._onWrapperShow.bind(this);
      this._onHide = this._onHide.bind(this);
      this._onDocumentClick = this._onDocumentClick.bind(this);
      this._eventListener();
      this.open = !!this._options.open;
    }
    var _proto = Picker.prototype;
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
    _proto.setPlacement = function setPlacement(placement) {
      if (this._disabled) return;
      if (_$PICKER_PLACEMENT$_.includes(placement)) {
        this._options.placement = placement;
      } else {
        console.warn("" + placement + " is not a valid placement");
      }
      this._setPlacement();
    };
    /**
    * 销毁
    * @example
    * ```ts
    * picker.destroy();
    * ```
    */
    _proto.destroy = function destroy() {
      this._animationTimerClear();
      this._removeHtml();
      pickerProvider.remove(this);
      // this._$popupContainer 的 position 样式不会被移除
    };
    /**
    * 设置内容（会覆盖之前内容）
    * @param html - html 字符串内容
    * @example
    * ```ts
    * picker.innerHTML('<div>内容</div>');
    * ```
    */
    _proto.innerHTML = function innerHTML(html) {
      if (this.$body) {
        this.$body.innerHTML = html || '';
        this._setPlacement();
      }
    };
    // --------------------------------------------------------------------------
    // Private methods
    // --------------------------------------------------------------------------
    /**
    * picker 面板展开或关闭变化时触发
    * @param open - true: 展开, false:关闭
    */
    _proto._onOpenChange = function _onOpenChange(open) {
      this._options.onOpenChange == null ? void 0 : this._options.onOpenChange.call(this._options, !!open);
    };
    /**
    * 移除动画定时器
    */
    _proto._animationTimerClear = function _animationTimerClear() {
      if (this._animationTimer) {
        clearTimeout(this._animationTimer);
        this._animationTimer = null;
      }
    };
    /**
    * 移除html
    */
    _proto._removeHtml = function _removeHtml() {
      var _this_$wrapperContent, _this_$container_removeEventListener, _this_$container, _this_$container_removeEventListener1, _this_$container1;
      (_this_$wrapperContent = this.$wrapperContent) == null ? void 0 : _this_$wrapperContent.removeEventListener('click', this._onContentClick);
      (_this_$container = this.$container) == null ? void 0 : (_this_$container_removeEventListener = _this_$container.removeEventListener) == null ? void 0 : _this_$container_removeEventListener.call(_this_$container, 'click', this._onContentClick);
      if (this._options.trigger === 'click') (_this_$container1 = this.$container) == null ? void 0 : (_this_$container_removeEventListener1 = _this_$container1.removeEventListener) == null ? void 0 : _this_$container_removeEventListener1.call(_this_$container1, 'click', this._onContainerClick);
      if (this._options.trigger === 'hover') {
        var _this_$container_removeEventListener2, _this_$container2, _this_$container_removeEventListener3, _this_$container3, _this_$container_removeEventListener4, _this_$container4,
          // prettier-ignore
          _this_$wrapperContent1, _this_$wrapperContent2;
        (_this_$container2 = this.$container) == null ? void 0 : (_this_$container_removeEventListener2 = _this_$container2.removeEventListener) == null ? void 0 : _this_$container_removeEventListener2.call(_this_$container2, 'mouseenter', this._onShow);
        (_this_$container3 = this.$container) == null ? void 0 : (_this_$container_removeEventListener3 = _this_$container3.removeEventListener) == null ? void 0 : _this_$container_removeEventListener3.call(_this_$container3, 'mouseover', this._onShow);
        (_this_$container4 = this.$container) == null ? void 0 : (_this_$container_removeEventListener4 = _this_$container4.removeEventListener) == null ? void 0 : _this_$container_removeEventListener4.call(_this_$container4, 'mouseleave', this._onHide);
        (_this_$wrapperContent1 = this.$wrapperContent) == null ? void 0 : _this_$wrapperContent1.removeEventListener("mouseenter", this._onWrapperShow);
        (_this_$wrapperContent2 = this.$wrapperContent) == null ? void 0 : _this_$wrapperContent2.removeEventListener('mouseleave', this._onHide);
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
        this._$mask = null;
      }
      if (this._options.isMobile) document.body.classList.remove("" + _$PICKER_PREFIX_CLS$_ + "-body-noscroll");
      if (this.$wrapperContent) {
        this.$wrapperContent.remove();
        this.$wrapperContent = null;
      }
    };
    /**
    * 现实位置
    */
    _proto._setPlacement = function _setPlacement() {
      var _this_$container_getBoundingClientRect, _this_$container;
      if (!this._open || this._options.isMobile || !this.$container) return;
      var $containerRect = (_this_$container = this.$container) == null ? void 0 : (_this_$container_getBoundingClientRect = _this_$container.getBoundingClientRect) == null ? void 0 : _this_$container_getBoundingClientRect.call(_this_$container);
      var $wrapperContentRect = this.$wrapperContent.getBoundingClientRect();
      var $popupContainerRect = this._$popupContainer.getBoundingClientRect();
      // 容器的坐标 - 挂载的容器的坐标差
      // prettier-ignore
      var containerLeft = Math.ceil($containerRect.left) - Math.ceil($popupContainerRect.left);
      var containerRight = -(Math.ceil($containerRect.right) - Math.ceil($popupContainerRect.right));
      // prettier-ignore
      var containerTop = Math.ceil($containerRect.y) - Math.ceil($popupContainerRect.y);
      var left = containerLeft + (Math.ceil($containerRect.width) - Math.ceil($wrapperContentRect.width)) / 2;
      var right;
      var top = containerTop - Math.ceil($wrapperContentRect.height);
      var bottom = containerTop + Math.ceil($containerRect.height);
      if (/^t/.test(this._options.placement)) {
        var _this__options_offset, _this__options_offset1, _this__options_offset2;
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
        }
        this.$wrapperContent.style.cssText += "\n        " + (right !== undefined ? "right: " + (right + (((_this__options_offset = this._options.offset) == null ? void 0 : _this__options_offset[0]) || 0)) + "px;" : '') + "\n        " + (left !== undefined ? "left: " + (left + (((_this__options_offset1 = this._options.offset) == null ? void 0 : _this__options_offset1[0]) || 0)) + "px;" : '') + "\n        top: " + (top + (((_this__options_offset2 = this._options.offset) == null ? void 0 : _this__options_offset2[1]) || 0)) + "px;\n        z-index:" + this._options.zIndex + ";\n      ";
      } else if (/^b/.test(this._options.placement)) {
        var _this__options_offset3, _this__options_offset4, _this__options_offset5;
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
        }
        if (this.$wrapperContent) this.$wrapperContent.style.cssText += "\n          " + (right !== undefined ? "right: " + (right + (((_this__options_offset3 = this._options.offset) == null ? void 0 : _this__options_offset3[0]) || 0)) + "px;" : '') + "\n          " + (left !== undefined ? "left: " + (left + (((_this__options_offset4 = this._options.offset) == null ? void 0 : _this__options_offset4[0]) || 0)) + "px;" : '') + "\n          top: " + (bottom + (((_this__options_offset5 = this._options.offset) == null ? void 0 : _this__options_offset5[1]) || 0)) + "px;\n          z-index:" + this._options.zIndex + ";\n        ";
      }
    };
    /**
    * 初始化内容样式
    */
    _proto._initContentStyle = function _initContentStyle() {
      if (!this.$wrapperContent) return;
      // prettier-ignore
      this.$wrapperContent.classList.add("" + _$PICKER_PREFIX_CLS$_, "" + _$PICKER_PREFIX_CLS$_ + "-wrapper", _$PICKER_PREFIX_CLS$_ + "-" + this._options.placement);
      // 提升优先级
      this.$wrapperContent.style.display = 'none';
      if (this._options.isMobile) {
        this.$wrapperContent.classList.add("" + _$PICKER_PREFIX_CLS$_ + "-mobile");
        this._$mask = document.createElement('div');
        this._$mask.classList.add("" + _$PICKER_PREFIX_CLS$_ + "-mask");
        this.$wrapperContent.appendChild(this._$mask);
      }
      this.$body = document.createElement('div');
      this.$body.classList.add("" + _$PICKER_PREFIX_CLS$_ + "-body");
      this.$wrapperContent.appendChild(this.$body);
      if (typeof this._options.content === 'string') {
        this.innerHTML(this._options.content);
      } else if (typeof this._options.content === 'function') {
        this.innerHTML(this._options.content == null ? void 0 : this._options.content.call(this._options));
      }
      if (typeof this._options.wrapClassName === 'string') {
        try {
          var _this_$wrapperContent_classList;
          var _this_$wrapperContent;
          (_this_$wrapperContent = this.$wrapperContent) == null ? void 0 : (_this_$wrapperContent_classList = _this_$wrapperContent.classList).add.apply(_this_$wrapperContent_classList, [].concat(this._options.wrapClassName.split(' ')));
        } catch (_error) {
          //
        }
      }
    };
    /**
    * 绑定事件
    */
    _proto._eventListener = function _eventListener() {
      var _this_$container_addEventListener, _this_$container, _this_$container_addEventListener1, _this_$container1;
      this.$wrapperContent.addEventListener('click', this._onContentClick);
      (_this_$container = this.$container) == null ? void 0 : (_this_$container_addEventListener = _this_$container.addEventListener) == null ? void 0 : _this_$container_addEventListener.call(_this_$container, 'click', this._onContentClick);
      //
      if (this._options.trigger === 'click') (_this_$container1 = this.$container) == null ? void 0 : (_this_$container_addEventListener1 = _this_$container1.addEventListener) == null ? void 0 : _this_$container_addEventListener1.call(_this_$container1, 'click', this._onContainerClick);
      if (this._options.trigger === 'hover') {
        var _this_$container_addEventListener2, _this_$container2, _this_$container_addEventListener3, _this_$container3, _this_$container_addEventListener4, _this_$container4;
        (_this_$container2 = this.$container) == null ? void 0 : (_this_$container_addEventListener2 = _this_$container2.addEventListener) == null ? void 0 : _this_$container_addEventListener2.call(_this_$container2, 'mouseenter', this._onShow);
        (_this_$container3 = this.$container) == null ? void 0 : (_this_$container_addEventListener3 = _this_$container3.addEventListener) == null ? void 0 : _this_$container_addEventListener3.call(_this_$container3, 'mouseover', this._onShow);
        (_this_$container4 = this.$container) == null ? void 0 : (_this_$container_addEventListener4 = _this_$container4.addEventListener) == null ? void 0 : _this_$container_addEventListener4.call(_this_$container4, 'mouseleave', this._onHide);
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
    };
    /**
    * $wrapperContent click event
    * @param e - 内容点击事件
    */
    _proto._onContentClick = function _onContentClick(e) {
      pickerProvider.closeOther(e);
    };
    /**
    * $container click event
    * @param event - 鼠标点击事件
    * @returns
    */
    _proto._onContainerClick = function _onContainerClick(event) {
      var _this_$wrapperContent_contains, _this_$wrapperContent;
      if (this._disabled) return;
      // wrapper contain
      var contain = ((_this_$wrapperContent = this.$wrapperContent) == null ? void 0 : (_this_$wrapperContent_contains = _this_$wrapperContent.contains) == null ? void 0 : _this_$wrapperContent_contains.call(_this_$wrapperContent, event.target)) || this.$wrapperContent === event.target;
      // open 状态下触发关闭
      if (this._options.triggerClose && this._options.trigger === 'click' && !contain) {
        this.open = !this.open;
      } else {
        this.open = true;
      }
    };
    /**
    * 显示事件
    */
    _proto._onShow = function _onShow() {
      if (this._disabled) return;
      this.open = true;
    };
    /**
    * $wrapperContent 显示事件（输入进入前 为 false 阻止设置为 true）
    */
    _proto._onWrapperShow = function _onWrapperShow() {
      if (this._disabled) return;
      this._onShow();
    };
    /**
    * 隐藏事件
    */
    _proto._onHide = function _onHide(e) {
      if (!this._open || this._disabled) return;
      if ((e == null ? void 0 : e.target) === this._$mask) e == null ? void 0 : e.stopPropagation();
      this.open = false;
    };
    /**
    * document 点击事件
    * @param event - 鼠标点击事件
    */
    _proto._onDocumentClick = function _onDocumentClick(event) {
      var _this_$container;
      if (!(this.$wrapperContent.contains(event.target) || this.$wrapperContent === event.target || ((_this_$container = this.$container) == null ? void 0 : _this_$container.contains(event.target)) || this.$container === event.target)) {
        if (this._disabled) return;
        this._onHide();
      }
    };
    _create_class(Picker, [{
      key: "open",
      get:
      /**
      * 获取当前打开状态
      * @example
      * ```ts
      * console.log(picker.open); // 获取当前打开状态
      * picker.open = true; // 打开
      * picker.open = false; // 关闭
      * ```
      */
      function get() {
        return this._open;
      },
      set: function set(open) {
        var _this = this;
        if (this._disabled) return;
        if (this._open !== !!open) {
          this._animationTimerClear();
          if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
          }
          if (open) {
            // prettier-ignore
            this._timer = setTimeout(function () {
              if (!_this.$wrapperContent) return;
              _this.$wrapperContent.style.display = "inline-flex";
              _this.$wrapperContent.style.pointerEvents = "";
              // prettier-ignore
              if (_this._options.isMobile) document.body.classList.add("" + _$PICKER_PREFIX_CLS$_ + "-body-noscroll");
              _this._animationTimer = setTimeout(function () {
                _this._animationTimerClear();
                _this.$wrapperContent.style.opacity = "1";
              }, 0);
              requestAnimationFrame(function () {
                _this._setPlacement();
              });
              _this._OpenChange = open;
              _this._onOpenChange(open);
            },
            // prettier-ignore
            (this._options.mouseEnterDelay < 0 ? 0 : this._options.mouseEnterDelay) * 1000);
          } else {
            // prettier-ignore
            this._timer = setTimeout(function () {
              if (!_this.$wrapperContent) return;
              _this.$wrapperContent.style.opacity = "0";
              _this.$wrapperContent.style.pointerEvents = "none";
              // prettier-ignore
              if (_this._options.isMobile) document.body.classList.remove("" + _$PICKER_PREFIX_CLS$_ + "-body-noscroll");
              _this._animationTimer = setTimeout(function () {
                _this._animationTimerClear();
                _this.$wrapperContent.style.display = "none";
              }, 301); // css 动画是 300ms
              _this._OpenChange = open;
              _this._onOpenChange(open);
            },
            // prettier-ignore
            (this._options.mouseLeaveDelay < 0 ? 0 : this._options.mouseLeaveDelay) * 1000);
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
    }, {
      key: "disabled",
      get:
      /**
      * 获取或设置禁用状态
      * @example
      * ```ts
      * picker.disabled = true; // 禁用
      * picker.disabled = false; // 启用
      * console.log(picker.disabled); // 获取禁用状态
      * ```
      */
      function get() {
        return this._disabled;
      },
      set: function set(disabled) {
        if (disabled) {
          var _this_$container_classList_add, _this_$container_classList, _this_$container;
          (_this_$container = this.$container) == null ? void 0 : (_this_$container_classList = _this_$container.classList) == null ? void 0 : (_this_$container_classList_add = _this_$container_classList.add) == null ? void 0 : _this_$container_classList_add.call(_this_$container_classList, "" + _$PICKER_PREFIX_CLS$_ + "-disabled");
        } else {
          var _this_$container_classList_remove, _this_$container_classList1, _this_$container1;
          (_this_$container1 = this.$container) == null ? void 0 : (_this_$container_classList1 = _this_$container1.classList) == null ? void 0 : (_this_$container_classList_remove = _this_$container_classList1.remove) == null ? void 0 : _this_$container_classList_remove.call(_this_$container_classList1, "" + _$PICKER_PREFIX_CLS$_ + "-disabled");
        }
        this._disabled = disabled;
      }
    }]);
    return Picker;
  }();
  /**
     * 版本号
     * @example
     * ```ts
     * Picker.VERSION; // 输出版本号
     * ```
     */
  Picker.VERSION = '1.1.8-alpha.1';

  return Picker;

}));

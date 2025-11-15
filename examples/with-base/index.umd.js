/**
 * drag scroll support move and touch
 *
 * @skax/drag-scroll v1.1.0-beta.2
 * Copyright (c) 2025-11-08 ShineShao <xiaoshaoqq@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), (global.DragScroll = factory()));
})(this, function () {
  'use strict';

  /**
   * 拖拽滚动状态
   */ function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    return Constructor;
  }
  /**
   * 默认参数
   */ var _$DRAG_SCROLL_DEFAULT_OPTIONS$_ = {
    content: '',
    height: '400px',
    readonly: false,
    hideScrollbar: false,
  };
  /**
   * 前缀类名
   */ var _$DRAG_SCROLL_PREFIX_CLASSNAME$_ = 'drag-scroll';
  /**
   * 拖拽滚动(使用 PointerEvent 统一处理鼠标和触摸事件)
   * @class DragScroll
   * @example
   * ```ts
   * const container = document.getElementById('scrollContainer');
   * const dragScroll = new DragScroll(container, {
   *   width: '300px',
   *   height: '500px',
   *   content: '<div>...</div>',
   * });
   * ```
   */ var DragScroll = /*#__PURE__*/ (function () {
    function DragScroll(container, options) {
      if (options === void 0) options = {};
      this._indicatorTimeout = null;
      /** 滚动条元素 */ this._$scrollbar = null;
      /** 滚动条指示器元素 */ this._$scrollbarThumb = null;
      /** 是否只读 */ this._readonly = false;
      this.$container = container;
      this.options = Object.assign({}, _$DRAG_SCROLL_DEFAULT_OPTIONS$_, options);
      this.$container.classList.add(_$DRAG_SCROLL_PREFIX_CLASSNAME$_, '' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-container');
      this.$content = document.createElement('div');
      this.$content.classList.add('' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-content');
      this.innerHtml(this.options.content);
      this.$container.appendChild(this.$content);
      this.isDragging = false;
      this._startY = 0;
      this.currentY = 0;
      this.velocity = 0;
      this._animationId = null;
      this._lastTimestamp = 0;
      // 物理参数
      this._spring = 0.25; // 弹性系数
      this._friction = 0.92; // 摩擦力
      this._bounceDamping = 0.6; // 边界反弹阻尼
      this._maxVelocity = 30; // 最大速度限制
      if (!this.options.hideScrollbar) {
        this._renderScrollbar();
      }
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this.readonly = this.options.readonly;
      this._init();
    }
    var _proto = DragScroll.prototype;
    /**
     * 设置容器尺寸
     * @param width 容器宽度
     * @param height 容器高度
     * @example
     * ```ts
     * dragScroll.resize(500, '400px');
     * dragScroll.resize('80%', '600px');
     * ```
     */ _proto.resize = function resize(width, height) {
      var css = '';
      if (/^\d+(\.\d+)?$/.test(width + '')) {
        css = 'width: ' + width + 'px;';
      } else if (typeof width === 'string') {
        css = 'width: ' + width + ';';
      }
      if (/^\d+(\.\d+)?$/.test(height + '')) {
        css += 'height: ' + height + 'px;';
      } else if (typeof height === 'string') {
        css += 'height: ' + height + ';';
      }
      this.$container.style.cssText += css;
      this._applyTransform();
    };
    /**
     * 设置 HTML 内容
     * @param html HTML 字符串或返回 HTML 字符串的函数
     * @example
     * ```ts
     * dragScroll.innerHtml('<div>New Content</div>');
     * dragScroll.innerHtml(() => '<div>Dynamic Content</div>');
     * ```
     */ _proto.innerHtml = function innerHtml(html) {
      this.$content.innerHTML = typeof html === 'function' ? html() : html;
      this._applyTransform();
    };
    /**
     * Y轴滚动到指定位置
     * @param y Y轴平移值 （需正值不支持负值）
     * @example
     * ```ts
     * dragScroll.scrollToY(200);
     * dragScroll.scrollToY(0); // 平移到顶部
     * dragScroll.scrollToY(-2); // 无效
     * ```
     */ _proto.scrollToY = function scrollToY(y, triggerChange) {
      if (triggerChange === void 0) triggerChange = true;
      var maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
      // 边界检查
      if (y < 0 || y > maxScroll) return;
      this.currentY = y;
      this.velocity = 0;
      this._applyTransform();
      if (triggerChange) this._updateState();
    };
    /**
     * 销毁方法，用于清理资源
     * @example
     * ```ts
     * dragScroll.destroy();
     * dragScroll = null;
     * ```
     */ _proto.destroy = function destroy() {
      var _this__$scrollbarThumb, _this__$scrollbar, _this_$content;
      if (this._animationId) {
        cancelAnimationFrame(this._animationId);
        this._animationId = null;
      }
      if (this._indicatorTimeout) {
        clearTimeout(this._indicatorTimeout);
        this._indicatorTimeout = null;
      }
      (_this__$scrollbarThumb = this._$scrollbarThumb) == null ? void 0 : _this__$scrollbarThumb.remove();
      this._$scrollbarThumb = null;
      (_this__$scrollbar = this._$scrollbar) == null ? void 0 : _this__$scrollbar.remove();
      this._$scrollbar = null;
      (_this_$content = this.$content) == null ? void 0 : _this_$content.remove();
      this.$content = null;
      this._removeEventListeners();
    };
    // ---------------------------------------------------------------------- //
    // 私有方法
    // ---------------------------------------------------------------------- //
    _proto._renderScrollbar = function _renderScrollbar() {
      this._$scrollbar = document.createElement('div');
      this._$scrollbar.className = '' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-scrollbar';
      this._$scrollbarThumb = document.createElement('div');
      this._$scrollbarThumb.className = '' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-scrollbar-thumb';
      this._$scrollbar.appendChild(this._$scrollbarThumb);
      this.$container.appendChild(this._$scrollbar);
    };
    // 初始化
    _proto._init = function _init() {
      this.resize(this.options.width, this.options.height);
      this._addEventListeners();
      // 初始化滚动条
      this._updateScrollbar();
      // 初始化动画
      this._animate();
    };
    //  ----------- 事件处理 -----------  //
    /**
     * 添加事件监听器
     */ _proto._addEventListeners = function _addEventListeners() {
      // 添加事件监听器
      this.$container.addEventListener('pointerdown', this._onMouseDown);
      document.addEventListener('pointermove', this._onMouseMove);
      // 务必同时监听 pointerup 和 pointercancel，都要做收尾和状态清理，否则会出现“拖动卡死”问题
      document.addEventListener('pointerup', this._onMouseUp); // 指针正常抬起时
      document.addEventListener('pointercancel', this._onMouseUp); // 指针操作被系统/外部原因打断时
    };
    /**
     * 移除事件监听器
     */ _proto._removeEventListeners = function _removeEventListeners() {
      this.$container.removeEventListener('touchmove', this._onTouchMove);
      // 移除事件监听器
      this.$container.removeEventListener('pointerdown', this._onMouseDown);
      document.removeEventListener('pointermove', this._onMouseMove);
      document.removeEventListener('pointerup', this._onMouseUp);
      document.removeEventListener('pointercancel', this._onMouseUp);
    };
    /**
     * 鼠标按下
     * @param e 鼠标事件
     */ _proto._onMouseDown = function _onMouseDown(e) {
      if (!this.canDrag) return;
      this._startDrag(e.clientY);
      this.options.onDragStart == null ? void 0 : this.options.onDragStart.call(this.options, e);
    };
    /**
     * 触摸移动
     * @param e 触摸移动事件
     */ _proto._onTouchMove = function _onTouchMove(e) {
      e.preventDefault();
    };
    /**
     * 开始拖拽
     * @param clientY 鼠标或触摸的 Y 坐标
     */ _proto._startDrag = function _startDrag(clientY) {
      var _this__$scrollbar_classList, _this__$scrollbar;
      if (!this.canDrag) return;
      this.isDragging = true;
      this._startY = clientY;
      this.velocity = 0;
      (_this__$scrollbar = this._$scrollbar) == null
        ? void 0
        : (_this__$scrollbar_classList = _this__$scrollbar.classList) == null
          ? void 0
          : _this__$scrollbar_classList.add('' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-show');
      // 更新光标样式
      this.$container.style.cursor = 'grabbing';
    };
    /**
     * 鼠标移动
     * @param e 鼠标事件
     */ _proto._onMouseMove = function _onMouseMove(e) {
      // e.preventDefault();
      if (!this.canDrag) return;
      if (!this.isDragging) return;
      this._drag(e.clientY);
      this.options.onDragging == null ? void 0 : this.options.onDragging.call(this.options, 0, this.currentY);
    };
    /**
     * 拖动
     * @param clientY 鼠标或触摸的 Y 坐标
     */ _proto._drag = function _drag(clientY) {
      if (!this.canDrag) return;
      var deltaY = this._startY - clientY;
      this._startY = clientY;
      // 更新位置
      this.currentY += deltaY;
      // 计算速度（用于惯性滚动）
      this.velocity = deltaY;
      // 限制速度
      this.velocity = Math.max(Math.min(this.velocity, this._maxVelocity), -this._maxVelocity);
      this._applyTransform();
      this._updateState();
    };
    /**
     * 鼠标释放
     */ _proto._onMouseUp = function _onMouseUp(e) {
      if (!this.canDrag) return;
      if (!this.isDragging) return;
      this.isDragging = false; // 停止拖动, 放置在最后
      this._endDrag();
      this.options.onDragEnd == null ? void 0 : this.options.onDragEnd.call(this.options, e);
    };
    /**
     * 结束拖动
     */ _proto._endDrag = function _endDrag() {
      var _this = this;
      // 恢复光标样式
      this.$container.style.cursor = 'grab';
      // 延迟隐藏滚动条
      setTimeout(function () {
        var _this__$scrollbar;
        if (!_this.isDragging) (_this__$scrollbar = _this._$scrollbar) == null ? void 0 : _this__$scrollbar.classList.remove('' + _$DRAG_SCROLL_PREFIX_CLASSNAME$_ + '-show');
      }, 1500);
    };
    /**
     * 平移内容
     */ _proto._applyTransform = function _applyTransform() {
      var clientHeight = this.$content.clientHeight;
      // 内容高度小于等于容器高度时，不进行滚动
      if (clientHeight <= this.$container.clientHeight) {
        this.$content.style.transform = 'translate3d(0, 0, 0)';
        return;
      }
      var maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
      // 边界检查与弹性效果
      if (this.currentY < 0) {
        // 超出顶部边界
        this.currentY = 0; // this.currentY * this._bounceDamping;
        this.velocity *= this._bounceDamping;
      } else if (this.currentY > maxScroll) {
        // 超出底部边界
        this.currentY = maxScroll; // maxScroll + (this.currentY - maxScroll) * this._bounceDamping;
        this.velocity *= this._bounceDamping;
      }
      // 应用 transform
      this.$content.style.transform = 'translate3d(0, ' + -this.currentY + 'px, 0)';
      this._updateScrollbar();
    };
    /**
     * 动画
     * @param timestamp 时间戳
     */ _proto._animate = function _animate(timestamp) {
      if (timestamp === void 0) timestamp = 0;
      var clientHeight = this.$content.clientHeight;
      // 内容高度小于等于容器高度时，不进行滚动
      if (clientHeight <= this.$container.clientHeight) {
        return;
      }
      if (!this._lastTimestamp) this._lastTimestamp = timestamp;
      var deltaTime = Math.min(timestamp - this._lastTimestamp, 100) / 16; // 限制最大时间增量
      this._lastTimestamp = timestamp;
      if (!this.isDragging) {
        // 惯性滚动
        this.velocity *= this._friction;
        this.currentY += this.velocity;
        // 弹性回弹
        var maxScroll = this.$content.scrollHeight - this.$container.clientHeight;
        if (this.currentY < 0) {
          // 顶部弹性
          this.velocity -= this.currentY * this._spring * deltaTime;
        } else if (this.currentY > maxScroll) {
          // 底部弹性
          this.velocity -= (this.currentY - maxScroll) * this._spring * deltaTime;
        }
        this._applyTransform();
        this._updateState();
        // 当速度足够小时停止动画
        if (Math.abs(this.velocity) < 0.1 && this.currentY >= 0 && this.currentY <= maxScroll) {
          this.velocity = 0;
        }
      }
      this._animationId = requestAnimationFrame(this._animate.bind(this));
    };
    /**
     * 更新滚动条
     */ _proto._updateScrollbar = function _updateScrollbar() {
      var containerHeight = this.$container.clientHeight;
      var contentHeight = this.$content.scrollHeight;
      var maxScroll = contentHeight - containerHeight;
      if (maxScroll <= 0) {
        if (this._$scrollbarThumb) this._$scrollbarThumb.style.height = '0';
        return;
      }
      // 计算滚动条高度和位置
      var thumbHeight = Math.max((containerHeight / contentHeight) * containerHeight, 20);
      var thumbPosition = (this.currentY / maxScroll) * (containerHeight - thumbHeight);
      if (this._$scrollbarThumb) {
        this._$scrollbarThumb.style.height = '' + thumbHeight + 'px';
        this._$scrollbarThumb.style.transform = 'translateY(' + thumbPosition + 'px)';
      }
    };
    /**
     * 更新统计信息
     */ _proto._updateState = function _updateState() {
      this.options.onChange == null
        ? void 0
        : this.options.onChange.call(this.options, {
            x: 0,
            y: this.currentY,
            velocity: +this.velocity.toFixed(1),
          });
    };
    _create_class(DragScroll, [
      {
        key: 'width',
        get: /**
         * 获取容器宽度
         * @example
         * ```ts
         * const width = dragScroll.width;
         * ```
         * @return {number}
         */ function get() {
          return this.$container.clientWidth;
        },
      },
      {
        key: 'height',
        get: /**
         * 获取容器高度
         * @example
         * ```ts
         * const height = dragScroll.height;
         * ```
         * @return {number}
         */ function get() {
          return this.$container.clientHeight;
        },
      },
      {
        key: 'readonly',
        get: /**
         * 只读属性
         */ function get() {
          return this._readonly;
        },
        set: function set(value) {
          if (this._readonly !== value) {
            this.$container.style.cursor = value ? 'not-allowed' : 'grab';
            this._readonly = value;
          }
          this.$container.removeEventListener('touchmove', this._onTouchMove);
          if (!value) {
            // 当非只读时，添加 touchmove 事件监听， 阻止透传到body默认滚动行为
            this.$container.addEventListener('touchmove', this._onTouchMove, {
              passive: false,
            }); //
          }
        },
      },
      {
        key: 'canDrag',
        get: /**
         * 内容是否可滚动
         */ function get() {
          var clientHeight = this.$content.clientHeight;
          return !this.readonly && clientHeight > this.$container.clientHeight;
        },
      },
    ]);
    return DragScroll;
  })();

  return DragScroll;
});

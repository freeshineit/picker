import Picker from '../src/index';
import type { PickerOptions } from '../src/index';

describe('Picker', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('初始化', () => {
    test('应该正确创建 Picker 实例', () => {
      const picker = new Picker(container, {});
      expect(picker).toBeInstanceOf(Picker);
      expect(picker.$container).toBe(container);
    });

    test('应该支持函数形式的 container', () => {
      const getContainer = () => container;
      const picker = new Picker(getContainer, {});
      expect(picker.$container).toBe(container);
    });

    test('应该支持 null container', () => {
      const picker = new Picker(null, {});
      expect(picker.$container).toBeNull();
    });

    test('应该有正确的版本号', () => {
      expect(Picker.VERSION).toBe('__VERSION__');
    });
  });

  describe('配置选项', () => {
    test('应该使用默认配置', () => {
      const picker = new Picker(container, {});
      expect(picker.open).toBe(false);
    });

    test('应该支持自定义 placement', () => {
      const picker = new Picker(container, { placement: 'top' });
      picker.setPlacement('bottom');
      expect(picker.$wrapperContent).toBeTruthy();
    });

    test('应该支持字符串内容', () => {
      const content = '<div>测试内容</div>';
      const picker = new Picker(container, { content });
      expect(picker.$body.innerHTML).toBe(content);
    });

    test('应该支持函数形式的内容', () => {
      const content = () => '<div>函数内容</div>';
      const picker = new Picker(container, { content });
      expect(picker.$body.innerHTML).toBe('<div>函数内容</div>');
    });

    test('应该支持自定义 wrapClassName', () => {
      const picker = new Picker(container, { wrapClassName: 'custom-class' });
      expect(picker.$wrapperContent.classList.contains('custom-class')).toBe(true);
    });

    test('应该支持移动端模式', () => {
      const picker = new Picker(container, { isMobile: true });
      expect(picker.$wrapperContent.classList.contains('epicker-mobile')).toBe(true);
    });
  });

  describe('open 状态', () => {
    test('应该能打开和关闭', done => {
      const picker = new Picker(container, {});

      picker.open = true;
      expect(picker.open).toBe(true);

      setTimeout(() => {
        picker.open = false;
        expect(picker.open).toBe(false);
        done();
      }, 150);
    });

    test('open 变化应该触发 onOpenChange 回调', done => {
      const onOpenChange = jest.fn();
      const picker = new Picker(container, { onOpenChange });

      picker.open = true;

      setTimeout(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
        picker.open = false;

        setTimeout(() => {
          expect(onOpenChange).toHaveBeenCalledWith(false);
          done();
        }, 150);
      }, 150);
    });

    test('禁用状态下不应该能打开', () => {
      const picker = new Picker(container, {});
      picker.disabled = true;
      picker.open = true;
      expect(picker.open).toBe(false);
    });
  });

  describe('disabled 状态', () => {
    test('应该能设置禁用状态', () => {
      const picker = new Picker(container, {});
      picker.disabled = true;
      expect(picker.disabled).toBe(true);
      expect(container.classList.contains('epicker-disabled')).toBe(true);
    });

    test('应该能取消禁用状态', () => {
      const picker = new Picker(container, {});
      picker.disabled = true;
      picker.disabled = false;
      expect(picker.disabled).toBe(false);
      expect(container.classList.contains('epicker-disabled')).toBe(false);
    });
  });

  describe('setPlacement', () => {
    test('应该能设置有效的 placement', () => {
      const picker = new Picker(container, {});
      const placements: Array<'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br'> = ['top', 'tl', 'tr', 'bottom', 'bl', 'br'];

      placements.forEach(placement => {
        picker.setPlacement(placement);
        expect(picker.$wrapperContent).toBeTruthy();
      });
    });

    test('无效的 placement 应该显示警告', () => {
      const picker = new Picker(container, {});
      const consoleSpy = jest.spyOn(console, 'warn');

      // @ts-expect-error 测试无效值
      picker.setPlacement('invalid');
      expect(consoleSpy).toHaveBeenCalledWith('invalid is not a valid placement');
    });

    test('禁用状态下不应该能设置 placement', () => {
      const picker = new Picker(container, {});
      picker.disabled = true;
      picker.setPlacement('top');
      // 不应该抛出错误
      expect(picker.$wrapperContent).toBeTruthy();
    });
  });

  describe('innerHTML', () => {
    test('应该能设置内容', () => {
      const picker = new Picker(container, {});
      const newContent = '<div>新内容</div>';
      picker.innerHTML(newContent);
      expect(picker.$body.innerHTML).toBe(newContent);
    });

    test('应该能清空内容', () => {
      const picker = new Picker(container, { content: '<div>初始内容</div>' });
      picker.innerHTML('');
      expect(picker.$body.innerHTML).toBe('');
    });
  });

  describe('destroy', () => {
    test('应该能销毁实例', () => {
      const picker = new Picker(container, {});
      const wrapperContent = picker.$wrapperContent;

      picker.destroy();

      expect(document.body.contains(wrapperContent)).toBe(false);
    });

    test('销毁后应该移除所有事件监听器', () => {
      const picker = new Picker(container, { trigger: 'click' });
      picker.destroy();

      // 点击不应该有任何效果
      container.click();
      expect(picker.$wrapperContent).toBeFalsy();
    });
  });

  describe('触发方式', () => {
    test('click 触发应该能打开弹窗', done => {
      const picker = new Picker(container, { trigger: 'click' });

      container.click();

      setTimeout(() => {
        expect(picker.open).toBe(true);
        done();
      }, 150);
    });

    test('hover 触发应该能打开弹窗', done => {
      const picker = new Picker(container, { trigger: 'hover' });

      const event = new MouseEvent('mouseenter', { bubbles: true });
      container.dispatchEvent(event);

      setTimeout(() => {
        expect(picker.open).toBe(true);
        done();
      }, 150);
    });

    test('triggerClose 为 true 时点击容器应该关闭', done => {
      const picker = new Picker(container, {
        trigger: 'click',
        triggerClose: true,
        open: true,
      });

      setTimeout(() => {
        container.click();

        setTimeout(() => {
          expect(picker.open).toBe(false);
          done();
        }, 150);
      }, 150);
    });
  });

  describe('getPopupContainer', () => {
    test('应该支持自定义挂载容器', () => {
      const customContainer = document.createElement('div');
      document.body.appendChild(customContainer);

      const picker = new Picker(container, {
        getPopupContainer: () => customContainer,
      });

      expect(customContainer.contains(picker.$wrapperContent)).toBe(true);
    });

    test('不支持的容器类型应该回退到 body', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);

      const consoleSpy = jest.spyOn(console, 'warn');
      const picker = new Picker(container, {
        getPopupContainer: () => input,
      });

      expect(consoleSpy).toHaveBeenCalledWith('popup container node does not support child elements, default body!');
      expect(document.body.contains(picker.$wrapperContent)).toBe(true);
    });
  });

  describe('延迟配置', () => {
    test('应该支持 mouseEnterDelay', done => {
      const picker = new Picker(container, {
        trigger: 'hover',
        mouseEnterDelay: 0.2,
      });

      const event = new MouseEvent('mouseenter', { bubbles: true });
      container.dispatchEvent(event);

      // 延迟后应该打开
      setTimeout(() => {
        expect(picker.open).toBe(true);
        done();
      }, 250);
    });

    test('应该支持 mouseLeaveDelay', done => {
      const picker = new Picker(container, {
        trigger: 'hover',
        mouseLeaveDelay: 0.2,
      });

      // 先打开
      picker.open = true;

      setTimeout(() => {
        const event = new MouseEvent('mouseleave', { bubbles: true });
        container.dispatchEvent(event);

        // 延迟后应该关闭
        setTimeout(() => {
          expect(picker.open).toBe(false);
          done();
        }, 250);
      }, 200);
    });
  });

  describe('移动端模式', () => {
    test('移动端模式应该添加 body 滚动锁定类', done => {
      const picker = new Picker(container, { isMobile: true });

      picker.open = true;

      setTimeout(() => {
        expect(document.body.classList.contains('epicker-body-noscroll')).toBe(true);

        picker.open = false;

        setTimeout(() => {
          expect(document.body.classList.contains('epicker-body-noscroll')).toBe(false);
          done();
        }, 350);
      }, 150);
    });

    test('移动端模式应该强制使用 click 触发', () => {
      const picker = new Picker(container, {
        isMobile: true,
        trigger: 'hover',
      });

      expect(picker.$wrapperContent.classList.contains('epicker-mobile')).toBe(true);
    });
  });
});

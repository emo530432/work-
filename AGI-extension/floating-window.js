// 使用IIFE封装代码，避免全局污染
(function() {
  'use strict';

  class FloatingWindow {
    constructor() {
      this.window = null;
      this.isVisible = false;
      this.isCollapsed = false;
    }

    create() {
      if (this.window) return;

      // 创建主容器
      this.window = document.createElement('div');
      this.window.id = 'agi-shortcut-help';
      Object.assign(this.window.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(255,255,255,0.98)',
        border: '1px solid #1890ff',
        borderRadius: '10px',
        padding: '15px',
        width: '300px',
        maxHeight: '80vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
        cursor: 'move',
        transition: 'all 0.3s ease',
        lineHeight: '1.6'
      });

      // 创建内容区域
      const content = document.createElement('div');
      content.id = 'agi-shortcut-content';
      content.style.transition = 'all 0.3s ease';
      content.style.overflow = 'hidden';

      // 内容HTML (移除了关于吸附的提示文字)
      content.innerHTML = `
        <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;padding:8px 0;">
          <div style="font-weight:bold;color:#333;text-align:right;">1</div>
          <div>Body添加</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">2</div>
          <div>Prune添加</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">3</div>
          <div>提取内容</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">Tab</div>
          <div>跳到父节点</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">~</div>
          <div>回退操作</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">Del×2</div>
          <div>删除当前行（二次确认）</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">↑/↓</div>
          <div>上下移动当前行</div>
          
          <div style="font-weight:bold;color:#333;text-align:right;">Ctrl+S</div>
          <div>保存当前进度</div>
        </div>
        <div style="margin-top:12px;padding-top:8px;border-top:1px solid #f0f0f0;font-size:13px;color:#666;">
          <div>选择【标签】作为锚点可移动</div>
          <div>💡 提示：拖动标题栏可移动面板</div>
        </div>
      `;

      // 标题栏HTML
      this.window.innerHTML = `
        <div id="help-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;cursor:move;">
          <h3 style="margin:0;color:#1890ff;font-size:18px;font-weight:600;display:flex;align-items:center;">
            <span id="toggle-icon" style="display:inline-block;width:24px;height:24px;background:#1890ff;color:white;border-radius:50%;text-align:center;line-height:24px;margin-right:8px;cursor:pointer;">−</span>
            AGI标注快捷键指南
          </h3>
          <button id="closeHelp" style="background:none;border:none;color:#999;font-size:20px;cursor:pointer;padding:0 4px;">×</button>
        </div>
      `;
      this.window.appendChild(content);

      // 元素引用
      this.header = this.window.querySelector('#help-header');
      this.toggleIcon = this.window.querySelector('#toggle-icon');
      this.closeBtn = this.window.querySelector('#closeHelp');
      this.content = content;

      // 添加事件监听
      this._setupEventListeners();
      document.body.appendChild(this.window);
      this.isVisible = true;
    }

    _setupEventListeners() {
      // 切换折叠/展开状态
      this.toggleIcon.addEventListener('click', () => this.toggleCollapse());
      
      // 关闭按钮
      this.closeBtn.addEventListener('click', () => this.hide());
      
      // 拖动功能
      let isDragging = false;
      let offsetX, offsetY;

      this.header.addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.id !== 'toggle-icon') {
          isDragging = true;
          offsetX = e.clientX - this.window.offsetLeft;
          offsetY = e.clientY - this.window.offsetTop;
          this.window.style.cursor = 'grabbing';
          this.window.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
          this.window.style.transition = 'none';
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          this.window.style.left = `${e.clientX - offsetX}px`;
          this.window.style.top = `${e.clientY - offsetY}px`;
          this.window.style.right = 'auto';
          this.window.style.bottom = 'auto';
        }
      });

      document.addEventListener('mouseup', (e) => {
        if (isDragging) {
          isDragging = false;
          this.window.style.cursor = 'move';
          this.window.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          this.window.style.transition = 'all 0.3s ease';
        }
      });

      // 悬停效果
      this.window.addEventListener('mouseenter', () => {
        if (!isDragging) {
          this.window.style.transform = 'translateY(-2px)';
        }
      });
      
      this.window.addEventListener('mouseleave', () => {
        this.window.style.transform = '';
      });
    }

    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      if (this.isCollapsed) {
        this.content.style.maxHeight = '0';
        this.content.style.padding = '0';
        this.content.style.margin = '0';
        this.content.style.opacity = '0';
        this.toggleIcon.textContent = '+';
        this.window.style.width = '200px';
      } else {
        this.content.style.maxHeight = '500px';
        this.content.style.padding = '8px 0';
        this.content.style.margin = '';
        this.content.style.opacity = '1';
        this.toggleIcon.textContent = '−';
        this.window.style.width = '300px';
      }
    }

    show() {
      if (!this.window) {
        this.create();
      } else {
        this.window.style.display = 'block';
        this.isVisible = true;
      }
    }

    hide() {
      if (this.window) {
        this.window.style.transform = 'scale(0.9)';
        setTimeout(() => {
          this.window.style.display = 'none';
          this.isVisible = false;
        }, 200);
      }
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  // 暴露到全局对象
  window.AGI = window.AGI || {};
  window.AGI.FloatingWindow = FloatingWindow;
  window.AGI.showShortcutHelp = function() {
    if (!window.AGI.floatingWindow) {
      window.AGI.floatingWindow = new FloatingWindow();
    }
    window.AGI.floatingWindow.show();
  };
})();
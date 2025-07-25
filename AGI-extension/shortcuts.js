// shortcuts.js
(() => {
  'use strict';

  window.AGI_Shortcuts = (function() {
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

    /* ---------- 通用函数 ---------- */
    const findDeleteBtn = (row) => {
      const a = $('a', row);
      return (a && a.textContent.trim() === '删除') ? a : null;
    };
    
    const findMoveBtn = (row, direction) => {
      const links = $$('a', row);
      return links.find(a => a.textContent.trim() === direction);
    };
    
    const highlight = (row) => {
      $$('.ant-table-row').forEach((r) => {
        r.style.backgroundColor = '';
      });
      if (row) {
        row.style.backgroundColor = '#e6f7ff';
      }
    };

    const findFirstLabelRow = () => {
      const rows = $$('.ant-table-row');
      for (const row of rows) {
        const labelSpan = $('.ant-select-selection-item-content', row);
        if (labelSpan && labelSpan.textContent.trim() === '标签') {
          return row;
        }
      }
      return null;
    };

    /* ---------- 删除逻辑 ---------- */
    let step = 0;
    let resetTimer = null;
    const resetState = () => { step = 0; };
    const clickConfirm = () => $('.ant-popconfirm-buttons .ant-btn-primary')?.click();

    const deleteCurrent = () => {
      const row = $('.ant-table-row:hover') || $('.ant-table-row-selected') || findFirstLabelRow();
      if (!row) return false;
      const delBtn = findDeleteBtn(row);
      if (!delBtn) return false;

      if (step === 0) {
        highlight(row);
        delBtn.click();
        step = 1;
        resetTimer = setTimeout(resetState, 3000);
      } else if (step === 1) {
        clickConfirm();
        clearTimeout(resetTimer);
        resetState();
      }
      return true;
    };

    /* ---------- 移动逻辑 ---------- */
    const moveCurrent = (direction) => {
      const row = $('.ant-table-row:hover') || $('.ant-table-row-selected') || findFirstLabelRow();
      if (!row) return false;
      
      const moveBtn = findMoveBtn(row, direction === 'up' ? '上移' : '下移');
      if (!moveBtn) return false;
      
      highlight(row);
      moveBtn.click();
      return true;
    };

    /* ---------- 按钮点击 ---------- */
    const clickBtnByIndex = (sel, idx) => $$(sel)[idx]?.click();
    const clickText = (txt) => {
      for (const b of $$('button')) {
        if (b.textContent.trim() === txt) { b.click(); return true; }
      }
      return false;
    };

    /* ---------- XPath 悬停高亮 ---------- */
    const setupXpathHover = () => {
      document.addEventListener('mouseover', (e) => {
        const t = e.target;
        if (t.textContent?.includes('xpath') || t.classList.contains('xpath-element')) {
          t.style.backgroundColor = '#fff2e8';
          t.style.transition = 'background-color .3s';
        }
      });
      document.addEventListener('mouseout', (e) => {
        const t = e.target;
        if (t.textContent?.includes('xpath') || t.classList.contains('xpath-element')) {
          t.style.backgroundColor = '';
        }
      });
    };

    /* ---------- 键盘绑定 ---------- */
    const bindKeys = () => {
      document.addEventListener('keydown', (e) => {
        if (e.isComposing) return;

        if (e.key === 'Delete') {
          e.preventDefault();
          if (!deleteCurrent()) console.warn('[TM] 未找到可删除行');
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!moveCurrent('up')) console.warn('[TM] 未找到"上移"按钮');
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!moveCurrent('down')) console.warn('[TM] 未找到"下移"按钮');
          return;
        }

        if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
          if (e.code === 'Digit1') { e.preventDefault(); clickBtnByIndex('.ant-btn-primary.ant-btn-sm', 0); }
          else if (e.code === 'Digit2') { e.preventDefault(); clickBtnByIndex('.ant-btn-primary.ant-btn-sm', 1); }
          else if (e.code === 'Digit3') { e.preventDefault(); clickText('提取内容'); }
          else if (e.code === 'Tab') {
            e.preventDefault();
            clickText('跳到父节点');
          }
          else if (e.code === 'Backquote') {
            e.preventDefault();
            clickText('回 退');
          }
        }

        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          clickText('暂 存') || console.warn('[TM] 未找到"暂存"按钮');
        }
      });
    };

    return {
      bindKeys,
      setupXpathHover
    };
  })();
})();
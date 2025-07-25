// textCounter.js - Universal text counter for all websites
(() => {
  'use strict';

  class TextCounter {
    constructor() {
      this.initStyles();
      this.createTooltip();
      this.setupEventListeners();
    }

    initStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #textCounterPro {
          position: fixed;
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          z-index: 99999;
          font-family: 'Microsoft YaHei', Arial, sans-serif;
          font-size: 14px;
          display: none;
          pointer-events: none;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          max-width: 320px;
          line-height: 1.5;
          backdrop-filter: blur(2px);
        }
        #textCounterPro div {
          margin: 3px 0;
        }
        #textCounterPro .highlight {
          color: #4fc3f7;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }

    createTooltip() {
      this.tip = document.createElement('div');
      this.tip.id = 'textCounterPro';
      document.body.appendChild(this.tip);
    }

    classifyCharacter(char) {
      if (/[\u4e00-\u9fa5]/.test(char)) return 'chinese';
      if (/[a-zA-Z]/.test(char)) return 'english';
      if (/[0-9]/.test(char)) return 'number';
      return 'punctuation';
    }

    advancedTextCount(text) {
      let counts = {
        chinese: 0,
        englishWords: 0,
        englishChars: 0,
        numbers: 0,
        numberChars: 0,
        punctuation: 0
      };

      let inEnglishWord = false;
      let inNumber = false;

      for (let char of text) {
        const type = this.classifyCharacter(char);

        switch(type) {
          case 'chinese':
            counts.chinese++;
            inEnglishWord = false;
            inNumber = false;
            break;
          case 'english':
            counts.englishChars++;
            if (!inEnglishWord) {
              counts.englishWords++;
              inEnglishWord = true;
            }
            inNumber = false;
            break;
          case 'number':
            counts.numberChars++;
            if (!inNumber) {
              counts.numbers++;
              inNumber = true;
            }
            inEnglishWord = false;
            break;
          default:
            counts.punctuation++;
            inEnglishWord = false;
            inNumber = false;
        }
      }

      counts.meaningfulCount = counts.englishWords + counts.chinese + counts.numbers;
      counts.total = text.length;
      
      return counts;
    }

    handleSelection(e) {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0) {
        const counts = this.advancedTextCount(text);

        this.tip.innerHTML = `
          <div><span class="highlight">单词+汉字+数字: ${counts.meaningfulCount}</span></div>
          <div>中文汉字: ${counts.chinese}</div>
          <div>英文单词: ${counts.englishWords} (${counts.englishChars}字母)</div>
          <div>阿拉伯数字: ${counts.numbers} (${counts.numberChars}数字)</div>
          <div>标点空格: ${counts.punctuation}</div>
        `;

        this.tip.style.display = 'block';
        this.positionTooltip(e);
        this.setupAutoHide();
      } else {
        this.tip.style.display = 'none';
      }
    }

    positionTooltip(e) {
      const x = Math.min(e.pageX + 15, window.innerWidth - this.tip.offsetWidth - 10);
      const y = Math.min(e.pageY + 15, window.innerHeight - this.tip.offsetHeight - 10);
      this.tip.style.left = x + 'px';
      this.tip.style.top = y + 'px';
    }

    setupAutoHide() {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      
      this.hideTimer = setTimeout(() => {
        this.tip.style.display = 'none';
      }, 3500);

      this.tip.addEventListener('mouseenter', () => {
        clearTimeout(this.hideTimer);
      });

      this.tip.addEventListener('mouseleave', () => {
        this.tip.style.display = 'none';
      });
    }

    setupEventListeners() {
      document.addEventListener('mouseup', (e) => this.handleSelection(e));
      document.addEventListener('mousedown', (e) => {
        if (!this.tip.contains(e.target) && this.tip.style.display === 'block') {
          this.tip.style.display = 'none';
        }
      });
    }
  }

  // Initialize only once per frame
  if (!window.textCounterInitialized) {
    window.textCounterInitialized = true;
    new TextCounter();
  }
})();
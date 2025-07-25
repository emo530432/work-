// content.js
(function() {
    'use strict';

    function waitForDependencies() {
        if (!window.AGI || !window.AGI.showShortcutHelp || !window.AGI_Shortcuts) {
            setTimeout(waitForDependencies, 100);
            return;
        }

        window.AGI_Shortcuts.bindKeys();
        window.AGI_Shortcuts.setupXpathHover();
        window.AGI.showShortcutHelp();
    }

    // 不需要再等待表格，因为 tagValidator.js 已经处理了
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }
})();
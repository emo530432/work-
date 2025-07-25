// tagValidator.js
(function() {
    'use strict';

    const ALLOW_TAGS = ['标题', '发布时间', '']; // 允许的标签

    // 初始化标签验证器
    function initTagValidator() {
        // 创建标签错误提示框
        const tagErrorBox = document.createElement('div');
        tagErrorBox.id = 'tag-error';
        tagErrorBox.style.cssText = `
            position:fixed; top:12px; right:12px; z-index:9999;
            background:#ff4d4f; color:#fff; padding:6px 12px;
            border-radius:4px; font-size:13px; display:none;
        `;
        document.body.appendChild(tagErrorBox);

        // 检查标签函数
        function checkTags() {
            const rows = document.querySelectorAll('.ant-table-tbody .ant-table-row');
            const bad = Array.from(rows).filter(row => {
                const tagText = row.querySelector('.ant-select-selection-item-content')?.textContent.trim() ?? '';
                return !ALLOW_TAGS.includes(tagText);
            });

            if (bad.length) {
                tagErrorBox.textContent = `存在 ${bad.length} 条标签不合规！`;
                tagErrorBox.style.display = 'block';
            } else {
                tagErrorBox.style.display = 'none';
            }
        }

        // 启动标签检查
        const intervalId = setInterval(checkTags, 500);

        // 返回停止方法
        return {
            stop: () => clearInterval(intervalId)
        };
    }

    // 初始化标注验证器
    function initAnnotationValidator() {
        // 创建三个错误提示框
        const errorBox1 = document.createElement('div');
        errorBox1.innerHTML = '⚠️ <b>规则冲突！</b><br>1. 选择丢弃原因时，输入框和表格必须为空<br>2. 当输入框为空时，表格必须为空';
        errorBox1.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px;
            background: #ff4d4f;
            color: white;
            border-radius: 8px;
            z-index: 2147483647;
            font-family: sans-serif;
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-size: 16px;
            border: 3px solid #fff;
            animation: blink1 0.8s infinite;
            max-width: 400px;
        `;

        const errorBox2 = document.createElement('div');
        errorBox2.innerHTML = '⚠️ <b>必须选择丢弃原因！</b>';
        errorBox2.style = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 20px;
            background: #faad14;
            color: white;
            border-radius: 8px;
            z-index: 2147483646;
            font-family: sans-serif;
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-size: 18px;
            border: 3px solid #fff;
            animation: blink2 0.5s infinite;
        `;

        const errorBox3 = document.createElement('div');
        errorBox3.innerHTML = '⚠️ <b>备注必须为空！</b><br>当输入框有内容时，备注必须为空';
        errorBox3.style = `
            position: fixed;
            top: 140px;
            right: 20px;
            padding: 20px;
            background: #ff7d00;
            color: white;
            border-radius: 8px;
            z-index: 2147483645;
            font-family: sans-serif;
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-size: 16px;
            border: 3px solid #fff;
            animation: blink3 0.6s infinite;
            max-width: 400px;
        `;

        document.head.insertAdjacentHTML('beforeend', `
            <style>
                @keyframes blink1 {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                @keyframes blink2 {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
                @keyframes blink3 {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            </style>
        `);
        document.body.appendChild(errorBox1);
        document.body.appendChild(errorBox2);
        document.body.appendChild(errorBox3);

        // 精准检测函数
        function checkValidation() {
            // 1. 输入框检测
            const bodyPathInput = document.querySelector('input.ant-input[type="text"]');
            const isBodyPathEmpty = !bodyPathInput?.value.trim();

            // 2. 表格检测
            const isTableEmpty = !!document.querySelector('.ant-table-placeholder .ant-empty-description');

            // 3. 丢弃原因检测
            const hasDiscardReason = !!document.querySelector('.ant-cascader .ant-select-selection-item');

            // 4. 备注检测
            const remarkTextarea = document.querySelector('#备注_inputValue');
            const isRemarkEmpty = !remarkTextarea?.value.trim();

            // 条件1: 已选丢弃原因时，输入框或表格不为空 → 冲突
            const condition1 = hasDiscardReason && (!isBodyPathEmpty || !isTableEmpty);

            // 条件2: 输入框为空但表格不为空 → 冲突
            const condition2 = isBodyPathEmpty && !isTableEmpty;

            // 条件3: 输入框和表格都为空但未选择丢弃原因 → 冲突
            const condition3 = isBodyPathEmpty && isTableEmpty && !hasDiscardReason;

            // 条件4: 输入框有内容但备注不为空 → 冲突
            const condition4 = !isBodyPathEmpty && !isRemarkEmpty;

            // 显示/隐藏错误提示
            errorBox1.style.display = condition1 || condition2 ? 'block' : 'none';
            errorBox2.style.display = condition3 ? 'block' : 'none';
            errorBox3.style.display = condition4 ? 'block' : 'none';

            // 返回验证结果
            return !(condition1 || condition2 || condition3 || condition4);
        }

        // 强化监听
        function setupListeners() {
            // 监听整个表单区域
            const formArea = document.querySelector('.annotation-detail-content') || document.body;
            new MutationObserver(checkValidation).observe(formArea, {
                childList: true,
                subtree: true,
                attributes: true
            });

            // 高频事件监听
            ['input', 'click', 'change', 'keyup', 'scroll'].forEach(evt => {
                document.addEventListener(evt, checkValidation);
            });

            // 拦截提交按钮
            const submitBtn = document.querySelector('.ant-btn-primary:contains("提 交")');
            if (submitBtn) {
                submitBtn.addEventListener('click', function(e) {
                    if (!checkValidation()) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        alert('请先解决所有验证错误再提交！');
                    }
                }, true);
            }
        }

        // 启动验证
        checkValidation();
        setupListeners();
        setInterval(checkValidation, 3000); // 3秒心跳检测

        return {
            check: checkValidation
        };
    }

    // 主初始化函数
    function init() {
        // 初始化标签验证器
        const tagValidator = initTagValidator();
        
        // 初始化标注验证器
        const annotationValidator = initAnnotationValidator();

        // 暴露API
        window.AGI_Validator = {
            tag: tagValidator,
            annotation: annotationValidator,
            checkAll: function() {
                // 这里可以添加综合检查逻辑
                return annotationValidator.check();
            }
        };
    }

    // 等待表格加载后初始化
    function waitForTable() {
        if (document.querySelector('.ant-table-tbody')) {
            init();
        } else {
            setTimeout(waitForTable, 300);
        }
    }

    // 启动等待
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForTable);
    } else {
        waitForTable();
    }
})();
// ==UserScript==
// @name         拦截allhistory.com的getFamilyInfo请求
// @namespace    https://example.com
// @version      0.1
// @description  拦截并打印allhistory.com家谱页面的getFamilyInfo接口数据
// @author       开发者
// @match        https://www.allhistory.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 辅助函数：获取性别
    function getGender(jsonData) {
        const gender = jsonData.gender;
        if (gender === 'male') {
            return 'M';
        } else if (gender === 'female') {
            return 'F';
        }
        return '未知';
    }

    // 辅助函数：获取头像
    function getAvatar(jsonData) {
        let avatar = jsonData.imageUrl;
        if (avatar && !avatar.startsWith('https')) {
            avatar = 'https:' + avatar;
        }
        return avatar;
    }

    // 辅助函数：处理数据
    function processData(jsonData) {
        if (jsonData && jsonData.data && jsonData.data.name) {
            const data = jsonData.data;
            const gender = getGender(data);
            const avatar = getAvatar(data);
            const id = data.id;

            // 处理子女数据
            const children = data.children;
            const childrenIds = [];
            const childrenData = [];

            if (children) {
                children.forEach(child => {
                    if (child.emperor === true || 1) {
                        const childGender = getGender(child);
                        const childAvatar = getAvatar(child);
                        const childData = {
                            data: {
                                'first name': child.name,
                                gender: childGender,
                                avatar: childAvatar,
                                summary: child.summary
                            },
                            id: child.id,
                            refs: {
                                father: id
                            }
                        };
                        childrenData.push(childData);
                        childrenIds.push(child.id);
                    }
                });
            }

            // 处理父母数据
            const parents = data.parents;
            const parentsIds = {
                father: null,
                mother: null
            };

            if (parents) {
                parents.forEach(parent => {
                    const parentGender = getGender(parent);
                    if (parentGender === 'M') {
                        parentsIds.father = parent.id;
                    } else if (parentGender === 'F') {
                        parentsIds.mother = parent.id;
                    }
                });
            }

            // 处理配偶数据
            const spouses = data.spouses;
            const spousesIds = [];

            if (spouses) {
                spouses.forEach(spouse => {
                    spousesIds.push(spouse.id);
                });
            }

            return {
                data: {
                    'first name': data.name,
                    gender: gender,
                    avatar: avatar,
                    emperor: data.emperor
                },
                id: id,
                refs: {
                    children: childrenIds,
                    father: parentsIds.father,
                    mother: parentsIds.mother,
                    spouses: spousesIds
                }
            };
        }
        console.log("未找到name数据");
        return null;
    }

    // 保存原始的XMLHttpRequest对象
    const originalXHR = window.XMLHttpRequest;

    // 重写XMLHttpRequest
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();

        // 重写open方法
        let originalOpen = xhr.open;
        xhr.open = function(method, url) {
            // 检查是否是getFamilyInfo请求
            if (typeof url === 'string' && url.includes('getFamilyInfo')) {
                console.log('拦截到getFamilyInfo请求:', url);

                // 也可以重写addEventListener来监听load事件
                xhr.addEventListener('load', function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        try {
                            const jsonData = JSON.parse(xhr.responseText);
                            const processedData = processData(jsonData);
                            console.log('处理后的数据:\n', JSON.stringify(processedData, null, 2));
                        } catch (error) {
                            console.error('处理数据时出错:', error);
                        }
                    }
                });
            }

            return originalOpen.apply(this, arguments);
        };

        return xhr;
    };

    // 保持XHR的原型链
    window.XMLHttpRequest.prototype = originalXHR.prototype;

    // 添加自动搜索功能
    function autoSearch(keyword) {
        // 查找搜索输入框
        const searchInput = document.querySelector('.input-ele');
        if (searchInput) {
            // 设置搜索关键词
            searchInput.value = keyword;
            
            // 创建并触发 input 事件，以触发联想功能
            const inputEvent = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(inputEvent);
            
            // 等待联想列表出现并选择第一个选项
            setTimeout(() => {
                const firstSuggestion = document.querySelector('.familySuggestList li');
                if (firstSuggestion) {
                    // 获取第一个建议项的 ID
                    const personId = firstSuggestion.getAttribute('data-id');
                    if (personId) {
                        // 直接跳转到人物页面
                        window.location.href = `https://www.allhistory.com/family/index?id=${personId}`;
                    } else {
                        console.error('未找到人物ID');
                    }
                } else {
                    // 如果没有联想结果，则执行普通搜索
                    const searchButton = document.querySelector('.icon-search');
                    if (searchButton) {
                        searchButton.click();
                    } else {
                        console.error('未找到搜索按钮');
                    }
                }
            }, 500); // 等待500ms让联想列表加载
        } else {
            console.error('未找到搜索输入框');
        }
    }

    // 添加搜索按钮到页面
    function addSearchButtons() {
        const emperors = [
            "刘邦", "刘盈", "刘恭", "刘弘", "刘恒",
            "刘启", "刘彻", "刘弗陵", "刘询", "刘奭",
            "刘骜", "刘欣", "刘箕子"
        ];

        // 创建按钮容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
        `;

        // 添加标题
        const title = document.createElement('div');
        title.textContent = '西汉帝王快速搜索';
        title.style.marginBottom = '10px';
        title.style.fontWeight = 'bold';
        container.appendChild(title);

        // 为每个帝王创建搜索按钮
        emperors.forEach(emperor => {
            const button = document.createElement('button');
            button.textContent = emperor;
            button.style.cssText = `
                margin: 2px;
                padding: 5px 10px;
                border: 1px solid #ddd;
                border-radius: 3px;
                cursor: pointer;
                background: #f5f5f5;
            `;
            button.onclick = () => autoSearch(emperor);
            container.appendChild(button);
        });

        document.body.appendChild(container);
    }

    // 等待页面加载完成后添加搜索按钮
    window.addEventListener('load', addSearchButtons);

    console.log('AllHistory Family Info Interceptor 已启动');
})();

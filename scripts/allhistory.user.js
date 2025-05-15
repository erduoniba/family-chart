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

    console.log('AllHistory Family Info Interceptor 已启动');
})();

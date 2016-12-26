/**
 * core modification
 * @author ydr.me
 * @create 2014-09-16 17:02
 * @update 2016年04月19日18:03:17
 */



'use strict';

var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var json = require('blear.utils.json');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');

var doc = document;
var headEl = selector.query('head')[0] || doc.documentElement;
var bodyEl = doc.body;
var divEl = doc.createElement('div');
// <--------------- beforebegin = 0
// <target>
//     <----------- afterbegin = 1
//     ...
//     ...
//     ...
//     <----------- beforeend = 2
// </target>
// <--------------- afterend = 3
// 目标节点开始之前
var BEFORE_BEGIN = 'beforebegin';
// 目标节点开始之后
var AFTER_BEGIN = 'afterbegin';
// 目标节点结束之前
var BEFORE_END = 'beforeend';
// 目标节点结束之后
var AFTER_END = 'afterend';
var REPLACE = 'replace';
var positionArray = [
    BEFORE_BEGIN,
    AFTER_BEGIN,
    BEFORE_END,
    AFTER_END,
    REPLACE
];


/**
 * 解析字符串为节点
 * @link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 * @param {String} htmlString
 * @returns {Node|HTMLElement}
 *
 * @example
 * modification.parse('&lt;div/>');
 * // => HTMLDIVElement
 */
exports.parse = function (htmlString) {
    divEl.innerHTML = htmlString;
    return divEl.firstElementChild;
};


/**
 * 创建节点
 * @param {String}       nodeName       节点名称，可以为#text、#comment、tagName
 * @param {String|Object} [attributes]   节点属性
 * @param {Object} [properties]   节点特性
 * @returns {Node}
 *
 * @example
 * modification.create('#text', '123');
 * // => textNode
 *
 * modification.create('#comment', '123');
 * // => commentNode
 *
 * modification.create('#fragment');
 * // => fragmentNode
 *
 * modification.create('div', {id:'id-123'});
 * // => DIVNode
 */
var create = exports.create = function (nodeName, attributes, properties) {
    var node;

    switch (nodeName) {
        case '#text':
            node = doc.createTextNode(typeis.Undefined(attributes) ? '' : String(attributes));
            break;

        case '#comment':
            node = doc.createComment(typeis.Undefined(attributes) ? '' : String(attributes));
            break;

        case '#fragment':
            node = doc.createDocumentFragment();
            break;

        default:
            node = doc.createElement(nodeName);
            var style = null;
            object.each(attributes, function (key, val) {
                if (typeof val === 'object') {
                    if (key === 'style') {
                        attribute.style(node, val);
                        //object.each(val, function (k, v) {
                        //    var fix = attribute.style(k, v);
                        //
                        //    if (fix.key) {
                        //        styles.push(fix.key + ':' + fix.val);
                        //    }
                        //});

                        //val = styles.join(';');
                    } else {
                        try {
                            val = JSON.stringify(val);
                        } catch (err) {
                            val = '';
                        }
                        node.setAttribute(key, val);
                    }

                } else {
                    node.setAttribute(key, val);
                }
            });

            if (style) {
                attribute.style(node, style);
            }
            break;
    }

    object.each(properties, function (key, val) {
        node[key] = val;
    });

    return node;
};


/**
 * 将源节点插入到指定节点的目标位置，并返回原始节点
 * @param {Node|HTMLElement} source 源
 * @param {Node|HTMLElement} [target] 目标
 * @param {String|Number} [position="beforeend"] 插入位置，分别为：beforebegin(0)、afterbegin(1)、beforeend(2)、afterend(3)
 * @returns {Node|HTMLElement} 返回原始节点
 *
 * @example
 * // - beforebegin ------ 0
 * // - <target>
 * //   - afterbegin ----- 1
 * //   - beforeend ------ 2
 * // - afterend --------- 3
 * // - replace ---------- 4
 *
 * modification.insert(source, target, 'beforebegin');
 * modification.insert(source, target, 'afterbegin');
 * modification.insert(source, target, 'beforeend');
 * modification.insert(source, target, 'afterend');
 */
var insert = exports.insert = function (source, target, position) {
    if (typeis.Number(position)) {
        position = positionArray[position];
    }

    position = position || BEFORE_END;
    position = position.toLowerCase();

    if (!target) {
        target = bodyEl;
    }

    switch (position) {
        // 源插入到目标外部之前
        case BEFORE_BEGIN:
            if (target.parentNode) {
                target.parentNode.insertBefore(source, target);
            }
            break;

        // 源插入到目标内部最前
        case AFTER_BEGIN:
            if (target.firstChild) {
                target.insertBefore(source, target.firstChild);
            } else {
                target.appendChild(source);
            }
            break;

        // 源插入到目标内部最后
        case BEFORE_END:
            target.appendChild(source);
            break;

        // 源插入到目标外部之后
        case AFTER_END:
            if (target.nextSibling) {
                target.parentNode.insertBefore(source, target.nextSibling);
            } else {
                target.parentNode.appendChild(source);
            }
            break;

        case REPLACE:
            // 先插入到目标的尾部
            insert(source, target, 3);
            // 然后移除目标
            remove(target);
            break;
    }

    return source;
};


/**
 * 移除某个元素
 * @param {Node|HTMLElement} el
 *
 * @example
 * modification.remove(el);
 */
var remove = exports.remove = function (el) {
    if (el && el.parentNode) {
        try {
            el.parentNode.removeChild(el);
        } catch (err) {
            // ignore
        }
    }
};


/**
 * 插入到目标之前，返回原始节点
 * @param {Node|HTMLElement} source
 * @param {Node|HTMLElement} target
 * @returns {Node|HTMLElement}
 */
exports.before = function (source, target) {
    return insert(source, target, 0);
};

/**
 * 插入到目标内前，返回原始节点
 * @param {Node|HTMLElement} source
 * @param {Node|HTMLElement} target
 * @returns {Node|HTMLElement}
 */
exports.prepend = function (source, target) {
    return insert(source, target, 1);
};

/**
 * 插入到目标内后，返回原始节点
 * @param {Node|HTMLElement} source
 * @param {Node|HTMLElement} target
 * @returns {Node|HTMLElement}
 */
exports.append = function (source, target) {
    return insert(source, target, 2);
};

/**
 * 插入到目标之后，返回原始节点
 * @param {Node|HTMLElement} source
 * @param {Node|HTMLElement} target
 * @returns {Node|HTMLElement}
 */
exports.after = function (source, target) {
    return insert(source, target, 3);
};

/**
 * 替换目标节点，返回原始节点
 * @param {Node|HTMLElement} source
 * @param {Node|HTMLElement} target
 * @returns {Node|HTMLElement}
 */
exports.replace = function (source, target) {
    return insert(source, target, 4);
};


/**
 * 清空元素
 * @param el
 */
exports.empty = function (el) {
    while (el.firstChild) {
        remove(el.firstChild);
    }
};


/**
 * 添加样式
 * @param {String} cssText 样式内容
 * @param {Node|HTMLElement} [sel=null] 选择器
 * @param {Boolean} [append=false] 是否为追加模式
 * @returns {HTMLStyleElement}
 *
 * @example
 * modification.importStyle('body{padding: 10px;}');
 */
exports.importStyle = function (cssText, sel, append) {
    var args = arguments;

    if (typeis.Boolean(args[1])) {
        append = args[1];
        sel = null;
    }

    var styleEl = selector.query(sel)[0];

    if (!styleEl) {
        styleEl = create('style');
        insert(styleEl, headEl, 'beforeend');
    }

    // IE
    // @fuckie
    /* istanbul ignore next */
    if (styleEl.styleSheet) {
        if (append) {
            styleEl.styleSheet.cssText += cssText;
        } else {
            styleEl.styleSheet.cssText = cssText;
        }
    }
    // W3C
    else {
        if (append) {
            styleEl.innerHTML += cssText;
        } else {
            styleEl.innerHTML = cssText;
        }
    }

    return styleEl;
};

/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var modification = require('../src/index.js');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');

describe('测试文件', function () {
    it('.parse', function (done) {
        var html1 = '<div></div>';
        var html2 = 'div';

        var node1 = modification.parse(html1);
        var node2 = modification.parse(html2);

        expect(node1.nodeType).toEqual(1);
        expect(node2).toEqual(null);

        done();
    });

    it('.create', function (done) {
        var node1 = modification.create('#text', '123');
        expect(node1.nodeType).toEqual(3);
        expect(node1.nodeName).toEqual('#text');
        expect(node1.nodeValue).toEqual('123');

        var node2 = modification.create('#comment', '123');
        expect(node2.nodeType).toEqual(8);
        expect(node2.nodeName).toEqual('#comment');
        expect(node2.nodeValue).toEqual('123');


        var node3 = modification.create('div', {
            width: 100,
            height: 200,
            style: {
                width: 100,
                height: 200
            },
            some: {
                a: 1
            }
        }, {
            width: 100,
            height: 200
        });

        var node4 = modification.create('#fragment');

        expect(node3.nodeType).toEqual(1);
        expect(node3.nodeName).toEqual('DIV');
        expect(node3.nodeValue).toEqual(null);
        expect(node3.getAttribute('width')).toEqual('100');
        expect(node3.getAttribute('height')).toEqual('200');
        expect(node3.getAttribute('some')).toEqual('{"a":1}');
        expect(node3.getAttribute('style')).toMatch(/width:\s*100px/i);
        expect(node3.getAttribute('style')).toMatch(/height:\s*200px/i);
        expect(node3.width).toEqual(100);
        expect(node3.height).toEqual(200);
        expect(node4.nodeType).toEqual(11);

        done();
    });

    it('.insert:beforebegin', function (done) {
        var id = 'dd' + new Date().getTime();
        var div1El = modification.create('div', {
            id: id
        });
        var div2El = modification.create('div');

        document.body.appendChild(div2El);
        var ret = modification.insert(div1El, div2El, 'beforebegin');

        // <div1/>
        // <div2/>

        expect(ret).toBe(div1El);
        expect(selector.prev(div2El)[0]).toBe(div1El);

        modification.remove(div1El);
        modification.remove(div2El);

        var findEl = selector.query('#' + id)[0];
        expect(findEl).toBe(undefined);

        done();
    });

    it('.insert:afterbegin', function (done) {
        var id = 'dd' + new Date().getTime();
        var div1El = modification.create('div', {
            id: id
        });
        var div2El = modification.create('div');
        var div3El = modification.create('div');

        document.body.appendChild(div2El);
        var ret1 = modification.insert(div1El, div2El, 'afterbegin');
        var ret2 = modification.insert(div3El, div2El, 'afterbegin');

        // <div2>
        //     <div3/>
        //     <div1/>
        // </div2>

        expect(ret1).toBe(div1El);
        expect(ret2).toBe(div3El);
        var childrenEls = selector.children(div2El);
        expect(childrenEls.length).toEqual(2);
        expect(childrenEls[0]).toEqual(div3El);
        expect(childrenEls[1]).toEqual(div1El);

        modification.remove(div2El);
        done();
    });

    it('.insert:beforeend', function (done) {
        var id = 'dd' + new Date().getTime();
        var div1El = modification.create('div', {
            id: id
        });
        var div2El = modification.create('div');
        var div3El = modification.create('div');

        document.body.appendChild(div2El);
        var ret1 = modification.insert(div1El, div2El, 'beforeend');
        var ret2 = modification.insert(div3El, div2El, 'beforeend');

        // <div2>
        //     <div1/>
        //     <div3/>
        // </div2>

        expect(ret1).toBe(div1El);
        expect(ret2).toBe(div3El);
        var childrenEls = selector.children(div2El);
        expect(childrenEls.length).toEqual(2);
        expect(childrenEls[0]).toEqual(div1El);
        expect(childrenEls[1]).toEqual(div3El);

        modification.remove(div2El);
        done();
    });

    it('.insert:afterend', function (done) {
        var id = 'dd' + new Date().getTime();
        var div1El = modification.create('div', {
            id: id
        });
        var div2El = modification.create('div');
        var div3El = modification.create('div');

        document.body.appendChild(div2El);
        var ret1 = modification.insert(div1El, div2El, 'afterend');
        var ret2 = modification.insert(div3El, div2El, 'afterend');

        // <div2/>
        // <div3/>
        // <div1/>

        expect(ret1).toBe(div1El);
        expect(ret2).toBe(div3El);
        expect(selector.next(div2El)[0]).toBe(div3El);
        expect(selector.next(div3El)[0]).toBe(div1El);

        modification.remove(div1El);
        modification.remove(div2El);
        modification.remove(div3El);

        var findEl = selector.query('#' + id)[0];
        expect(findEl).toBe(undefined);

        done();
    });

    it('.remove', function () {
        var id = 'xxxx' + new Date().getTime();
        var divEl = modification.create('div', {
            id: id
        });
        modification.remove(divEl);
        var findEl = document.getElementById(id);

        expect(findEl).toEqual(null);
    });

    it('.empty', function () {
        var divEl = modification.create('div');
        var length = 10;

        while (length--) {
            var childNode = length % 2 ?
                document.createElement('div') :
                document.createTextNode('' + Math.random());
            divEl.appendChild(childNode);
        }

        modification.empty(divEl);
        var childNodes = divEl.childNodes;
        expect(childNodes.length).toEqual(0)
    });

    it('.importStyle', function () {
        var id = 'mmmm' + new Date().getTime();
        var divEl = modification.create('div', {
            id: id
        });
        var styleEL = modification.create('style');

        modification.insert(divEl);
        modification.insert(styleEL);

        var style = '#' + id + '{width:100px;}';

        modification.importStyle(style);

        expect(attribute.style(divEl, 'width')).toEqual('100px');

        style = '#' + id + '{height: 200px;}';
        modification.importStyle(style, true);
        expect(attribute.style(divEl, 'width')).toEqual('100px');
        expect(attribute.style(divEl, 'height')).toEqual('200px');

        style = '#' + id + '{border:300px solid;}';
        modification.importStyle(style, styleEL);
        expect(attribute.style(divEl, 'border-left-width')).toEqual('300px');
        expect(attribute.style(divEl, 'width')).toEqual('100px');
        expect(attribute.style(divEl, 'height')).toEqual('200px');

        style = '#' + id + '{margin:400px;}';
        modification.importStyle(style, styleEL, true);
        expect(attribute.style(divEl, 'margin-left')).toEqual('400px');
        expect(attribute.style(divEl, 'border-width')).toEqual('300px');
        expect(attribute.style(divEl, 'width')).toEqual('100px');
        expect(attribute.style(divEl, 'height')).toEqual('200px');

        modification.remove(styleEL);
        modification.remove(divEl);
    });
});

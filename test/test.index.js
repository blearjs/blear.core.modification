/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var animation = require('../src/index.js');

describe('测试文件', function () {
    var divEl = null;

    var getStyle = function (el, cssKey) {
        return getComputedStyle(el).getPropertyValue(cssKey);
    };

    beforeAll(function (done) {
        animation.defaults.duration = 100;
        divEl = document.createElement('div');
        divEl.style.position = 'absolute';
        divEl.style.width = '100px';
        divEl.style.height = '100px';
        divEl.style.background = '#fcf';
        document.body.appendChild(divEl);
        done();
    });

    it('.animate@args4', function (done) {
        console.log(divEl.style.width);
        animation.animate(divEl, {
            width: 200
        }, {
            duration: 10
        }, function () {
            console.log(divEl.style.width);
            expect(getStyle(divEl, 'width')).toEqual('200px');
            done();
        });
    });

    it('.animate@args3.1', function (done) {
        console.log(divEl.style.width);
        animation.animate(divEl, {
            width: 300
        }, function () {
            console.log(divEl.style.width);
            expect(getStyle(divEl, 'width')).toEqual('300px');
            done();
        });
    });

    it('.animate@args3.2', function (done) {
        console.log(divEl.style.width);
        animation.animate(divEl, {
            width: 400
        }, {
            duration: 200
        });
        setTimeout(function () {
            console.log(divEl.style.width);
            expect(getStyle(divEl, 'width')).toEqual('400px');
            done();
        }, 1000);
    });

    it('.animate@args2', function (done) {
        console.log(divEl.style.width);
        animation.animate(divEl, {
            width: 400
        });

        setTimeout(function () {
            console.log(divEl.style.width);
            expect(getStyle(divEl, 'width')).toEqual('400px');
            done();
        }, animation.defaults.duration * 2);
    });
});

import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Test 1', () => {

    it('print "Hello World!" as string const.', () => expect('Hello World!\r\n').to.equals(
        new Run().test(['console.log("Hello World!");'])));

    it('print "Hello World!" as variable', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
            var x:string = "Hello World!";      \
            console.log(x);                     \
        '])));

    it('print "Hello World!" as function', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
            function x() {                      \
                console.log("Hello World!");    \
            }                                   \
            x();                                \
        '])));

    it('print "Hello World!" as function declaration', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
            var x = function () {               \
                console.log("Hello World!");    \
            };                                  \
            x();                                \
        '])));

    it('print "Hello World!" as function return', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
            function x() {                      \
                return "Hello World!";          \
            };                                  \
            console.log(x());                   \
        '])));

    it('print "Hello World!" as arrow function', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
            var x = () => {                     \
                console.log("Hello World!");    \
            };                                  \
            x();                                \
        '])));

    it('print "Hello World!" as direct function call', () => expect('Hello World!\r\n').to.equals(new Run().test([
        '                                       \
        (function() {                           \
            console.log("Hello World!");        \
        })()                                    \
    '])));

    it('var declaration: print - true,1,1.5,Hello World!', () => expect('true\r\n1\r\n1.5\r\nHello World!\r\n').to.equals(new Run().test([
        '                                       \
            var x = true;                       \
            console.log(x);                     \
            var x = 1;                          \
            console.log(x);                     \
            var x = 1.5;                        \
            console.log(x);                     \
            var x = "Hello World!";             \
            console.log(x);                     \
        '])));

    it('equals(var): print - 2 true,1,1.5,Hello World!', () => expect('true\r\n1\r\n1.5\r\nHello World!\r\n').to.equals(new Run().test([
        '                                       \
            var x;                              \
            x = true;                           \
            console.log(x);                     \
            x = 1;                              \
            console.log(x);                     \
            x = 1.5;                            \
            console.log(x);                     \
            x = "Hello World!";                 \
            console.log(x);                     \
        '])));

    it('equals(local): print - 3 true,1,1.5,Hello World!', () => expect('true\r\n1\r\n1.5\r\nHello World!\r\n').to.equals(new Run().test([
        '                                       \
            let x;                              \
            x = true;                           \
            console.log(x);                     \
            x = 1;                              \
            console.log(x);                     \
            x = 1.5;                            \
            console.log(x);                     \
            x = "Hello World!";                 \
            console.log(x);                     \
        '])));
});

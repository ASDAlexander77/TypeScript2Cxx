import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Undefined/null cases', () => {

    it('strict equals/not equals', () => expect(new Run().test([
        'class undefined {}                                                     \
        console.log(null === null);                                             \
        console.log(undefined === null);                                        \
        console.log(undefined === undefined);                                   \
        console.log(null !== null);                                             \
        console.log(undefined !== null);                                        \
        console.log(undefined !== undefined);                                   \
    '])).to.equals('true\r\nfalse\r\ntrue\r\nfalse\r\ntrue\r\nfalse\r\n'));

    it('not strict equals/not equals', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == null);                                             \
        console.log(undefined == null);                                        \
        console.log(undefined == undefined);                                   \
        console.log(null != null);                                             \
        console.log(undefined != null);                                        \
        console.log(undefined != undefined);                                   \
    '])).to.equals('true\r\ntrue\r\ntrue\r\nfalse\r\nfalse\r\nfalse\r\n'));

    it('strict 0', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null === 0);                                               \
        console.log(undefined === 0);                                          \
        console.log(null !== 0);                                               \
        console.log(undefined !== 0);                                          \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('strict ""', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null === "");                                              \
        console.log(undefined === "");                                         \
        console.log(null !== "");                                              \
        console.log(undefined !== "");                                         \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('not strict 0', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == 0);                                                \
        console.log(undefined == 0);                                           \
        console.log(null != 0);                                                \
        console.log(undefined != 0);                                           \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('not strict ""', () => expect(new Run().test([
        'class undefined {}                                                    \
        console.log(null == "");                                               \
        console.log(undefined == "");                                          \
        console.log(null != "");                                               \
        console.log(undefined != "");                                          \
    '])).to.equals('false\r\nfalse\r\ntrue\r\ntrue\r\n'));

    it('undefined default params with undefined', () => expect(new Run().test([
        'class undefined {}                                                    \
        function ffff(f1, f2?, f3?, f4?, f5?, f6?, f7?, f8 = 1) {              \
        console.log(f1);                                                       \
        console.log(f2 === undefined ? "<error>" : f2);                        \
        console.log(f3 === null ? "null" : "<error>");                         \
        console.log(f4 === undefined ? "<error>" : f4);                        \
        console.log(f5 === undefined ? "undef" : "<error>");                   \
        console.log(f6 === undefined ? "undef" : "<error>");                   \
        console.log(f7 === undefined ? "undef" : "<error>");                   \
        console.log(f8 === undefined ? "<error>" : f8);                        \
    }                                                                          \
                                                                               \
    ffff(10, 20, null, 30);                                                    \
    '])).to.equals('10\r\n20\r\nnull\r\n30\r\nundef\r\nundef\r\nundef\r\n1\r\n'));

});

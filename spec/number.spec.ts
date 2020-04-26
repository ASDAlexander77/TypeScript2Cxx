import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Numbers', () => {

    it('Number undefined 0 1', () => expect(new Run().test([
        'let a: number;                         \
         console.log(a == undefined);           \
         a = 1;                                 \
         console.log(a != undefined);           \
         console.log(!!a);                      \
         a = 0;                                 \
         console.log(a != undefined);           \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it('Bool undefined 0 1 - any', () => expect(new Run().test([
        'let a: any;                            \
         console.log(a == undefined);           \
         a = 1;                                 \
         console.log(a != undefined);           \
         console.log(!!a);                      \
         a = 0;                                 \
         console.log(a != undefined);           \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it('Bool undefined 0 1 - strict', () => expect(new Run().test([
        'let a: number;                         \
         console.log(a === undefined);          \
         a = 1;                                 \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
         a = 0;                                 \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it('Bool undefined 0 1 - any - strict', () => expect(new Run().test([
        'let a: any;                            \
         console.log(a === undefined);          \
         a = 1;                                 \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
         a = 0;                                 \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it.skip('Number undefined ops', () => expect(new Run().test([
        'let a: number;                         \
         console.log(a > undefined);            \
         console.log(a + 1);                    \
         a = undefined;                         \
         a += 1;                                \
         console.log(a);                        \
    '])).to.equals('false\r\nNaN\r\nNaN\r\n'));
});

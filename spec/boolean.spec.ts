import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Bools', () => {

    it('Bool undefined true false', () => expect(new Run().test([
        'let a: boolean;                        \
         console.log(a == undefined);           \
         a = true;                              \
         console.log(a != undefined);           \
         console.log(!!a);                      \
         a = false;                             \
         console.log(a != undefined);           \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it('Bool undefined true false - any', () => expect(new Run().test([
        'let a: any;                            \
         console.log(a == undefined);           \
         a = true;                              \
         console.log(a != undefined);           \
         console.log(!!a);                      \
         a = false;                             \
         console.log(a != undefined);           \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));    

    it('Bool undefined true false - strict', () => expect(new Run().test([
        'let a: boolean;                        \
         console.log(a === undefined);          \
         a = true;                              \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
         a = false;                             \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));

    it('Bool undefined true false - any - strict', () => expect(new Run().test([
        'let a: any;                            \
         console.log(a === undefined);          \
         a = true;                              \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
         a = false;                             \
         console.log(a !== undefined);          \
         console.log(!!a);                      \
    '])).to.equals('true\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\n'));       
});

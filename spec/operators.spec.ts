import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Arithmetic Operators', () => {

    it('Binary', () => expect('7\r\n3\r\n10\r\n2.5\r\n1\r\n7\r\n3\r\n10\r\n2.5\r\n1\r\n').to.equals(new Run().test([
        'var x, y;                                  \
        y = 5;                                      \
        x = y + 2;	                                \
        console.log(x);                             \
        x = y - 2;	                                \
        console.log(x);                             \
        x = y * 2;	                                \
        console.log(x);                             \
        x = y / 2;	                                \
        console.log(x);                             \
        x = y % 2;	                                \
        console.log(x);                             \
        let x2, y2;                                 \
        y2 = 5;                                     \
        x2 = y2 + 2;	                            \
        console.log(x2);                            \
        x2 = y2 - 2;	                            \
        console.log(x2);                            \
        x2 = y2 * 2;	                            \
        console.log(x2);                            \
        x2 = y2 / 2;	                            \
        console.log(x2);                            \
        x2 = y2 % 2;	                            \
        console.log(x2);                            \
    '])));

    it('String (strict) concat', () => expect('Good Morning\r\n').to.equals(new Run().test([
        'let text1:string, text2:string, text3:string;  \
        text1 = "Good ";                                \
        text2 = "Morning";                              \
        text3 = text1 + text2;                          \
        console.log(text3);                             \
    '])));

    it.skip('String (any) concat', () => expect('Good Morning\r\n').to.equals(new Run().test([
        'let text1, text2, text3;                   \
        text1 = "Good ";                            \
        text2 = "Morning";                          \
        text3 = text1 + text2;                      \
        console.log(text3);                         \
    '])));

    it('String (strict) op +=', () => expect('Good Morning\r\n').to.equals(new Run().test([
        'let text1:string, text2:string, text3:string;  \
        text1 = "Good ";                                \
        text2 = "Morning";                              \
        text3 = "";                                     \
        text3 += text1 + text2;                         \
        console.log(text3);                             \
    '])));

    it('Bitwise', () => expect('1\r\n5\r\n-6\r\n4\r\n10\r\n2\r\n').to.equals(new Run().test([
        'let x;                                     \
        x = 5 & 1;                                  \
        console.log(x);                             \
        x = 5 | 1;                                  \
        console.log(x);                             \
        x = ~ 5;                                    \
        console.log(x);                             \
        x = 5 ^ 1;                                  \
        console.log(x);                             \
        x = 5 << 1;                                 \
        console.log(x);                             \
        x = 5 >> 1;                                 \
        console.log(x);                             \
    '])));

    it('Logical', () => expect('true\r\nfalse\r\n').to.equals(new Run().test([
        'let r, x = 6, y = 3;                       \
        r = x < 10 && y > 1;                        \
        console.log(r);                             \
        r = x === 5 || y === 5;                     \
        console.log(r);                             \
    '])));

    it.skip('Logical = not on boolean', () => expect('true\r\n').to.equals(new Run().test([
        'let r;                                     \
        r = ~ false;                                \
        console.log(r);                             \
    '])));

    it('Logical (basic 1)', () => expect(
        'false\r\nfalse\r\ntrue\r\ntrue\r\ntrue\r\ntrue\r\nfalse\r\nfalse\r\nfalse\r\ntrue\r\nfalse\r\ntrue\r\n')
        .to.equals(new Run().test([
        'console.log(1 > 2);                        \
        console.log(1 >= 2);                        \
        console.log(1 < 2);                         \
        console.log(1 <= 2);                        \
        console.log(2 > 1);                         \
        console.log(2 >= 1);                        \
        console.log(2 < 1);                         \
        console.log(2 <= 1);                        \
        console.log(2 > 2);                         \
        console.log(2 >= 2);                        \
        console.log(2 < 2);                         \
        console.log(2 <= 2);                        \
    '])));

    it('Logical (basic 2)', () => expect('false\r\ntrue\r\nfalse\r\ntrue\r\n').to.equals(new Run().test([
        'let r, x = 1, y = 2;                       \
        r = x > y;                                  \
        console.log(r);                             \
        r = x < y;                                  \
        console.log(r);                             \
        r = x >= y;                                 \
        console.log(r);                             \
        r = x <= y;                                 \
        console.log(r);                             \
    '])));

    it('Logical (basic 3)', () => expect('false\r\nfalse\r\ntrue\r\ntrue\r\n').to.equals(new Run().test([
        'let r, x = 1, y = 1;                       \
        r = x > y;                                  \
        console.log(r);                             \
        r = x < y;                                  \
        console.log(r);                             \
        r = x >= y;                                 \
        console.log(r);                             \
        r = x <= y;                                 \
        console.log(r);                             \
    '])));

    it('Logical (basic 4)', () => expect('true\r\nfalse\r\ntrue\r\nfalse\r\n').to.equals(new Run().test([
        'let r, x = 2, y = 1;                       \
        r = x > y;                                  \
        console.log(r);                             \
        r = x < y;                                  \
        console.log(r);                             \
        r = x >= y;                                 \
        console.log(r);                             \
        r = x <= y;                                 \
        console.log(r);                             \
    '])));

    it('Logical (basic 5)', () => expect('1\r\n2\r\n').to.equals(new Run().test([
        'let r, x = 1, y = 2;                       \
        r = x || y;                                 \
        console.log(r);                             \
        r = x && y;                                 \
        console.log(r);                             \
    '])));

    it('In operator', () => expect('true\r\n').to.equals(new Run().test([
        'let c = [1, 2, 3];                         \
        let b = 2 in c;                             \
        console.log(b);                             \
    '])));

});

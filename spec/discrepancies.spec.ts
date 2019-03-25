import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Discrepancies', () => {

    it('0 is false in || expressions', () => expect(new Run().test([
         '                                              \
         console.log(null || null);                     \
         console.log(0 || null);                        \
         console.log(1 || null);                        \
                                                        \
         console.log(null || 0);                        \
         console.log(0 || 0);                           \
         console.log(1 || 0);                           \
                                                        \
         console.log(null || 1);                        \
         console.log(0 || 1);                           \
         console.log(1 || 1);                           \
         '])).to.equals('nil\r\nnil\r\n1\r\n0\r\n0\r\n1\r\n1\r\n1\r\n1\r\n'));

    it('0 as "any" is false in || expressions', () => expect(new Run().test([
        'var i:any;                                     \
        i = null; console.log(i || null);               \
        i = 0; console.log(i || null);                  \
        i = 1; console.log(i || null);                  \
                                                        \
        i = null; console.log(i || 0);                  \
        i = 0; console.log(i || 0);                     \
        i = 1; console.log(i || 0);                     \
                                                        \
        i = null; console.log(i || 1);                  \
        i = 0; console.log(i || 1);                     \
        i = 1; console.log(i || 1);                     \
        '])).to.equals('nil\r\nnil\r\n1\r\n0\r\n0\r\n1\r\n1\r\n1\r\n1\r\n'));

    it('0 is false in && expressions', () => expect(new Run().test([
        '                                              \
        console.log(null && null);                     \
        console.log(0 && null);                        \
        console.log(1 && null);                        \
                                                       \
        console.log(null && 0);                        \
        console.log(0 && 0);                           \
        console.log(1 && 0);                           \
                                                       \
        console.log(null && 1);                        \
        console.log(0 && 1);                           \
        console.log(1 && 1);                           \
        console.log(1 && 2);                           \
        '])).to.equals('nil\r\n0\r\nnil\r\nnil\r\n0\r\n0\r\nnil\r\n0\r\n1\r\n2\r\n'));

    it('0 as "any" is false in && expressions', () => expect(new Run().test([
        'var i:any;                                    \
        i = null; console.log(i && null);                     \
        i = 0; console.log(i && null);                        \
        i = 1; console.log(i && null);                        \
                                                                 \
        i = null; console.log(i && 0);                        \
        i = 0; console.log(i && 0);                           \
        i = 1; console.log(i && 0);                           \
                                                                 \
        i = null; console.log(i && 1);                        \
        i = 0; console.log(i && 1);                           \
        i = 1; console.log(i && 1);                           \
        i = 1; console.log(i && 2);                           \
        '])).to.equals('nil\r\n0\r\nnil\r\nnil\r\n0\r\n0\r\nnil\r\n0\r\n1\r\n2\r\n'));

    it('0 is false in !<xxx>', () => expect(new Run().test([
        '                                              \
        console.log(!null);                            \
        console.log(!0);                               \
        console.log(!1);                               \
        '])).to.equals('true\r\ntrue\r\nfalse\r\n'));

    it('0 as "any" is false in !<xxx>', () => expect(new Run().test([
        '                                               \
        var i:any = null;                               \
        console.log(!i);                                \
        i = 0;                                          \
        console.log(!i);                                \
        i = 1;                                          \
        console.log(!i);                                \
        '])).to.equals('true\r\ntrue\r\nfalse\r\n'));

});

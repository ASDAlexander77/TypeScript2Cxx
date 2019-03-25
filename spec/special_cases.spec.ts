import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Special cases', () => {

    it('Multiple assignments(local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = b = 1;                              \
                                                \
        console.log(a);                         \
    '])));

    it('Multiple assignments(global)', () => expect('1\r\n').to.equals(new Run().test([
        'var a;                                 \
        var b;                                  \
                                                \
        a = b = 1;                              \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = b || 1;                             \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local) 2', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        a = (b || (b = 1));                     \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local) 3', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b;                                  \
                                                \
        function f() {                          \
            return 1;                           \
        }                                       \
                                                \
        a = b || f();                           \
                                                \
        console.log(a);                         \
    '])));

    it('Or in assignments(local) 4', () => expect('1\r\n').to.equals(new Run().test([
        'let a;                                 \
        let b = 1;                              \
                                                \
        function f() {                          \
            let s = null;                       \
            s();                                \
            return 2;                           \
        }                                       \
                                                \
        a = b || f();                           \
                                                \
        console.log(a);                         \
    '])));

    it('++/-- prefix/suffix (local)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'let a = 1;                             \
        console.log(++a);                       \
        console.log(--a);                       \
        console.log(a++);                       \
        console.log(a--);                       \
    '])));

    it('++/-- prefix/suffix (global)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'var a = 1;                             \
        console.log(++a);                       \
        console.log(--a);                       \
        console.log(a++);                       \
        console.log(a--);                       \
    '])));

    it('++/-- prefix/suffix (field)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'var a = { value: 1 };                  \
        console.log(<any>(++a.value));          \
        console.log(<any>(--a.value));          \
        console.log(<any>(a.value++));          \
        console.log(<any>(a.value--));          \
    '])));

    it('++/-- prefix/suffix (field and cast)', () => expect('2\r\n1\r\n1\r\n2\r\n').to.equals(new Run().test([
        'var a = { value: 1 };                         \
        console.log(<any>(++((<any>a).value)));        \
        console.log(<any>(--((<any>a).value)));        \
        console.log(<any>(((<any>a).value)++));        \
        console.log(<any>(((<any>a).value)--));        \
    '])));

    it('chain of = (local)', () => expect('1\r\n1\r\n1\r\n').to.equals(new Run().test([
        'let a, b, c;                         \
        a = b = c = 1;                        \
        console.log(a);                       \
        console.log(b);                       \
        console.log(c);                       \
    '])));

    it('chain of = (global)', () => expect('1\r\n1\r\n1\r\n').to.equals(new Run().test([
        'var a, b, c;                         \
        a = b = c = 1;                        \
        console.log(a);                       \
        console.log(b);                       \
        console.log(c);                       \
    '])));

    it('chain of = (local)', () => expect('1\r\n').to.equals(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(a += b);                  \
    '])));

    it('chain of = (global)', () => expect('1\r\n').to.equals(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(a += b);                  \
    '])));

    it('? : (local)', () => expect(new Run().test([
        'let a = 0, b = 1;                    \
        console.log(b > 0 ? b : 2);           \
        console.log(b < 0 ? b : 2);           \
        console.log(b ? b : 2);               \
        console.log(!b ? b : 2);              \
    '])).to.equals('1\r\n2\r\n1\r\n2\r\n'));

    it('? : (global)', () => expect(new Run().test([
        'var a = 0, b = 1;                    \
        console.log(b > 0 ? b : 2);           \
        console.log(b < 0 ? b : 2);           \
        console.log(b ? b : 2);               \
        console.log(!b ? b : 2);              \
    '])).to.equals('1\r\n2\r\n1\r\n2\r\n'));

    it('? : (special cases)', () => expect(new Run().test([
        'let x = 1, y = 2;                    \
        console.log(!x || x == 0 ? x : y);    \
        console.log(x && x != 0 ? x : y);    \
    '])).to.equals('2\r\n1\r\n'));

    it('? : (special cases 2)', () => expect(new Run().test([
        'function _x() {                      \
            console.log(1);                   \
            return 1;                         \
        }                                     \
        function _y() {                       \
            console.log(2);                   \
            return 2;                         \
        }                                     \
                                              \
        console.log(!_x() || _x() == 0 ? _x() : _y());    \
        console.log(_x() && _x() != 0 ? _x() : _y());     \
    '])).to.equals('1\r\n1\r\n2\r\n2\r\n1\r\n1\r\n1\r\n1\r\n'));

    it('? : (special cases 3)', () => expect(new Run().test([
        'function _x() {                      \
            console.log(1);                   \
            return 1;                         \
        }                                     \
        function _y() {                       \
            console.log(2);                   \
            return 2;                         \
        }                                     \
                                              \
        console.log(_x() || _x() == 0 ? _x() : _y());     \
        console.log(!_x() && _x() != 0 ? _x() : _y());     \
    '])).to.equals('1\r\n1\r\n1\r\n1\r\n2\r\n2\r\n'));

    it('= || : (local)', () => expect('test\r\n').to.equals(new Run().test([
        'let a;                                           \
        console.log((a = a || { name: "test" }).name;     \
    '])));

    it('Class - field.value++ - BUG', () => expect(new Run().test([
    'class Matrix {                                 \
        private static _updateFlagSeed = 0;         \
                                                    \
        public updateFlag: number;                  \
                                                    \
        public constructor() {                      \
            this._markAsUpdated();                  \
        }                                           \
                                                    \
        public _markAsUpdated() {                   \
            this.updateFlag = Matrix._updateFlagSeed++; \
        }                                           \
    }                                               \
                                                    \
    const m = new Matrix();                         \
    console.log(m.updateFlag);                      \
    '])).to.equals('0\r\n'));

});

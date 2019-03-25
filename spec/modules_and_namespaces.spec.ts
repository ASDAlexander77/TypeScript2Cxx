import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Modules', () => {

    it('Module 1', () => expect('1\r\n').to.equals(new Run().test([
        'module M {                                 \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M.C();                        \
        console.log(c.X());                         \
    '])));

    it('Module 2 - nested', () => expect('1\r\n').to.equals(new Run().test([
        'module M1  {                               \
            module M2 {                             \
                export class C {                    \
                    static Y() { return 2; }        \
                                                    \
                    X() { return 1; }               \
                }                                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M1.M2.C();                    \
        console.log(c.X());                         \
    '])));

    it('Module 3 - <module1>.<module2>', () => expect('1\r\n').to.equals(new Run().test([
        'module M1.M2 {                             \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M1.M2.C();                    \
        console.log(c.X());                         \
    '])));

    it('Module - export function', () => expect('Hi\r\n').to.equals(new Run().test([
        'module M1.M2 {                             \
            export function f() {                   \
                console.log("Hi");                  \
            }                                       \
        }                                           \
                                                    \
        M1.M2.f();                                  \
    '])));

    it('Module - multi blocks', () => expect('1\r\n3\r\n').to.equals(new Run().test([
        'module M {                                 \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        module M {                                  \
            export class C2 {                       \
                static Y() { return 4; }            \
                                                    \
                X() { return 3; }                   \
            }                                       \
        }                                           \
                                                    \
        const c = new M.C();                        \
        console.log(c.X());                         \
        const c2 = new M.C2();                      \
        console.log(c2.X());                        \
    '])));

    it('Module - import only', () => expect('1\r\n3\r\n').to.equals(new Run().test([
        'module M {                                 \
            export class C {                        \
                static Y() { return 2; }            \
                                                    \
                X() { return 1; }                   \
            }                                       \
        }                                           \
                                                    \
        module M {                                  \
            export class C2 {                       \
                static Y() { return 4; }            \
                                                    \
                X() { return 3; }                   \
            }                                       \
        }                                           \
        ',
        'import \'./test0\';                        \
        const c = new M.C();                        \
        console.log(c.X());                         \
        const c2 = new M.C2();                      \
        console.log(c2.X());                        \
    '])));

    it('Module - static method call with param', () => expect(new Run().test([
        'module M {                                 \
            export class C {                        \
                static Y(name: string) { return name; }\
            }                                       \
        }                                           \
        ',
        'import \'./test0\';                        \
        console.log(M.C.Y("test"));                 \
    '])).to.equals('test\r\n'));
});

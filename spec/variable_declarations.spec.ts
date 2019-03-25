import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Variable Declarations', () => {

    it('var', () => expect('10\r\n').to.equals(new Run().test([
        'var a = 10;                            \
        console.log(a);                         \
    '])));

    it('var in function', () => expect('Hello, world!\r\n').to.equals(new Run().test([
        'function f() {                         \
            var message = "Hello, world!";      \
            return message;                     \
        }                                       \
        console.log(f());                       \
    '])));

    it('var access variables within other functions', () => expect('11\r\n').to.equals(new Run().test([
        'function f() {                         \
            var a = 10;                         \
            return function g() {               \
                var b = a + 1;                  \
                return b;                       \
            }                                   \
        }                                       \
                                                \
        var g = f();                            \
        console.log(g());                       \
    '])));

    it.skip('var access variables within other functions 2', () => expect('2\r\n').to.equals(new Run().test([
        'function f() {                         \
            var a = 1;                          \
                                                \
            a = 2;                              \
            var b = g();                        \
            a = 3;                              \
                                                \
            return b;                           \
                                                \
            function g() {                      \
                return a;                       \
            }                                   \
        }                                       \
                                                \
        console.write(f());                     \
    '])));

    it('var access variables within other functions 3 (multi-level)', () => expect('1\r\n2\r\n3\r\n').to.equals(new Run().test([
    'function f() {                             \
        const up3 = 3;                          \
        function ff() {                         \
            const up2 = 2;                      \
            function fff() {                    \
                const up1 = 1;                  \
                function ffff() {               \
                    const l = up1;              \
                    const m = up2;              \
                    const n = up3;              \
                    console.log(l);             \
                    console.log(m);             \
                    console.log(n);             \
                }                               \
                ffff();                         \
            }                                   \
            fff();                              \
        }                                       \
        ff();                                   \
    }                                           \
                                                \
    f();                                        \
    '])));

    it('var Re-declarations and Shadowing', () => expect('1\r\n').to.equals(new Run().test([
        'function f(x:number) {                 \
            var x:any;                          \
            var x:string = \'1\';               \
            console.log(<any>x);                \
        }                                       \
        f(20);                                  \
    '])));

    it ('Scoped locals',  () => expect('10\r\n5\r\n1\r\n5\r\n10\r\n').to.equals(new Run().test([
        'let i = 10; let j = 5;                 \
        console.log(i);                         \
        console.log(j);                         \
        if (true) {                             \
            let i  = 1;                         \
            console.log(i);                     \
            console.log(j);                     \
        }                                       \
                                                \
        console.log(i);                         \
    '])));

    it('const declarations', () => expect('Cat\r\n').to.equals(new Run().test([
        'const numLivesForCat = 9;              \
        const kitty = {                         \
            name: "Aurora",                     \
            numLives: numLivesForCat,           \
        }                                       \
                                                \
        kitty.name = "Rory";                    \
        kitty.name = "Kitty";                   \
        kitty.name = "Cat";                     \
        console.log(kitty.name);                \
    '])));

    it.skip('Array destructuring', () => expect('1\r\n2\r\n').to.equals(new Run().test([
        'let input = [1, 2];                    \
        let [first, second] = input;            \
        console.log(first);                     \
        console.log(second);                    \
    '])));

});

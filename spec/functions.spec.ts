import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Functions', () => {

    it('Optional Parameters', () => expect('Bob Adams\r\nBob\r\n').to.equals(new Run().test([
        'function buildName(firstName: string, lastName?: string) {             \
            if (lastName)                                                       \
                return firstName + " " + lastName;                              \
            else                                                                \
                return firstName;                                               \
        }                                                                       \
                                                                                \
        let result1 = buildName("Bob", "Adams");                                \
        let result2 = buildName("Bob");                                         \
        console.log(result1);                                                   \
        console.log(result2);                                                   \
    '])));

    it('Default Parameters', () => expect('Bob Adams\r\nBob Smith\r\n').to.equals(new Run().test([
        'function buildName(firstName: string, lastName: string = "Smith") {     \
            return firstName + " " + lastName;                                   \
        }                                                                        \
                                                                                 \
        let result1 = buildName("Bob", "Adams");                                 \
        let result2 = buildName("Bob");                                          \
        console.log(result1);                                                    \
        console.log(result2);                                                    \
    '])));

    it('function 1', () => expect('spades\r\n').to.equals(new Run().test([
        'let deck = {                                                           \
            createCardPicker: function() {                                      \
                return function() {                                             \
                    return {suit: "spades"};                                    \
                }                                                               \
            }                                                                   \
        }                                                                       \
                                                                                \
        let cardPicker = deck.createCardPicker();                               \
        let pickedCard = cardPicker();                                          \
                                                                                \
        console.log(pickedCard.suit);                                           \
    '])));

    it('this in function', () => expect('37\r\n').to.equals(new Run().test([
        'var o = {                                                              \
        prop: 37,                                                               \
        f: function() {                                                         \
          return this.prop;                                                     \
        }                                                                       \
      };                                                                        \
                                                                                \
      console.log(o.f());                                                       \
    '])));

    // TODO: this is not working in javascript
    it.skip('this 2', () => expect('spades\r\n').to.equals(new Run().test([
        'let deck = {                                                           \
            suits: ["hearts", "spades", "clubs", "diamonds"],                   \
            createCardPicker: function() {                                      \
                return function() {                                             \
                    return {suit: this.suits[1]};                               \
                }                                                               \
            }                                                                   \
        }                                                                       \
                                                                                \
        let cardPicker = deck.createCardPicker();                               \
        let pickedCard = cardPicker();                                          \
                                                                                \
        console.log(pickedCard.suit);                                           \
    '])));

    it('this - in an arrow function', () => expect('hearts\r\n').to.equals(new Run().test([
        'let deck = {                                                           \
            suits: ["hearts"],                                                  \
            createCardPicker: function() {                                      \
                return () => {                                                  \
                    return {suit: this.suits[0]};                               \
                };                                                              \
            }                                                                   \
        };                                                                      \
                                                                                \
        let cardPicker = deck.createCardPicker();                               \
        let pickedCard = cardPicker();                                          \
                                                                                \
        console.log(pickedCard.suit);                                           \
    '])));

    it('external values (bool)', () => expect('true\r\n').to.equals(new Run().test([
        'let test = false;                                                      \
                                                                                \
        function inner() {                                                      \
            test = true;                                                        \
        }                                                                       \
                                                                                \
        inner();                                                                \
                                                                                \
        console.log(test);                                                      \
    '])));

    it('external values (value)', () => expect('2\r\n').to.equals(new Run().test([
        'let i = 1;                                                             \
                                                                                \
        function f() {                                                          \
            i = 2;                                                              \
        }                                                                       \
                                                                                \
        f();                                                                    \
                                                                                \
        console.log(i);                                                         \
                                                                                \
    '])));

    it('external values (value) 2', () => expect('1\r\n').to.equals(new Run().test([
        'let i = 1;                                                             \
                                                                                \
        function f() {                                                          \
            console.log(i)                                                      \
        }                                                                       \
                                                                                \
        f();                                                                    \
    '])));

    it('test generic function', () => expect('myString\r\n').to.equals(new Run().test([
        'function identity<T>(arg: T): T {                                      \
            return arg;                                                         \
        }                                                                       \
                                                                                \
        let output = identity<string>("myString");                              \
        console.log(output);                                                    \
    '])));

    it('test function - ...', () => expect('Joseph\r\nSamuel\r\nLucas\r\nMacKinzie\r\n').to.equals(new Run().test([
        'function buildName(firstName: string, ...restOfName: string[]) {       \
            console.log(firstName);                                             \
            console.log(restOfName[0]);                                         \
            console.log(restOfName[1]);                                         \
            console.log(restOfName[2]);                                         \
        }                                                                       \
                                                                                \
        buildName("Joseph", "Samuel", "Lucas", "MacKinzie");                    \
    '])));

    it('test function - ... 2', () => expect('1\r\n2\r\n3\r\n').to.equals(new Run().test([
        'function sum(x, y, z) {                                                \
            console.log(x);                                                     \
            console.log(y);                                                     \
            console.log(z);                                                     \
        }                                                                       \
                                                                                \
        const numbers = [1, 2, 3];                                              \
                                                                                \
        sum(...numbers);                                                        \
    '])));

    it('test function - union types', () => expect('4Hello world\r\n').to.equals(new Run().test([
        'function padLeft(value: string, padding: number)                       \
         function padLeft(value: string, padding: string)                       \
         function padLeft(value: string, padding: any) {                        \
            if (typeof padding === "number") {                                  \
                return String(padding) + value;                                 \
            }                                                                   \
                                                                                \
            if (typeof padding === "string") {                                  \
                return padding + value;                                         \
            }                                                                   \
                                                                                \
            throw new Error(`Expected string or number, got \'${padding}\'.`);  \
        }                                                                       \
                                                                                \
        console.log(padLeft("Hello world", 4));                                 \
    '])));

    it('test function - method call by reference',  () => expect(new Run().test([
        'const padStr = (i: number) => (i < 10) ? "0" + i : "" + i;             \
        console.log("[" + padStr(1) + "]:");                                    \
    '])).to.equals('[01]:\r\n'));

    it('function var scope',  () => expect(new Run().test([
        'var a = 1;                                                             \
        function f() {                                                          \
        	var b = 2;                                                          \
	        console.log(a);                                                     \
            console.log(b);                                                     \
        }                                                                       \
                                                                                \
        f();                                                                    \
                                                                                \
        console.log(a);                                                         \
        console.log(b);                                                         \
    '])).to.equals('1\r\n2\r\n1\r\nnil\r\n'));

});

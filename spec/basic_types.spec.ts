import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Basic Types', () => {

    it('simple bool/null value: local', () => expect('false\r\nfalse\r\nfalse\r\nnil\r\nnil\r\nnil\r\n').to.equals(new Run().test([
        'let isDone1: boolean = false;  \
        const isDone2: boolean = false; \
        var isDone3: boolean = false;   \
        let val1: any = null;           \
        const val2: any = null;         \
        var val3: any = null;           \
        console.log(isDone1);           \
        console.log(isDone2);           \
        console.log(isDone3);           \
        console.log(val1);              \
        console.log(val2);              \
        console.log(val3);              \
    '])));

    it('Basic Types', () => expect('false\r\n6\r\n61453\r\n10\r\n484\r\nred\r\n').to.equals(new Run().test([
        'let isDone1: boolean = false;  \
        let decimal: number = 6;        \
        let hex: number = 0xf00d;       \
        let binary: number = 0b1010;    \
        let octal: number = 0o744;      \
        let color: string = "blue";     \
        color = \'red\';                \
        console.log(isDone1);           \
        console.log(decimal);           \
        console.log(hex);               \
        console.log(binary);            \
        console.log(octal);             \
        console.log(color);             \
    '])));

    it('Template Strings', () => expect(
        'Hello, my name is Bob Bobbington.                                                                                \
I\'ll be 38 years old next month.\r\n').to.equals(new Run().test([
        'let fullName: string = `Bob Bobbington`;                   \
        let age: number = 37;                                       \
        let sentence: string = `Hello, my name is ${ fullName }.    \
                                                                    \
        I\'ll be ${ age + 1 } years old next month.`;               \
        console.log(sentence);                                      \
    '])));

    it('Array', () => expect('1\r\n2\r\n3\r\n10\r\n1\r\n2\r\n3\r\n10\r\n').to.equals(new Run().test([
        'let list: number[] = [1, 2, 3];        \
        console.log(list[0]);                   \
        console.log(list[1]);                   \
        console.log(list[2]);                   \
        list[2] = 10;                           \
        console.log(list[2]);                   \
        var list2: Array<number> = [1, 2, 3];   \
        console.log(list2[0]);                  \
        console.log(list2[1]);                  \
        console.log(list2[2]);                  \
        list2[2] = 10;                          \
        console.log(list2[2]);                  \
    '])));

    it('Tuple', () => expect('hello\r\n10\r\nhello\r\n10\r\n').to.equals(new Run().test([
        'let x: [string, number];               \
        x = ["hello", 10];                      \
        console.log(x[0]);                      \
        console.log(x[1]);                      \
        var x2: [string, number];               \
        x2 = ["hello", 10];                     \
        console.log(x2[0]);                     \
        console.log(x2[1]);                     \
    '])));

    it('Enum', () => expect('Green\r\n').to.equals(new Run().test([
        'enum Color {Red = 1, Green, Blue};     \
        let colorName: string = Color[2];       \
        console.log(colorName);                 \
    '])));

    it('Const Array with Const Objects', () => expect(new Run().test([
        'function f(events: { name: string; handler: any; }[]) { \
            console.log(events[0].name);                                              \
            if (events[1]) console.log("failed");                                     \
        }                                                                             \
        f([{ name: "blur", handler: 1 }]);                                            \
    '])).to.equals('blur\r\n'));

});

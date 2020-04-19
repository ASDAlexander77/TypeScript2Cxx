import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Statements', () => {

    it('simple If - bool', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                              \
        if (a) console.log("works");                \
    '])));

    it('simple If/else - bool', () => expect('works\r\n').to.equals(new Run().test([
        'let a = true;                                         \
        if (!a) console.log("no"); else console.log("works");  \
    '])));

    it('simple If - reference', () => expect('works\r\n').to.equals(new Run().test([
        'let a = {};                                \
        if (a) console.log("works");                \
    '])));

    it('simple If/else - reference', () => expect('works\r\n').to.equals(new Run().test([
        'let a = {};                                           \
        if (!a) console.log("no"); else console.log("works");  \
    '])));

    it('simple do/while (local)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'let a = 10;                                            \
        do {                                                    \
            a = a - 1;                                          \
            console.log(a);                                     \
        } while (a > 0);                                        \
    '])));

    it('simple do/while (global)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'var a = 10;                                            \
        do {                                                    \
            a = a - 1;                                          \
            console.log(a);                                     \
        } while (a > 0);                                        \
    '])));

    it('simple while (local)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'let a = 10;                                            \
        while (a > 0) {                                         \
            a = a - 1;                                          \
            console.log(a);                                     \
        }                                                       \
    '])));

    it('simple while (global)', () => expect('9\r\n8\r\n7\r\n6\r\n5\r\n4\r\n3\r\n2\r\n1\r\n0\r\n').to.equals(new Run().test([
        'var a = 10;                                            \
        while (a > 0) {                                         \
            a = a - 1;                                          \
            console.log(a);                                     \
        }                                                       \
    '])));

    it('simple while - 2', () => expect('1\r\n').to.equals(new Run().test([
        'let a = 1;                                             \
        let count = 0;                                          \
        while (a) {                                             \
            a--;                                                \
            count++;                                            \
        }                                                       \
        console.log(count);                                     \
        '])));

    it('simple for (local)', () => expect('0\r\n1\r\n2\r\n3\r\n4\r\n').to.equals(new Run().test([
        'let i;                                                 \
        for (i = 0; i < 5; i++) {                               \
            console.log(i);                                     \
        }                                                       \
    '])));

    it('simple for (global)', () => expect('0\r\n1\r\n2\r\n3\r\n4\r\n').to.equals(new Run().test([
        'var i;                                                 \
        for (i = 0; i < 5; i++) {                               \
            console.log(i);                                     \
        }                                                       \
    '])));

    it('simple for/in (local)', () => expect('10\r\n20\r\n30\r\n').to.equals(new Run().test([
        'let vals = [10, 20, 30];                               \
        let i;                                                  \
        for (i in vals) {                                       \
            console.log(vals[i]);                               \
        }                                                       \
    '])));

    it('simple for/in (local) 1', () => expect(new Run().test([
        'let person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        let x;                                                  \
        for (x in person) {                                     \
            console.log(person[x]);                             \
        }                                                       \
    '])).to.contains('John').contains('Doe').contains('25'));

    it('simple for/in (local) 2', () => expect(new Run().test([
        'let person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        for (const x in person) {                               \
            console.log(person[x]);                             \
        }                                                       \
    '])).to.contains('John').contains('Doe').contains('25'));

    it('simple for/in (global) 1', () => expect(new Run().test([
        'var person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        var x;                                                  \
        for (x in person) {                                     \
            console.log(person[x]);                             \
        }                                                       \
    '])).to.contains('John').contains('Doe').contains('25'));

    it('simple for/in (global) 2', () => expect(new Run().test([
        'var person = {fname:"John", lname:"Doe", age:25};      \
                                                                \
        for (var x in person) {                                 \
            console.log(person[x]);                             \
        }                                                       \
    '])).to.contains('John').contains('Doe').contains('25'));

    it('simple for/in (local) empty dictionary', () => expect('\r\n').to.equals(new Run().test([
        'let person = {};                                       \
                                                                \
        let text = "";                                          \
        let x;                                                  \
        for (x in person) {                                     \
            text += person[x] + " ";                            \
        }                                                       \
        console.log(text);                                      \
    '])));

    it('simple for/in (var)', () => expect('works\r\n').to.equals(new Run().test([
        'const attached = { type: function() { console.log("works"); } }; \
        for (var cam in attached) {                             \
            attached[cam]();                                    \
        }                                                       \
    '])));

    it('simple for/of (array) - global', () => expect('9\r\n2\r\n5\r\n').to.equals(new Run().test([
        'var someArray = [9, 2, 5];                             \
        for (var item of someArray) {                           \
            console.log(item);                                  \
        }                                                       \
    '])));

    it('simple for/of (array) - local', () => expect('9\r\n2\r\n5\r\n').to.equals(new Run().test([
        'const someArray = [9, 2, 5];                           \
        for (const item of someArray) {                         \
            console.log(item);                                  \
        }                                                       \
    '])));

    it('simple for/of (array) - empty', () => expect('').to.equals(new Run().test([
        'var someArray = [];                                    \
        for (var item of someArray) {                           \
            console.log(item);                                  \
        }                                                       \
    '])));

    it('simple for/of (string)', () => expect(new Run().test([
        'var hello = "is";                                      \
        for (var _char of hello) {                              \
            console.log(<any>_char);                            \
        }                                                       \
    '])).to.equals('i\r\ns\r\n'));

    it('simple for/of (params)', () => expect(new Run().test([
        'function push(...objs: any[]) {                        \
            for (const obj of objs) {                           \
                console.log(obj);                               \
            }                                                   \
        }                                                       \
        push(<any>1, <any>2, <any>3);                           \
    '])).to.equals('1\r\n2\r\n3\r\n'));

    it('switch (local) 1', () => expect('Hello!\r\nHello!\r\nHello!\r\nHello!\r\n').to.equals(new Run().test([
        'let a = 1;                                             \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                console.log("Hello!");                          \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 2;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                console.log("Hello!");                           \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 3;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                break;                                          \
            case 3:                                             \
                console.log("Hello!");                          \
                break;                                          \
            default:                                            \
                break;                                          \
        }                                                       \
        a = 4;                                                  \
        switch (a) {                                            \
            case 1:                                             \
            case 2:                                             \
                break;                                          \
            case 3:                                             \
                break;                                          \
            default:                                            \
                console.log("Hello!");                          \
                break;                                          \
        }                                                       \
    '])));

    it('switch (string)', () => expect(new Run().test([
        'var grade:string = "A";                                \
        switch(grade) {                                         \
           case "A": {                                          \
              console.log("Excellent");                         \
              break;                                            \
           }                                                    \
           case "B": {                                          \
              console.log("Good");                              \
              break;                                            \
           }                                                    \
           case "C": {                                          \
              console.log("Fair");                              \
              break;                                            \
           }                                                    \
           case "D": {                                          \
              console.log("Poor");                              \
              break;                                            \
           }                                                    \
           default: {                                           \
              console.log("Invalid choice");                    \
              break;                                            \
           }                                                    \
        }                                                       \
    '])).to.equals('Excellent\r\n'));

    it('switch - with for statement', () => expect(new Run().test([
        'const grade = 0;                                       \
        var i = 0;                                              \
        switch(grade) {                                         \
           case 0:                                              \
              console.log("Excellent");                         \
              break;                                            \
           case 1:                                              \
              for (i; i < 10; i++) {                            \
                  console.log("failed");                        \
              }                                                 \
              console.log("failed");                            \
              for (i; i < 10; i++) {                            \
                  console.log("failed");                        \
              }                                                 \
              console.log("failed");                            \
            break;                                              \
            case 2:                                             \
              console.log("failed");                            \
            break;                                              \
        }                                                       \
    '])).to.equals('Excellent\r\n'));

    it('switch - 1, 2, 3', () => expect(new Run().test(['       \
    const falloffType = 0;                                      \
                                                                \
    const FALLOFF_GLTF = 2;                                     \
    const FALLOFF_PHYSICAL = 1;                                 \
    const FALLOFF_STANDARD = 3;                                 \
                                                                \
    switch (falloffType) {                                      \
        case FALLOFF_GLTF:                                      \
            console.log("not working 1");                       \
        break;                                                  \
        case FALLOFF_PHYSICAL:                                  \
            console.log("not working 2");                       \
        break;                                                  \
        case FALLOFF_STANDARD:                                  \
            console.log("not working 3");                       \
        break;                                                  \
    }                                                           \
    console.log("done");                                        \
    '])).to.equals('done\r\n'));
});

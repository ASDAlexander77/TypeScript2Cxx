import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Try/Finally', () => {

    it('Simple Try/Finally', () => expect('1\r\n1\r\n').to.equals(new Run().test([
        'let i = 1;                             \
        try                                     \
        {                                       \
            console.log(i);                     \
            throw i;                            \
            i = 2;                              \
        }                                       \
        finally {                               \
            console.log(i);                     \
        }                                       \
    '])));

    it('Simple Try/Catch/Finally', () => expect('1\r\n1\r\nerror\r\n10\r\n1\r\n').to.equals(new Run().test([
        'let i = 1;                             \
        try {                                   \
            console.log(i);                     \
            throw 10;                           \
            i = 2;                              \
        } catch (err) {                         \
            console.log("error");               \
            console.log(err);                   \
        } finally {                             \
            console.log(i);                     \
        }                                       \
        console.log(i);                         \
    '])));

});

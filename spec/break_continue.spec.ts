import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Breaks', () => {

    it('Break/continue for while/do/for', () => expect(new Run().test([
        'for (let i = 0; i < 3; i++) {          \
            console.log(i);                     \
            if (i == 0) continue;               \
            break;                              \
        }                                       \
    '])).to.equals('0\r\n1\r\n'));

    it.skip('Break/continue for for/in', () => expect(new Run().test([
        'let a = [10, 20, 30, 40];              \
        for (let i in a) {                      \
            console.log(i);                     \
            if (count == 0) continue;           \
            break;                              \
        }                                       \
        '])).to.equals('0\r\n1\r\n'));

    it('Break/continue for for/in', () => expect(new Run().test([
        'let a = [10, 20, 30, 40];              \
        let count = 0;                          \
        for (let i in a) {                      \
            count++;                            \
            console.log(count);                 \
            if (count == 1) continue;           \
            break;                              \
        }                                       \
        '])).to.equals('1\r\n2\r\n'));
});

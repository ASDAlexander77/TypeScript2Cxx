import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('RegExp', () => {

    it('Simple RegExp test 1', () => expect('1\r\n').to.equals(new Run().test([
        'class RegExp {                                     \
            constructor(private s: string, private f?: string) {\
            }                                               \
            public test(t: string) {                        \
                return true;                                \
            }                                               \
        };                                                  \
        let navigator1 = \'iPad iPhone\';                   \
        const _badOS = /iPad/.test(navigator1);             \
        const b = _badOS ? 1 : 0;                           \
        console.log(b);                                     \
    '])));


    it('Simple RegExp test 2', () => expect('1\r\n').to.equals(new Run().test([
        'class RegExp {                                     \
            constructor(private s: string, private f?: string) {\
            }                                               \
            public test(t: string) {                        \
                return true;                                \
            }                                               \
        };                                                  \
        let navigator1 = \'iPad iPhone\';                   \
        const _badOS = /iPad/i.test(navigator1);            \
        const b = _badOS ? 1 : 0;                           \
        console.log(b);                                     \
    '])));

});

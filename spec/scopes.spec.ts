import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Sopes', () => {

    it('Bool change in function', () => expect(new Run().test([
        'function run() {                                                   \
            let o = false;                                                  \
            const a = function() {                                          \
                o = true;                                                   \
            };                                                              \
                                                                            \
            a();                                                            \
                                                                            \
            console.log(o);                                                 \
        }                                                                   \
                                                                            \
        run();                                                              \
    '])).to.equals('true\r\n'));

    it('Number change in function', () => expect(new Run().test([
        'function run() {                                                   \
            let o = 1;                                                      \
            const a = function() {                                          \
                o = 2;                                                      \
            };                                                              \
                                                                            \
            a();                                                            \
                                                                            \
            console.log(o);                                                 \
        }                                                                   \
                                                                            \
        run();                                                              \
    '])).to.equals('2\r\n'));

    it('Array change in function', () => expect(new Run().test([
        'function run() {                                                   \
            const o = [0, 1];                                               \
            const a = function() {                                          \
                o[1] = 2;                                                   \
            };                                                              \
                                                                            \
            a();                                                            \
                                                                            \
            console.log(o[1]);                                              \
        }                                                                   \
                                                                            \
        run();                                                              \
    '])).to.equals('2\r\n'));

    it('Object change in function', () => expect(new Run().test([
        'function run() {                                                   \
            const o = { next: 1, done: false };                             \
            const a = function() {                                          \
                o.done = true;                                              \
            };                                                              \
                                                                            \
            a();                                                            \
                                                                            \
            console.log(o.done);                                            \
        }                                                                   \
                                                                            \
        run();                                                              \
    '])).to.equals('true\r\n'));
});

import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Delete', () => {

    it('Local', () => expect(new Run().test([
        'let a = { obj: "asd" };                    \
        delete a.obj;                               \
        console.log(a.obj);                         \
    '])).to.equals('undefined\r\n'));

    it('Remove item', () => expect(new Run().test([
        'let a = { obj: "asd", obj2: "value" };     \
        delete a.obj;                               \
        for (let i in a)                            \
        {                                           \
            console.log(i);                         \
            console.log(a[i]);                      \
        }                                           \
    '])).to.equals('obj2\r\nvalue\r\n'));

});

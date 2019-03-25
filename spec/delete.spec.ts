import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Delete', () => {

    it('Local', () => expect('none\r\n').to.equals(new Run().test([
        'let a = { obj: "asd" };                    \
        delete a.obj;                               \
        console.log(a.obj || "none");               \
    '])));

    it('Remove item', () => expect('obj2\r\nvalue\r\n').to.equals(new Run().test([
        'let a = { obj: "asd", obj2: "value" };     \
        delete a.obj;                               \
        for (let i in a)                            \
        {                                           \
            console.log(i);                         \
            console.log(a[i]);                      \
        }                                           \
    '])));

});

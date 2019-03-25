import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Strings', () => {

    it('index', () => expect(new Run().test([
        'var s = "ABC";                                        \
        console.log(s[1]);                                     \
    '])).to.equals('B\r\n'));

});

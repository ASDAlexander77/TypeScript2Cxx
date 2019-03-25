import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('TypeOf', () => {

    it('TypeOf: string', () => expect('string\r\n').to.equals(new Run().test([
        'console.log(typeof("asd"));                 \
    '])));

});

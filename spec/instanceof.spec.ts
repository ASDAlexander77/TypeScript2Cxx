import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('InstanceOf', () => {

    it('InstanceOf: number, string, boolean', () => expect(new Run().test([
        'class Number {}                            \
        class String {}                             \
        class Boolean {}                            \
        const ok = (<any>1) instanceof Number;      \
        console.log(ok ? "true" : "false");         \
        const ok1 = (<any>"a") instanceof String;   \
        console.log(ok1 ? "true" : "false");        \
        const ok2 = (<any>true) instanceof Boolean; \
        console.log(ok2 ? "true" : "false");        \
    '], { jslib: true })).to.equals('true\r\ntrue\r\ntrue\r\n'));

});

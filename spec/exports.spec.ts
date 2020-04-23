import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Export', () => {

    it('Class export', () => expect('false\r\n').to.equals(new Run().test([
        'export class ZipCodeValidator {            \
            isAcceptable(s: string): boolean {      \
                return false;                       \
            }                                       \
        }                                           \
    ',
    'import { ZipCodeValidator } from "./test_0";    \
    const myValidator = new ZipCodeValidator();     \
    console.log(myValidator.isAcceptable("test"));  \
    '])));

    it('Class export (import as)', () => expect('false\r\n').to.equals(new Run().test([
        'export class ZipCodeValidator {            \
            isAcceptable(s: string): boolean {      \
                return false;                       \
            }                                       \
        }                                           \
    ',
    'import { ZipCodeValidator as ZCV } from "./test_0";     \
    const myValidator = new ZCV();                          \
    console.log(myValidator.isAcceptable("test"));          \
    '])));

    it('Class export (default)', () => expect('false\r\n').to.equals(new Run().test([
        'export default class ZipCodeValidator {            \
            isAcceptable(s: string): boolean {      \
                return false;                       \
            }                                       \
        }                                           \
    ',
    'import validator from "./test_0";               \
    const myValidator = new validator();            \
    console.log(myValidator.isAcceptable("test"));  \
    '])));

    // can't implement it now
    it.skip('Class export - alias', () => expect('false\r\n').to.equals(new Run().test([
        'export class ZipCodeValidator {            \
            isAcceptable(s: string): boolean {      \
                return false;                       \
            }                                       \
        }                                           \
    ',
    'import * as Test from "./test_0";    \
    const myValidator = new Test.ZipCodeValidator();\
    console.log(myValidator.isAcceptable("test"));  \
    '])));
});

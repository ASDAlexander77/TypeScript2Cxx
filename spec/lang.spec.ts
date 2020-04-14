import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Lang tests', () => {

    it('01 arguments', () => expect('testDefaultArgs\r\n').to.equals(new Run().test(['lang-test0/01arguments.ts'], null)));
    it('02 numbers', () => expect('TN\r\nZZ12\r\nnums#0\r\nnums#1\r\nnums#3\r\nnums#4\r\nFB\r\nFIB987\r\nnums#5\r\nv:0\r\nv: 0\r\nv:0\r\nv:null\r\nv:0\r\n').to.equals(
        new Run().test(['lang-test0/02numbers.ts'], null)));
    /*
    it('05 strings', () => expect('').to.equals(new Run().test(['lang-test0/05strings.ts'], null)));
    it('06 numbercollections', () => expect('').to.equals(new Run().test(['lang-test0/06numbercollections.ts'], null)));
    it('07 stringcollections', () => expect('').to.equals(new Run().test(['lang-test0/07stringcollections.ts'], null)));
    it('08 stringopertations', () => expect('').to.equals(new Run().test(['lang-test0/08stringopertations.ts'], null)));
    it('09 postprefix', () => expect('').to.equals(new Run().test(['lang-test0/09postprefix.ts'], null)));
    it('10 arrayincrement', () => expect('').to.equals(new Run().test(['lang-test0/10arrayincrement.ts'], null)));
    it('11 equalsoperator', () => expect('').to.equals(new Run().test(['lang-test0/11equalsoperator.ts'], null)));
    it('12 referencecollection', () => expect('').to.equals(new Run().test(['lang-test0/12referencecollection.ts'], null)));
    it('13 actions', () => expect('').to.equals(new Run().test(['lang-test0/13actions.ts'], null)));
    it('14 lazyoperations', () => expect('').to.equals(new Run().test(['lang-test0/14lazyoperations.ts'], null)));
    it('15 references', () => expect('').to.equals(new Run().test(['lang-test0/15references.ts'], null)));
    it('17 classes', () => expect('').to.equals(new Run().test(['lang-test0/17classes.ts'], null)));
    it('18 enums', () => expect('').to.equals(new Run().test(['lang-test0/18enums.ts'], null)));
    it('19 forof', () => expect('').to.equals(new Run().test(['lang-test0/19forof.ts'], null)));
    it('20 maps', () => expect('').to.equals(new Run().test(['lang-test0/20maps.ts'], null)));
    it('22 lambdas', () => expect('').to.equals(new Run().test(['lang-test0/22lambdas.ts'], null)));
    it('23 generics', () => expect('').to.equals(new Run().test(['lang-test0/23generics.ts'], null)));
    it('241 arrayforeach', () => expect('').to.equals(new Run().test(['lang-test0/241arrayforeach.ts'], null)));
    it('242 arrayjoin', () => expect('').to.equals(new Run().test(['lang-test0/242arrayjoin.ts'], null)));
    it('243 arrayevery', () => expect('').to.equals(new Run().test(['lang-test0/243arrayevery.ts'], null)));
    it('244 arraysome', () => expect('').to.equals(new Run().test(['lang-test0/244arraysome.ts'], null)));
    it('24 arraymap', () => expect('').to.equals(new Run().test(['lang-test0/24arraymap.ts'], null)));
    it('25 lamdacapture', () => expect('').to.equals(new Run().test(['lang-test0/25lamdacapture.ts'], null)));
    it('26 staticclasses', () => expect('').to.equals(new Run().test(['lang-test0/26staticclasses.ts'], null)));
    it('27 accessors', () => expect('').to.equals(new Run().test(['lang-test0/27accessors.ts'], null)));
    it('28 boolcasts', () => expect('').to.equals(new Run().test(['lang-test0/28boolcasts.ts'], null)));
    it('29 lazyreferences', () => expect('').to.equals(new Run().test(['lang-test0/29lazyreferences.ts'], null)));
    it('30 null', () => expect('').to.equals(new Run().test(['lang-test0/30null.ts'], null)));
    it('32 complexcalls', () => expect('').to.equals(new Run().test(['lang-test0/32complexcalls.ts'], null)));
    it('33 inheritance', () => expect('').to.equals(new Run().test(['lang-test0/33inheritance.ts'], null)));
    it('34 switch', () => expect('').to.equals(new Run().test(['lang-test0/34switch.ts'], null)));
    it('35 lambdaparameters', () => expect('').to.equals(new Run().test(['lang-test0/35lambdaparameters.ts'], null)));
    it('36 interfaces', () => expect('').to.equals(new Run().test(['lang-test0/36interfaces.ts'], null)));
    it('37 objectliterals', () => expect('').to.equals(new Run().test(['lang-test0/37objectliterals.ts'], null)));
    it('38 bitsize', () => expect('').to.equals(new Run().test(['lang-test0/38bitsize.ts'], null)));
    it('39 objectdestructuring', () => expect('').to.equals(new Run().test(['lang-test0/39objectdestructuring.ts'], null)));
    it('40 generics', () => expect('').to.equals(new Run().test(['lang-test0/40generics.ts'], null)));
    it('41 anonymoustypes', () => expect('').to.equals(new Run().test(['lang-test0/41anonymoustypes.ts'], null)));
    it('42 lambdaproperties', () => expect('').to.equals(new Run().test(['lang-test0/42lambdaproperties.ts'], null)));
    it('43 nestednamespace', () => expect('').to.equals(new Run().test(['lang-test0/43nestednamespace.ts'], null)));
    it('44 toplevelcode', () => expect('').to.equals(new Run().test(['lang-test0/44toplevelcode.ts'], null)));
    it('45 enumtostring', () => expect('').to.equals(new Run().test(['lang-test0/45enumtostring.ts'], null)));
    it('46 dynamicmaps', () => expect('').to.equals(new Run().test(['lang-test0/46dynamicmaps.ts'], null)));
    it('47 json', () => expect('').to.equals(new Run().test(['lang-test0/47json.ts'], null)));
    it('48 instanceof', () => expect('').to.equals(new Run().test(['lang-test0/48instanceof.ts'], null)));
    it('49 unicode', () => expect('').to.equals(new Run().test(['lang-test0/49unicode.ts'], null)));
    it('50 indexedtypes', () => expect('').to.equals(new Run().test(['lang-test0/50indexedtypes.ts'], null)));
    it('51 exceptions', () => expect('').to.equals(new Run().test(['lang-test0/51exceptions.ts'], null)));
    it('99 final', () => expect('').to.equals(new Run().test(['lang-test0/99final.ts'], null)));
    */
});

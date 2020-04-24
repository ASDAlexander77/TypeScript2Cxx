

//
// Note that this is supposed to run from command line.
// Do not use anything besides pause, control.runInBackground, console.log
//

// pause(2000)
type Action any;
type uint8 number;
type int8 number;
type uint16 number;
type int16 number;

namespace control {
	function runInBackground(f: ()=>void): void {
		f();
	}

	function dmesg(s: string): void {
	}
}

function pause(t: number) {
}

function msg(s: string): void {
    console.log(s)
    control.dmesg(s)
    //pause(50);
}

msg("start!")

function assert(cond: boolean, m?: string) {
    if (!cond) {
        msg("assertion failed: ")
        if (m) {
            msg(m)
	}

        throw m;
    }
}

//
// start tests
//

let glb1: number;
let s2: string;
let x: number;
let action: Action;
let tot: string;
let lazyAcc: number;
let sum: number;
let u8: uint8
let i8: int8
let u16: uint16
let i16: int16

let xyz = 12;


let hasFloat = true
if ((1 / 10) == 0) {
    hasFloat = false
}

class Testrec {
    str: string;
    num: number;
    _bool: boolean;
    str2: string;
}

function clean() {
    glb1 = 0
    s2 = ""
    x = 0
    action = null
    tot = ""
    lazyAcc = 0
    sum = 0
}
namespace indexed {
    interface Foo {
        [index: string]: string;
        foo: string;
    }

    interface Bar {
        [index: number]: string;
        foo: number;
    }

    export function run() {
        msg("Indexed types")

        let strIndex: {[index: string]: string} = {};
        strIndex["hello"] = "goodbye";
        assert(strIndex["hello"] === "goodbye", "String index read");

        let numIndex: {[index: number]: string} = {};
        numIndex[9] = "hello";
        assert(numIndex[9] === "hello", "Number index read");

        let strIndInter: Foo = {
            foo: "hello"
        };
        assert(strIndInter["foo"] === "hello", "String index read declared property");

        strIndInter["a"] = "b";
        assert(strIndInter["a"] === "b", "String index read dynamic property");

        strIndInter["foo"] = "hola";
        assert(strIndInter.foo === "hola", "String index set property via index");

        strIndInter.foo = "aloha";
        assert(strIndInter.foo === "aloha", "String index set property via qname");

        let numIndInter: Bar = {
            foo: 13
        };
        assert(numIndInter.foo === 13, "Number index read declared property");

        numIndInter[1] = "b";
        assert(numIndInter[1] === "b", "Number index read dynamic property");

        numIndInter.foo = 17
        assert(numIndInter.foo === 17, "Number index set property via qname");
    }
}

indexed.run();clean()
msg("test OK!")

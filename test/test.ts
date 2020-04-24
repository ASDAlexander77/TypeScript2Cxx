

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

function testNullJS() {
    let x: number
    assert(x === undefined, "undef0")
    assert(x == null, "null0")
    x = null
    //assert(x === null, "null1")
    assert(x == undefined, "undef1")
    x = 0
    assert(x != null, "null2")
}

function testNull() {
    msg("testNull")
    if (hasFloat) {
        testNullJS()
        return
    }
    let x = 0
    let y = 0
    x = null
    assert(x == y, "null")
    x = undefined
    assert(x == y, "undef")
    y = 1
    assert(x != y, "null")
}

testNull()


namespace UndefinedReturn {
    function bar() {
        return "foo123"
    }
    function foo(): any {
        let x = bar()
        if (!x)
            return 12
	return
    }
    function foo2(): any {
        let x = bar()
        if (x)
            return 12
	return
    }
    function foo3(): any {
        let x = bar()
    }
    function foo4(): any {
        let x = bar()
        return
    }
    function foo5() {
        let x = bar()
    }
    function foo6() {
        let x = bar()
        return
    }

    function testUndef() {
        msg("testUndef")
        assert(foo() === undefined)
        assert(foo2() === 12)
        assert(foo3() === undefined)
        assert(foo4() === undefined)
        //assert(foo5() === undefined)
        //assert(foo6() === undefined)
    }

    testUndef()
}
clean()
msg("test OK!")

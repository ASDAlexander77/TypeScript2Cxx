

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

function testFloat() {
    if (!hasFloat)
        return
    let v = 13 / 32
    v *= 32
    assert(v == 13, "/")
    for (let i = 0; i < 20; ++i) {
        v *= 10000
    }
    //assert(v > 1e81, "81")
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



testFloat()

function defaultArgs(x: number, y = 3, z = 7) {
    return x + y + z;
}

function optargs(x: number, y?: number, z?: number) {
    if (y == undefined)
        y = 0
    return x + y;
}

function optstring(x: number, s?: string) {
    if (s != null) {
        return parseInt(s) + x;
    }
    return x * 2;
}

function optstring2(x: number, s: string = null) {
    if (s != null) {
        return parseInt(s) + x;
    }
    return x * 2;
}

function testDefaultArgs() {
    msg("testDefaultArgs");
    assert(defaultArgs(1) == 11, "defl0")
    assert(defaultArgs(1, 4) == 12, "defl1")
    assert(defaultArgs(1, 4, 8) == 13, "defl2")

    assert(optargs(1) == 1, "opt0");
    assert(optargs(1, 2) == 3, "opt1");
    assert(optargs(1, 2, 3) == 3, "opt2");

    assert(optstring(3) == 6, "os0")
    assert(optstring(3, "7") == 10, "os1")
    assert(optstring2(3) == 6, "os0")
    assert(optstring2(3, "7") == 10, "os1")
}

testDefaultArgs();
clean()
msg("test OK!")

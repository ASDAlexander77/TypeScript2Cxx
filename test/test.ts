

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


function eqOp() {
    msg("eqOp")
    let x = 12
    assert((x += 10) == 22, "Y0")
    assert(x == 22, "Y1")
    x /= 2
    assert(x == 11, "Y2")

    let s = ("fo" + 1)
    let t = ("ba" + 2)
    s += t
    assert(s == "fo1b" + "a2", "fb")
}

function eqOpString() {
    msg("eqOpStr")
    let x = "fo"
    assert((x += "ba") == "foba", "SY0")
    assert(x == "foba", "SY1")
}

eqOp()
eqOpString()

function eq<A, B>(a: A, b: B) { return a == b as any as A }

function eqG() {
    assert(eq("2", 2), "2")
    assert(eq(2, "2"), "2'")
    assert(!eq("null", null), "=1")
    assert(!eq(null, "null"), "=2")
    assert(!eq("2", 3), "=3")
}

eqG()

clean()
msg("test OK!")

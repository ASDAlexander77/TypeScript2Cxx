

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
		thread(f);
	}

	function dmesg(s: string): void {
	}
}

function pause(t: number) {
	sleep(t);
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
function testArrayMap() {
    msg("testArrayMap");
    let strs = [1, 2, 3].map(x => "X" + x)
    let r = "A"
    for (let s of strs) {
        r += s
    }
    assert(r == "AX1X2X3", "map")

    let flt = [17, 8, 2, 3, 100].filter((x, i) => x == i)
    assert(flt.length == 2, "flt")
    assert(flt[1] == 3, "flt")

    let sum = [1, 2, 3].reduce((s, v) => s + v, 0)
    assert(sum == 6, "red")

    let x = ["A" + "12", "B" + "3"].map((k, i) => k.length + i).reduce((c, n) => c * n, 1)
    assert(x == 9, "9")
}

testArrayMap()
clean()
msg("test OK!")

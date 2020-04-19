

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


function testNumCollection(): void {
    msg("test num coll")
    let collXYZ: number[] = [];
    assert(collXYZ.length == 0, "");
    collXYZ.push(42);
    msg("#1")
    assert(collXYZ.length == 1, "");
    collXYZ.push(22);
    assert(collXYZ[1] == 22, "");
    msg("#2")
    collXYZ.splice(0, 1);
    msg("#2")
    assert(collXYZ[0] == 22, "");
    msg("#2")
    collXYZ.removeElement(22);
    msg("#2")
    assert(collXYZ.length == 0, "");
    msg("loop")
    for (let i = 0; i < 100; i++) {
        collXYZ.push(i);
    }
    assert(collXYZ.length == 100, "");

    collXYZ = [1, 2, 3];
    assert(collXYZ.length == 3, "cons");
    assert(collXYZ[0] == 1, "cons0");
    assert(collXYZ[1] == 2, "cons1");
    assert(collXYZ[2] == 3, "cons2");
    msg("loop done")
}
testNumCollection();

clean()
msg("test OK!")

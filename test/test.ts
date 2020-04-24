

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
msg("test top level code")
let xsum = 0;
let forclean = () => { }
for (let i = 0; i < 11; ++i) {
    xsum = xsum + i;
    forclean = () => { i = 0 }
}
forclean()
forclean = null
assert(xsum == 55, "mainfor")

control.runInBackground(() => {
    xsum = xsum + 10;
})

pause(20)
assert(xsum == 65, "mainforBg")
xsum = 0

assert(xyz == 12, "init")

function incrXyz() {
    xyz++;
    return 0;
}
let unusedInit = incrXyz();

assert(xyz == 13, "init2")
xyz = 0

for (let e of [""]) {}

s2 = ""
for (let i = 0; i < 3; i++) {
    let copy = i;
    control.runInBackground(() => {
        pause(10 * copy + 1);
        s2 = s2 + copy;
    });
}
pause(200)
assert(s2 == "012")
clean()
msg("test OK!")

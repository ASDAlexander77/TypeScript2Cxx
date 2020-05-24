

//
// Note that this is supposed to run from command line.
// Do not use anything besides pause, control.runInBackground, console.log
//

// pause(2000)
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
function testStrings(): void {
    msg("testStrings")
    assert((42).toString() == "42", "42");

    msg("ts0x")
    let s = "live";
    assert(s == "live", "hello eq");
    msg("ts0y")

    s = s + "4OK";
    let s2 = s;
    msg("ts0")
    assert(s.charCodeAt(4) == 52, "hello eq2");
    assert(s.charAt(4) == "4", "hello eq2X");
    assert(s[4] == "4", "hello eq2X");
    assert(s.length == 7, "len7");
    msg("ts0")
    s = "";

    pause(3)
    for (let i = 0; i < 10; i++) {
        msg("Y")
        s = s + i;
        msg(s)
    }
    assert(s == "0123456789", "for");
    let x = 10;
    s = "";
    while (x >= 0) {
        msg("X")
        s = s + x;
        x = x - 1;
    }
    assert(s == "109876543210", "while");
    msg(s);
    msg(s2);

    s2 = "";
    // don't leak ref

    x = 21
    s = "foo"
    s = `a${x * 2}X${s}X${s}Z`
    assert(s == "a42XfooXfoo" + "Z", "`")

    msg("X" + true)

    assert("X" + true == "Xt" + "rue", "boolStr")
    msg("testStrings DONE")
}

testStrings();
clean()
msg("test OK!")

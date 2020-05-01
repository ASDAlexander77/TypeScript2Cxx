

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
function testStringCollection(): void {
    let coll = (<string[]>[]);
    coll.push("foobar");
    coll.push((12).toString());
    coll.push(coll[0] + "xx");
    assert(coll.indexOf("12") == 1, "idx");
    coll = [
        "a" + "b",
        coll[2],
    ]
    assert(coll[0] == "ab", "")
    assert(coll[1] == "foob" + "arxx", "")
    assert(coll.length == 2, "")
}

function testUnionIndexer(): void {
    type SmallNumber = (0 | 1) | (1 | 2) | 2;
    const arr: string[] = ["foo", "bar", "baz"];

    let index: SmallNumber = 0;
    assert(arr[index] === arr[0]);

    index = 1;
    assert(arr[index] === arr[1]);

    // need to cast to get past typescript narrowing without randomness
    index = 2 as SmallNumber;
    if (index === 0) {
        return;
    }

    assert(arr[index] === arr[2]);
}

testStringCollection();
testUnionIndexer();
clean()
msg("test OK!")

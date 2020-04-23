

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
namespace unicode {
    export function run() {
        let shortASCII = "hello world!"
        let shortUTF = "hęłłó world!"
        let longASCII = `
99 Bottles of beer on the wall!
Take one down
Pass it around
98 Bottles of beer on the wall!
Take one down
Pass it around
97 Bottles of beer on the wall
Take one down
Pass it around
`
        let longUTF = `
99 Bottlęs of beer on the wall! 💺
Take one down
Pass it around
98 Bottłeś of beer on the wall! 💃
Take one down
Pass it around
97 Bottles of beer on the wall! 😂
Take óne down
Pasś it around
`

        testAllStr(shortASCII)
        testAllStr(shortUTF)
        testAllStr(longASCII)
        testAllStr(longUTF)
        testAllStr(longUTF + longASCII)
        testAllStr(longUTF + shortUTF)
    }


    function testAllStr(s: string) {
        msg("utf8-t: " + s.length)
        testOneCh(s)
        testFromCh(s)
        testSliceR(s)
    }

    function testOneCh(s: string) {
        let r = ""
        for (let i = 0; i < s.length; ++i)
            r += s[i]
        assert(s.length == r.length, "1chL")
        assert(s == r, "1ch")
    }

    function testFromCh(s: string) {
        let r = ""
        for (let i = 0; i < s.length; ++i)
            r += String.fromCharCode(s.charCodeAt(i))
        assert(s == r, "1fch")
    }

    function testSliceR(s: string) {
        for (let rep = 0; rep < 20; ++rep) {
            let r = ""
            for (let i = 0; i < s.length;) {
                let len = Math.randomRange(0, 10)
                r += s.slice(i, i + len)
                i += len
            }
            assert(s == r, "1sl")
        }
    }
}

unicode.run()
clean()
msg("test OK!")

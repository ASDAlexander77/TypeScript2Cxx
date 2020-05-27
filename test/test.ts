

//
// Note that this is supposed to run from command line.
// Do not use anything besides pause, control.runInBackground, console.log
//

// pause(2000)
type uint8 number;
type int8 number;
type uint16 number;
type int16 number;
type Function any;
type Action any;

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

function doubleIt(f: (x: number) => number) {
    return f(1) - f(2)
}

function triple(f: (x: number, y: number, z: number) => number) {
    return f(5, 20, 8)
}

function checkLen(f: (x: string) => string, k: number) {
    // make sure strings are GCed
    f("baz")
    let s = f("foo")
    assert(s.length == k, "len")
}

function testLambdas() {
    let x = doubleIt(k => {
        return k * 108
    })
    assert(x == -108, "l0")
    x = triple((x, y, z) => {
        return x * y + z
    })
    assert(x == 108, "l1")
    checkLen((s) => {
        return s + "XY1"
    }, 6)
    checkLen((s) => s + "1212", 7)
}

function testLambdaDecrCapture() {
    let x = 6
    function b(s: string) {
        assert(s.length == x, "dc")
    }
    b("fo0" + "bAr")
}

function testNested() {
    glb1 = 0

    const x = 7
    let y = 1

    function bar(v: number) {
        assert(x == 7 && y == v)
        glb1++
    }
    function bar2() {
        glb1 += 10
    }

    bar(1)
    y++
    bar(2)
    bar2()
    assert(glb1 == 12)
    glb1 = 0
    const arr = [1,20,300]
    for (let k of arr) {
        function qux() {
            glb1 += k
        }
        qux()
    }
    assert(glb1 == 321)

    const fns: any[] = []
    for (let k of arr) {
        const kk = k
        function qux2() {
            glb1 += kk
        }
        fns.push(qux2)
    }
    glb1 = 0
    for (let f of fns) f()
    assert(glb1 == 321)
}

testLambdas();
testLambdaDecrCapture();
testNested()clean()
msg("test OK!")

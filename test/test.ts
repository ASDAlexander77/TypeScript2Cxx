

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



class XFoo {
    pin: number;
    buf: number[];

    constructor(k: number, l: number) {
        this.pin = k - l
    }

    setPin(p: number) {
        this.pin = p
    }

    getPin() {
        return this.pin
    }

    init() {
        this.buf = [1, 2]
    }

    toString() {
        return `Foo${this.getPin()}`
    }
}

function testClass() {
    let f = new XFoo(272, 100);
    assert(f.getPin() == 172, "ctor")
    f.setPin(42)
    assert(f.getPin() == 42, "getpin")
}

function testToString() {
    msg("testToString")
    let f = new XFoo(44, 2)
    let s = "" + f
    assert(s == "Foo42", "ts")
}

testToString()
testClass()


class CtorOptional {
    constructor(opts?: string) {
    }
}
function testCtorOptional() {
    let co = new CtorOptional();
    let co2 = new CtorOptional("");
}
testCtorOptional();

namespace ClassInit {
    const seven = 7
    class FooInit {
        baz: number
        qux = seven
        constructor(public foo: number, public bar: string) {
            this.baz = this.foo + 1
        }
        semicolonTest() { };
    }

    export function classInit() {
        let f = new FooInit(13, "blah" + "baz")
        assert(f.foo == 13, "i0")
        assert(f.bar == "blahbaz", "i1")
        assert(f.baz == 14, "i2")
        assert(f.qux == 7, "i3")
    }
}

ClassInit.classInit()
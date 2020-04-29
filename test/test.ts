

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
namespace exceptions {
    function immediate(k: number) {
        try {
            pause(1)
            if (k > 0)
                throw "hl" + k
            pause(1)
            glb1++
        } catch (e) {
            assert(e == "hl" + k)
            glb1 += 10
            if (k >= 10)
                throw e
        } finally {
            x += glb1
        }
    }

    function throwVal(n: number) {
        pause(1)
        if (n > 0)
            throw "hel" + n
        pause(1)
    }


    function higherorder(k: number) {
        try {
            [1].map(() => throwVal(k))
            glb1++
        } catch (e) {
            assert(e == "hel" + k)
            glb1 += 10
            if (k >= 10)
                throw e
        } finally {
            x += glb1
        }
    }

    function lambda(k:number) {
        function inner() {
            try {
                throwVal(k)
                glb1++
            } catch (e) {
                assert(e == "hel" + k)
                glb1 += 10
                if (k >= 10)
                    throw e
            } finally {
                x += glb1
            }
        }
        inner()
    }

    function callingThrowVal(k: number) {
        try {
            pause(1)
            throwVal(k)
            pause(1)
            glb1++
        } catch (e) {
            assert(e == "hel" + k)
            glb1 += 10
            if (k >= 10)
                throw e
        } finally {
            x += glb1
        }
    }

    function nested() {
        try {
            try {
                callingThrowVal(10)
            } catch (e) {
                assert(glb1 == 10 && x == 10)
                glb1++
                throw e
            }
        } catch (ee) {
            assert(glb1 == 11)
        }
    }

    function test3(fn:(k:number)=>void) {
        glb1 = x = 0
        fn(1)
        assert(glb1 == 10 && x == 10)
        fn(0)
        assert(glb1 == 11 && x == 21)
        fn(3)
        assert(glb1 == 21 && x == 42)
    }

    export function run() {
        msg("test exn")
        glb1 = x = 0
        callingThrowVal(1)
        assert(glb1 == 10 && x == 10)
        callingThrowVal(0)
        assert(glb1 == 11 && x == 21)
        callingThrowVal(3)
        assert(glb1 == 21 && x == 42)

        test3(callingThrowVal)
        test3(immediate)
        test3(higherorder)
        test3(lambda)

        glb1 = x = 0
        nested()
        assert(glb1 == 11)
        msg("test exn done")
    }
}

exceptions.run();clean()
msg("test OK!")



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
namespace Ifaces {
    interface IFoo {
        foo(): number;
        bar(x: number): string;
        twoArg(x: number, y: number): number;
        baz: string;
    }

    class A {
        constructor() {
            this.baz = "Q" + "A"
        }
        foo() {
            return 12
        }
        bar(v: number) {
            return v.toString()
        }
        twoArg(x: number) {
           return x
        }
        baz: string;
    }
    class B extends A {
        foo() {
            return 13
        }
    }

    function foo(f: IFoo) {
        return f.foo() + f.baz + f.bar(42)
    }

    export function run() {
        msg("Ifaces.run")
        let a = new A()
        assert(foo(a) + "X" == "12QA42X")
        assert((a as IFoo).twoArg(1, 2) == 1, "t")
        a = new B()
        assert(foo(a) + "X" == "13QA42X", "b")
        let q = a as IFoo
        q.baz = "Z"
        assert(foo(q) + "X" == "13Z42X", "x")
        msg("Ifaces.runDONE")
    }
}

Ifaces.run()
clean()
msg("test OK!")

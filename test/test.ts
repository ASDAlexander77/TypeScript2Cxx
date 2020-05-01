

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
namespace DynamicMaps {
    interface V {
        foo: number;
        bar: string;
    }

    class Blah {
        foo: number;
        bar: string;
    }

    function check(v: V) {
        return `${v.foo + 1}/${v.bar}`
    }

    function checkA(v: any) {
        return `${v.foo + 1}/${v.bar}`
    }

    function upd(v: V) {
        v.foo += 1
        v.bar += "a"
    }

    function updA(v: any) {
        v.foo = v.foo + 1
        v.bar = v.bar + "a"
    }

    function updI(v: any) {
        v["foo"] = v["foo"] + 1
        v["bar"] = v["bar"] + "a"
    }

    function updIP(v: any, foo: string, bar: string) {
        v[foo] = v[foo] + 1
        v[bar] = v[bar] + "a"
    }

    function allChecks(v: V) {
        assert(check(v) == "2/foo", ".v")

        msg(checkA(v))
        msg(check(v))

        assert(checkA(v) == check(v), ".z2")
        upd(v)
        assert(check(v) == "3/fooa", ".v2")
        updA(v)
        assert(check(v) == "4/fooaa", ".v3")
        updI(v)
        assert(check(v) == "5/fooaaa", ".v4")
        updIP(v, "foo", "bar")
        assert(check(v) == "6/fooaaaa", ".v6")
        assert(checkA(v) == check(v), ".z3")
    }

    export function run() {
        msg("dynamicMaps")
        
        let v: any = {
            foo: 1,
            bar: "foo"
        }

        let z = new Blah()
        z.foo = 12
        z.bar = "blah"

        assert(check(z) == "13/blah", ".z")

        z.foo = 1
        z.bar = "foo"

        allChecks(v)
        msg("dynamic class")
        allChecks(z)
    }
}

DynamicMaps.run()
clean()
msg("test OK!")

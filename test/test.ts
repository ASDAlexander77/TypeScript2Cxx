

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
namespace ObjLit {
    interface Opts {
        width?: number;
        height?: number;
        msg?: string;
    }
    class OptImpl {
        width: number;
        get height() {
            return 33
        }
        get msg() {
            return "X" + "OptImpl"
        }
    }
    function foo(o: Opts) {
        if (!o.msg) {
            o.msg = "None"
        }
        if (!o.height)
            o.height = 0
        //msg(`w=${ o.width } h=${ o.height } m=${ o.msg }`)
        glb1 += o.width - o.height + o.msg.length
    }

    function str(o: any) {
        let r = ""
        for (let k of Object.keys(o)) {
            if (r) r += ","
            r += k + ":" + o[k]
        }
        return r
    }

    function computedPropNames() {
        msg("computedPropNames")
        const f = 10
        const o = { f, ["c" + "x"]: 12, 1: "x", [1 + 2]: "b123" }
        assert(str(o) == "f:10,cx:12,1:x,3:b123")
    }

    function shorthandTest() {
        msg("shorthandTest")
        const x = 12
        const y = "foo"
        const o = { x, y, z: 33 }
        assert(str(o) == "x:12,y:foo,z:33")
        const o2 = { x }
        assert(str(o2) == "x:12")
    }

    function deleteTest() {
        msg("deleteTest")
        const o: any = {
            a: 1,
            b: 2,
            c: "3"
        }

        delete o.b
        assert(str(o) == "a:1,c:3")

        delete o["a"]
        assert(str(o) == "c:3")

        o.a = 17
        assert(str(o) == "c:3,a:17")

        delete o["XaX".slice(1, 2)]
        assert(str(o) == "c:3")

        o[1] = 7
        assert(str(o) == "c:3,1:7")
        delete o[1]
        assert(str(o) == "c:3")

        const u: string = undefined
        o[u] = 12
        assert(str(o) == "c:3,undefined:12")
        delete o[u]
        assert(str(o) == "c:3")
    }

    export function run() {
        msg("Objlit")
        glb1 = 0
        foo({
            width: 12,
            msg: "h" + "w"
        })
        assert(glb1 == 14, "g14")
        foo({
            width: 12,
            height: 13
        })
        assert(glb1 == 17, "g17")

        let op: Opts = {}
        op.width = 10
        op.msg = "X" + "Z123"
        foo(op)
        assert(glb1 == 17 + 15, "g+")

        glb1 = 0
        let v = new OptImpl()
        v.width = 34
        foo(v)
        assert(glb1 == 9)

        deleteTest()
        shorthandTest()
        computedPropNames()

        msg("Objlit done")
    }
}
ObjLit.run()
clean()
msg("test OK!")

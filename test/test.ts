

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
namespace ObjectDestructuring {
    class X {
        public a: number;
        public b: string;
        public c: boolean;
        public d: Y;
    }

    class Y {
        public e: number;
        public f: number;
    }

    function testFunction(callBack: (x: X) => void) {
        const test = new X();
        test.a = 17;
        test.b = "okay";
        test.c = true;

        const subTest = new Y();
        subTest.e = 18;
        subTest.f = 19;

        test.d = subTest;

        callBack(test);
    }

    function arrayAssignment() {
        let [a, b, c] = [1, "foo", 3];
        assert(a == 1, "[]")
        assert(c == 3, "[]");
        assert(b == "foo", "[1]");
        [a, c] = [c, a];
        assert(a == 3, "[2]");
        assert(c == 1, "[]")
    
        const q = [4, 7];
        let p = 0;
        [a, c, p] = q;
        assert(a == 4, "[]");
        assert(c == 7, "[]");
        assert(p === undefined, "[]");
    
        let [aa, [bb, cc]] = [4, [3, [1]]]
        assert(aa == 4, "[[]]")
        assert(bb == 3, "[[]]")
        assert(cc.length == 1, "[[]]")
    
        msg("arrayAssignment done")
    }
    
    class ObjF {
        constructor(public x: number, public y: string) { }
    }
    
    function objectAssignment() {
        //let {aa,bb} = {aa:10,bb:20}
        //console.log(aa + bb)
    
        let { aa, bb: { q, r } } = { aa: 10, bb: { q: 1, r: 2 } }
        assert(aa == 10, "{}")
        assert(q == 1, "{}")
        assert(r == 2, "{}")
    
        let { x, y } = new ObjF(1, "foo")
        assert(x == 1, "{}")
        assert(y == "foo", "{}")
    
        msg("objectAssignment done")
    
    }
    


    export function run() {
        glb1 = 0;

        testFunction(({}) => {
            glb1 = 1;
        });

        assert(glb1 === 1)

        testFunction(({a}) => {
            assert(a === 17);
            glb1 = 2;
        })

        assert(glb1 === 2);

        testFunction(({a: hello}) => {
            assert(hello === 17);
            glb1 = 3;
        })

        assert(glb1 === 3);

        testFunction(({a, b, c}) => {
            assert(a === 17);
            assert(b === "okay");
            assert(c);
            glb1 = 4;
        })

        assert(glb1 === 4);

        testFunction(({d: {e, f}}) => {
            assert(e === 18);
            assert(f === 19);
            glb1 = 5;
        })

        assert(glb1 === 5);

        arrayAssignment()
        objectAssignment()    
    }
}

ObjectDestructuring.run();
clean()
msg("test OK!")

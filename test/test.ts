

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
function inBg() {
    let k = 7
    let q = 14
    let rec = new Testrec();
    glb1 = 0
    control.runInBackground(() => {
        glb1 = glb1 + 10 + (q - k)
        rec.str = "foo"
    })
    control.runInBackground(() => {
        glb1 = glb1 + 1
    })
    pause(50)
    assert(glb1 == 18, "inbg0")
    assert(rec.str == "foo", "inbg1")
    glb1 = 0
}

function runTwice(fn: Action): void {
    msg("r2 start");
    fn();
    fn();
    msg("r2 stop");
}

function iter(max: number, fn: (v: number) => void) {
    for (let i = 0; i < max; ++i) {
        fn(i);
    }
}

function testIter() {
    x = 0
    iter(10, v => {
        x = x + (v + 1)
    })
    assert(x == 55, "55")
    x = 0
}

function testAction(p: number): void {
    msg("testActionStart")
    let s = "hello" + "1";
    let coll = [] as number[];
    let p2 = p * 2;
    x = 42;
    runTwice(() => {
        x = x + p + p2;
        coll.push(x);
        msg(s + x);
    });
    assert(x == 42 + p * 6, "run2");
    assert(coll.length == 2, "run2");
    x = 0
    msg("testActionDone")
}

function add7() {
    sum = sum + 7;
}

function testFunDecl() {
    msg("testFunDecl");
    let x = 12;
    sum = 0;
    function addX() {
        sum = sum + x;
    }
    function add10() {
        sum = sum + 10;
    }
    runTwice(addX)
    assert(sum == 24, "cap")
    msg("testAdd10");
    runTwice(add10);
    msg("end-testAdd10");
    assert(sum == 44, "nocap");
    runTwice(add7);
    assert(sum == 44 + 14, "glb")
    addX();
    add10();
    assert(sum == 44 + 14 + x + 10, "direct");
    sum = 0
}

function saveAction(fn: Action): void {
    action = fn;
}

function saveGlobalAction(): void {
    let s = "foo" + "42";
    tot = "";
    saveAction(() => {
        tot = tot + s;
    });
}

function testActionSave(): void {
    saveGlobalAction();
    msg("saveAct")
    runTwice(action);
    msg("saveActDONE")
    msg(tot);
    assert(tot == "foo42foo42", "");
    tot = "";
    action = null;
}

function testLoopScope() {
    for (let i = 0; i < 3; ++i) {
        let val: number
        assert(val === undefined, "loopscope");
        val = i
    }
}

inBg();
testAction(1);
testAction(7);
testIter();
testActionSave();
testFunDecl();
testLoopScope();clean()
msg("test OK!")

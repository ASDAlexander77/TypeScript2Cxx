

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


function testRefLocals(): void {
    msg("start test ref locals");
    let s = "";
    for (let i of [3, 2, 1]) {
        let copy = i;
        control.runInBackground(() => {
            pause(10 * i);
            copy = copy + 10;
        });
        control.runInBackground(() => {
            pause(20 * i);
            s = s + copy;
        });
    }
    pause(200);
    assert(s == "111213", "reflocals");
}

function byRefParam_0(p: number): void {
    control.runInBackground(() => {
        pause(1);
        sum = sum + p;
    });
    p = p + 1;
}

function byRefParam_2(pxx: number): void {
    pxx = pxx + 1;
    control.runInBackground(() => {
        pause(1);
        sum = sum + pxx;
    });
}

function testByRefParams(): void {
    msg("testByRefParams");
    refparamWrite("a" + "b");
    refparamWrite2(new Testrec());
    refparamWrite3(new Testrec());
    sum = 0;
    let x = 1;
    control.runInBackground(() => {
        pause(1);
        sum = sum + x;
    });
    x = 2;
    byRefParam_0(4);
    byRefParam_2(10);
    pause(330);
    assert(sum == 18, "by ref");
    sum = 0
    msg("byref done")
}

function refparamWrite(s: string): void {
    s = s + "c";
    assert(s == "abc", "abc");
}

function refparamWrite2(testrec: Testrec): void {
    testrec = new Testrec();
    if (hasFloat)
        assert(testrec._bool === undefined, "rw2f");
    else
        assert(testrec._bool == false, "rw2");
}

function refparamWrite3(testrecX: Testrec): void {
    control.runInBackground(() => {
        pause(1);
        assert(testrecX.str == "foo", "ff");
        testrecX.str = testrecX.str + "x";
    });
    testrecX = new Testrec();
    testrecX.str = "foo";
    pause(130);
    assert(testrecX.str == "foox", "ff2");
}

function allocImage(): void {
    let tmp = createObj();
}

function runOnce(fn: Action): void {
    fn();
}

function createObj() {
    return new Testrec();
}

function testMemoryFreeHOF(): void {
    msg("testMemoryFreeHOF");
    for (let i = 0; i < 1000; i++) {
        runOnce(() => {
            let tmp = createObj();
        });
    }
}

testMemoryFreeHOF();


function testMemoryFree(): void {
    msg("testMemoryFree");
    for (let i = 0; i < 1000; i++) {
        allocImage();
    }
}


testRefLocals();
testByRefParams();
testMemoryFree();
clean()
msg("test OK!")



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
class Node<T> {
    v: T;
    k: string;
    next: Node<T>;
}

class Map<T> {
    head: Node<T>;

    getElt(k: string): T {
        return mapGet(this, k)
    }

    setElt(k: string, v: T) {
        mapSet(this, k, v)
    }
}

function mapSet<T>(m: Map<T>, k: string, v: T) {
    for (let p = m.head; p != null; p = p.next) {
        if (p.k == k) {
            p.v = v
            return
        }
    }
    let n = new Node<T>()
    n.next = m.head
    n.k = k
    n.v = v
    m.head = n
}

function mapGet<T>(m: Map<T>, k: string): T {
    for (let p = m.head; p != null; p = p.next) {
        if (p.k == k) {
            return p.v
        }
    }
    return null
}


function search_array<T>(a: T[], item: T): number {
    for (let i = 0; i < a.length; i++) {
        if (a[i] == item) {
            return i
        }
    }
    return -1 // NOT FOUND
}

class MyMap<K, V> {

    keys: K[]
    values: V[]

    constructor() {
        this.keys = []
        this.values = []
    }

    push(key: K, value: V) {
        this.keys.push(key)
        this.values.push(value)
    }

    value_for(key: K): V {
        let i = search_array(this.keys, key)
        if (i == -1) {
            return null
        }
        return this.values[i]
    }

    key_for(value: V): K {
        let i = search_array(this.values, value)
        if (i == -1) {
            return null
        }
        return this.keys[i]
    }
    set(key: K, value: V): void {
        let i = search_array(this.keys, key)
        if (i == -1) {
            this.keys.push(key)
            this.values.push(value)
        } else {
            this.values[i] = value
        }
    }

    has_key(key: K): boolean {
        return search_array(this.keys, key) != -1
    }

    has_value(value: V): boolean {
        return search_array(this.values, value) != -1
    }

}


function testMaps() {
    let m = new Map<number>();
    let q = new Map<string>();
    let r = new MyMap<number, string>()

    mapSet(q, "one", "foo" + "bar")
    assert(mapGet(q, "one").length == 6, "m0")

    mapSet(q, "one", "foo2" + "bar")
    assert(mapGet(q, "one").length == 7, "m1")
    q.setElt("two", "x" + "y")
    assert(q.getElt("two").length == 2, "m2")
    q.setElt("two", "x" + "yz")
    assert(q.getElt("two").length == 3, "thr")


    mapSet(m, "one", 1)
    assert(mapGet(m, "one") == 1, "1")

    mapSet(m, "two", 2)
    assert(m.getElt("two") == 2, "2")
    //control.assert(mapGet(m, "zzzz") == null, "0")
}

testMaps()
clean()
msg("test OK!")

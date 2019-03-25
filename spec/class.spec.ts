import { Run } from '../src/compiler';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Classes', () => {

    it('Class static member', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public static show() {                      \
                console.log("Hello");                   \
            }                                           \
        }                                               \
                                                        \
        Class1.show();                                  \
    '])));

    it('Class static member with parameter', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public static show(s:string) {              \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        Class1.show("Hello");                           \
    '])));

    it('new instance of Class with parametered member', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public show(s:string) {                     \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        new Class1().show("Hello");                     \
    '])));

    it('new instance of Class with parametered member into local', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            public show(s:string) {                     \
                console.log(s);                         \
            }                                           \
        }                                               \
                                                        \
        let c = new Class1();                           \
        c.show("Hello");                                \
    '])));

    it('new instance of Class with setting class field', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        new Class1().set("Hello").show();               \
    '])));

    it('new instance of Class with setting class field via local', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        let c = new Class1();                           \
        c.set("Hello").show();                          \
    '])));

    it('new instance of Class with setting class field via global', () => expect('Hello\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
                                                        \
            public set(s: string): Class1 {             \
                this.val = s;                           \
                return this;                            \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1();                           \
        c.set("Hello").show();                          \
    '])));

    it('new instance of Class with setting class default fields', () => expect('0\r\n0\r\n0\r\n').to.equals(new Run().test([
        'class Vector3 {                                \
            constructor(                                \
                public x: number = 0,                   \
                public y: number = 0,                   \
                public z: number = 0                    \
            ) {}                                        \
        }                                               \
        var v = new Vector3();                          \
        console.log(v.x);                               \
        console.log(v.y);                               \
        console.log(v.z);                               \
    '])));

    it('Class private member in constructor', () => expect('1\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            constructor(private i: number) {                \
            }                                               \
                                                            \
            public show() {                                 \
              console.log(this.i);                          \
            }                                               \
          }                                                 \
                                                            \
          let c = new Class1(1);                            \
          c.show();                                         \
                                                            \
    '])));

    it('Class inheritance', () => expect('false\r\nfalse\r\ntrue\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            public method1(): boolean {                     \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
            public method2(): boolean {                     \
                return true;                                \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        console.log(c1.method1());                          \
        const c2 = new Class2();                            \
        console.log(c2.method1());                          \
        console.log(c2.method2());                          \
    '])));

    it('Class inheritance - with static get accessor', () => expect('false\r\nfalse\r\ntrue\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            public method1(): boolean {                     \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
                                                            \
            public static get Name() {                      \
                return "test";                              \
            }                                               \
                                                            \
            public method2(): boolean {                     \
                return true;                                \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        console.log(c1.method1());                          \
        const c2 = new Class2();                            \
        console.log(c2.method1());                          \
        console.log(c2.method2());                          \
    '])));

    it('Class inheritance - call super class', () => expect('false\r\nfalse\r\n').to.equals(new Run().test([
        'class Class1 {                                     \
            public method1(): boolean {                     \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
            public method1(): boolean {                     \
                return super.method1();                     \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        console.log(c1.method1());                          \
        const c2 = new Class2();                            \
        console.log(c2.method1());                          \
    '])));

    it('Class inheritance - call super class with this', () => expect(new Run().test([
        'class Class1 {                                     \
            public class0 = false;                          \
            public method1(): boolean {                     \
                this.class1 = false;                        \
                return false;                               \
            }                                               \
        }                                                   \
        class Class2 extends Class1 {                       \
            public method1(): boolean {                     \
                this.class1 = true;                         \
                this.class2 = false;                        \
                return super.method1();                     \
            }                                               \
        }                                                   \
        const c1 = new Class1();                            \
        c1.method1();                                       \
        console.log(c1.class0);                             \
        console.log(c1.class1);                             \
        const c2 = new Class2();                            \
        c2.method1();                                       \
        console.log(c2.class0);                             \
        console.log(c2.class1);                             \
        console.log(c2.class2);                             \
    '])).to.equals('false\r\nfalse\r\nfalse\r\nfalse\r\nfalse\r\n'));


    it('Class inheritance - instance', () => expect('true\r\ntrue\r\nfalse\r\n').to.equals(new Run().test([
        'class Class1 {                                             \
        }                                                           \
                                                                    \
        class Class2 extends Class1 {                               \
        }                                                           \
                                                                    \
        class Class3 {                                              \
        }                                                           \
                                                                    \
        let c2 = new Class2();                                      \
        console.log(c2 instanceof Class2);                          \
        console.log(c2 instanceof Class1);                          \
        console.log(c2 instanceof Class3);                          \
    '])));

    it('Class inheritance - complete example',  () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.name = name; }             \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
            public getElevatorPitch() {                                 \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                           \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.getElevatorPitch());                         \
    '])));

    it('Class inheritance - complete example with property',
    () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.name = name; }             \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
            public get ElevatorPitch() {                                 \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                           \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.ElevatorPitch);                              \
    '])));

    it('Class inheritance - complete example with property on base class',
    () => expect(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.name = name; }             \
            public get ElevatorPitch() {                                \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                           \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.ElevatorPitch);                              \
    '])).to.equals('Hello, my name is Howard and I work in Sales.\r\n'));

    it('Class inheritance - complete example with property on base class 2',
    () => expect(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.Name = name; }             \
            public get ElevatorPitch() {                                \
                return `Hello, my name is ${this.Name} and I work in ${this.department}.`;  \
            }                                                           \
                                                                        \
            public get Name() {                                         \
                return this.name;                                       \
            }                                                           \
                                                                        \
            public set Name(val: string) {                              \
                this.name = val;                                        \
            }                                                           \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.department = department;                           \
            }                                                           \
                                                                        \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.ElevatorPitch);                              \
    '])).to.equals('Hello, my name is Howard and I work in Sales.\r\n'));

    it('Class inheritance - complete example with property on base class 3',
    () => expect(new Run().test([
        'class Person {                                                 \
            protected name: string;                                     \
            constructor(name: string) { this.Name = name; }             \
            public get ElevatorPitch() {                                \
                return `Hello, my name is ${this.Name} and I work in ${this.department}.`;  \
            }                                                           \
                                                                        \
            public get Name() {                                         \
                return this.name;                                       \
            }                                                           \
                                                                        \
            public set Name(val: string) {                              \
                this.name = val;                                        \
            }                                                           \
        }                                                               \
                                                                        \
        class Employee extends Person {                                 \
            private department: string;                                 \
                                                                        \
            constructor(name: string, department: string) {             \
                super(name);                                            \
                this.Department = department;                           \
            }                                                           \
                                                                        \
            public get Department() {                                   \
                return this.department;                                 \
            }                                                           \
                                                                        \
            public set Department(val: string) {                        \
                this.department = val;                                  \
            }                                                           \
        }                                                               \
                                                                        \
        let howard = new Employee("Howard", "Sales");                   \
        console.log(howard.ElevatorPitch);                              \
    '])).to.equals('Hello, my name is Howard and I work in Sales.\r\n'));

    it('Class - default ctor - readonly',  () => expect('8\r\n').to.equals(new Run().test([
        'class Octopus {                                                \
            readonly numberOfLegs: number = 8;                          \
        }                                                               \
                                                                        \
        let dad = new Octopus();                                        \
        console.log(dad.numberOfLegs);                                  \
        '])));

    it('Class - readonly',  () => expect('8\r\n').to.equals(new Run().test([
        'class Octopus {                                                \
            readonly name: string;                                      \
            readonly numberOfLegs: number = 8;                          \
            constructor (theName: string) {                             \
                this.name = theName;                                    \
                console.log(this.numberOfLegs);                         \
            }                                                           \
        }                                                               \
                                                                        \
        let dad = new Octopus("Man with the 8 strong legs");            \
    '])));

    it('Class - call base class constructor',  () => expect(new Run().test([
        'class Test {                                                   \
            public constructor(private name: string) {                  \
                console.log(this.name);                                 \
            }                                                           \
        }                                                               \
                                                                        \
        class Test2 extends Test {                                      \
        }                                                               \
                                                                        \
        const c = new Test2("asd");                                     \
        console.log(c.name);                                            \
    '])).to.equals('asd\r\nasd\r\n'));

    it('Class - call base class constructor with abstract method and default constructor',  () => expect(new Run().test([
        'class Test {                                                   \
            public constructor(private name: string) {                  \
                console.log(this.name);                                 \
            }                                                           \
        }                                                               \
                                                                        \
        class Test2 extends Test {                                      \
            private _t: boolean = true;                                 \
            protected abstract _abstr(): void;                          \
        }                                                               \
                                                                        \
        class Test3 extends Test2 {                                     \
        }                                                               \
                                                                        \
        const c = new Test3("asd");                                     \
        console.log(c.name);                                            \
    '])).to.equals('asd\r\nasd\r\n'));

    // function is not using 'this' and thus making issue with parameters
    it('Class - generic',  () => expect(new Run().test([
        'class GenericNumber<T> {                                           \
            zeroValue: T;                                                   \
            add: (x: T, y: T) => T;                                         \
        }                                                                   \
                                                                            \
        let stringNumeric = new GenericNumber<string>();                    \
        stringNumeric.zeroValue = "";                                       \
        stringNumeric.add = function(x: string, y: string) { return x + y; }; \
                                                                            \
        console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));    \
    '])).to.equals('test\r\n'));

    it('Class - generic 2',  () => expect('2\r\n1\r\n').to.equals(new Run().test([
        'class Animal {                                                     \
            protected constructor(public numLegs: number) {                 \
            }                                                               \
        }                                                                   \
                                                                            \
        class Bee extends Animal {                                          \
            public constructor() {                                          \
                super(1);                                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        class Lion extends Animal {                                         \
            public constructor() {                                          \
                super(2);                                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        function createInstance<A extends Animal>(c: new () => A): A {      \
            return new c();                                                 \
        }                                                                   \
                                                                            \
        console.log(createInstance(Lion).numLegs);                          \
        console.log(createInstance(Bee).numLegs);                           \
    '])));

    it('Class - Accessors',  () => expect('Bob Smith\r\nBob Smith\r\n').to.equals(new Run().test([
        'class Employee {                                                   \
            _fullName: string;                                              \
                                                                            \
            get fullName(): string {                                        \
                return this._fullName;                                      \
            }                                                               \
                                                                            \
            set fullName(newName: string) {                                 \
                this._fullName = newName;                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        let employee = new Employee();                                      \
        employee.fullName = "Bob Smith";                                    \
        console.log(employee.fullName);                                     \
        console.log(employee._fullName);                                    \
    '])));

    it('Class - Accessors 2',  () => expect('Hello, my name is Howard and I work in Sales.\r\n').to.equals(new Run().test([
        'class Person {                                                     \
            protected name: string;                                         \
            constructor(name: string) { this.name = name; }                 \
        }                                                                   \
                                                                            \
        class Employee extends Person {                                     \
            private department: string;                                     \
                                                                            \
            constructor(name: string, department: string) {                 \
                super(name);                                                \
                this.department = department;                               \
            }                                                               \
                                                                            \
            public get ElevatorPitch() {                                    \
                return `Hello, my name is ${this.name} and I work in ${this.department}.`;  \
            }                                                               \
        }                                                                   \
                                                                            \
        let howard = new Employee("Howard", "Sales");                       \
        console.log(howard.ElevatorPitch);                                  \
    '])));

    it('Class - Static Get Accessors',  () => expect('1\r\n').to.equals(new Run().test([
        'class Engine {                                                     \
            public static get Last(): number {                              \
                return 1;                                                   \
            }                                                               \
        }                                                                   \
                                                                            \
        console.log(Engine.Last);                                           \
    '])));

    it('Class - Static Get/Set Accessors',  () => expect('1\r\n').to.equals(new Run().test([
        'class Engine {                                                     \
            private _last: number;                                          \
                                                                            \
            public static get Last(): number {                              \
                return this._last;                                          \
            }                                                               \
                                                                            \
            public static set Last(v: number) {                             \
                this._last = v;                                             \
            }                                                               \
        }                                                                   \
                                                                            \
        Engine.Last = 1;                                                    \
        console.log(Engine.Last);                                           \
    '])));

    it('Class - Get/Set Accessors on base class',  () => expect('1\r\n').to.equals(new Run().test([
        'class Base {                                                       \
            private _last: number;                                          \
                                                                            \
            public get Last(): number {                                     \
                return this._last;                                          \
            }                                                               \
                                                                            \
            public set Last(v: number) {                                    \
                this._last = v;                                             \
            }                                                               \
        }                                                                   \
                                                                            \
        class Engine extends Base {                                         \
        }                                                                   \
                                                                            \
        let e = new Engine();                                               \
        e.Last = 1;                                                         \
        console.log(e.Last);                                                \
    '])));

    it('Class - Static Properties',  () => expect('200.0\r\n40.0\r\n').to.equals(new Run().test([
        'class Grid {                                                       \
            static origin = {x: 0, y: 0};                                   \
            calculateDistanceFromOrigin(point: {x: number; y: number;}) {   \
                let xDist = (point.x - Grid.origin.x);                      \
                let yDist = (point.y - Grid.origin.y);                      \
                return (xDist * xDist + yDist * yDist) / this.scale;\
            }                                                               \
            constructor (public scale: number) { }                          \
        }                                                                   \
                                                                            \
        let grid1 = new Grid(1.0);                                          \
        let grid2 = new Grid(5.0);                                          \
                                                                            \
        console.log(grid1.calculateDistanceFromOrigin({x: 10, y: 10}));     \
        console.log(grid2.calculateDistanceFromOrigin({x: 10, y: 10}));     \
    '])));

    it('Class - Properties - Arrow Function',  () => expect('test\r\n').to.equals(new Run().test([
        'class Event1 {                                                     \
            public message: string;                                         \
        }                                                                   \
                                                                            \
        class Handler {                                                     \
            info: string;                                                   \
            onClickGood = (e: Event1) => { this.info = e.message; };        \
        }                                                                   \
                                                                            \
        let h = new Handler();                                              \
        let m = new Event1();                                               \
        m.message = "test";                                                 \
        h.onClickGood(m);                                                   \
        console.log(h.info);                                                \
    '])));

    it('Class - static - method call',  () => expect('1\r\n').to.equals(new Run().test([
        'export class Matrix {                                          \
            public static _identityReadOnly = Matrix.Identity();        \
                                                                        \
            public static Identity(): number {                          \
                return 1.0;                                             \
            }                                                           \
        }                                                               \
                                                                        \
        console.log(Matrix._identityReadOnly);                          \
    '])));

    it('Class - initializing property without constructor',  () => expect('10\r\n').to.equals(new Run().test([
        'class Matrix {                                                 \
            public m = [];                                              \
        }                                                               \
                                                                        \
        var result = new Matrix();                                      \
        result.m[0] = 10;                                               \
        console.log(result.m[0]);                                       \
    '])));

    it('Class - this in property initialization',  () => expect('1\r\n').to.equals(new Run().test([
        'export class Matrix {                                          \
            public _identityReadOnly = this._value;                     \
                                                                        \
            public _value = 1;                                          \
        }                                                               \
                                                                        \
        console.log(new Matrix()._identityReadOnly);                    \
    '])));

    it('Class - constructor with Parameters',  () => expect('1\r\n2\r\n3\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1: number, t2: number, t3: number) {               \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        new Test(1, 2, 3);                                                  \
    '])));

    it('Class - constructor with Optional Parameters - 1',  () => expect('1\r\n2\r\n3\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1?: number, t2?: number, t3?: number) {            \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        new Test(1, 2, 3);                                                  \
    '])));

    it('Class - constructor with Optional Parameters - 2',  () => expect('1\r\nnil\r\nnil\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1?: number, t2?: number, t3?: number) {            \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        new Test(1);                                                        \
    '])));

    it('Class - constructor with Optional Parameters - 2(2)',  () => expect('1\r\nnil\r\nnil\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1: number, t2?: number, t3?: number) {             \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        new Test(1);                                                        \
    '])));

    it('Class - constructor with Optional Parameters - 2(3)',  () => expect('11\r\nnil\r\nnil\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1: any, t2?: any, t3?: any) {                      \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        function getValue(val) {                                            \
            return val + 1;                                                 \
        }                                                                   \
        function run(val) {                                                 \
            new Test(getValue(val));                                        \
        }                                                                   \
        run(10);                                                            \
    '])));

    it('Class - constructor with Optional Parameters - 3',  () => expect('nil\r\nnil\r\nnil\r\n').to.equals(new Run().test([
        'export class Test {                                                \
            constructor(t1?: any, t2?: any, t3?: any) {                     \
                console.log(t1);                                            \
                console.log(t2);                                            \
                console.log(t3);                                            \
            }                                                               \
        }                                                                   \
        new Test();                                                         \
    '])));

    it('Class - constructor with Optional Parameters - 4',  () => expect('Run\r\n').to.equals(new Run().test([
        'export class Observable<T> {                                       \
            constructor(onObserverAdded?: (observer: any) => void) {        \
                console.log("Run");                                         \
                if (onObserverAdded) {                                      \
                    console.log("Error");                                   \
                }                                                           \
            }                                                               \
        }                                                                   \
        new Observable();                                                   \
    '])));

    it('Class - constructor with Default Parameter', () => expect('Hello\r\n10\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
            private val2: number;                       \
                                                        \
            constructor(s: string, def: number = 10) {  \
                this.val = s;                           \
                this.val2 = def;                        \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
                console.log(this.val2);                 \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1("Hello");                    \
        c.show();                                       \
    '])));

    it('Class - constructor with Default Parameter - 2', () => expect('Hello\r\n11\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            private val: string;                        \
            private val2: number;                       \
                                                        \
            constructor(s: string, def: number = 10) {  \
                this.val = s;                           \
                this.val2 = def;                        \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
                console.log(this.val2);                 \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1("Hello", 11);                \
        c.show();                                       \
    '])));

    it('Class - constructor with Default Parameter - 3', () => expect('Hello\r\n11\r\n').to.equals(new Run().test([
        'class Matrix {                                 \
        }                                               \
                                                        \
        class Class1 {                                  \
            public _matrix1 = new Matrix();             \
            private _name: string;                      \
            constructor(name: string, scene: any, setActiveOnSceneIfNoneActive = true) { \
                this._name = name;                      \
            }                                           \
        }                                               \
                                                        \
        class Class2 extends Class1 {                   \
            public _matrix2 = new Matrix();             \
            private val: string;                        \
            private val2: number;                       \
                                                        \
            constructor(name: string, alpha: number, beta: number, radius: number, setActiveOnSceneIfNoneActive = true) { \
                super(name, scene);                     \
                this.val = name;                        \
                this.val2 = alpha;                      \
            }                                           \
                                                        \
            public show() {                             \
                console.log(this.val);                  \
                console.log(this.val2);                 \
            }                                           \
        }                                               \
                                                        \
        var c = new Class2("Hello", 11, 12, 13);        \
        c.show();                                       \
    '])));

    it('Class - constructor with Default Parameter - 5', () => expect('1\r\nclass1\r\n3\r\n10\r\n').to.equals(new Run().test([
        'class Class1 {                                 \
            constructor(v1: number, v2:string, v3: number, d: number = 10) {  \
                console.log(v1);                        \
                console.log(v2);                        \
                console.log(v3);                        \
                console.log(d);                         \
            }                                           \
                                                        \
            public static Identity(): number {          \
                return "class1";                        \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1(1, Class1.Identity(), 3);    \
        c.show();                                       \
    '])));

    it('Class - constructor with Default Parameter - 6', () => expect('1\r\nclass0\r\n3\r\n10\r\n').to.equals(new Run().test([
        'class Class0 {                                 \
            public Identity(): number {                 \
                return "class0";                        \
            }                                           \
        }                                               \
        class Class1 {                                 \
            constructor(v1: number, v2:string, v3: number, d: number = 10) {  \
                console.log(v1);                        \
                console.log(v2);                        \
                console.log(v3);                        \
                console.log(d);                         \
            }                                           \
        }                                               \
                                                        \
        var c = new Class1(1, new Class0().Identity(), 3);    \
        c.show();                                       \
    '])));

    it('Class - base fields are isolated',  () => expect('1\r\n2\r\n').to.equals(new Run().test([
        'export class Base {                                                \
            constructor(public number: number) {                            \
            }                                                               \
        }                                                                   \
                                                                            \
        export class Derived extends Base {                                 \
            constructor(number: number) {                                   \
                super(number);                                              \
            }                                                               \
        }                                                                   \
                                                                            \
        const d1 = new Derived(1);                                          \
        const d2 = new Derived(2);                                          \
                                                                            \
        console.log(d1.number);                                             \
        console.log(d2.number);                                             \
    '])));

    it('Class - deep inheritance',  () => expect(new Run().test([
        'export interface IBehaviorAware<T> {                   \
            init(): void;                                       \
        }                                                       \
                                                                \
        class Node implements IBehaviorAware<Node> {            \
        public metadata: any = null;                            \
                                                                \
        public animations = [];                                 \
                                                                \
        constructor(scene: any = null) {                        \
            this.init();                                        \
        }                                                       \
                                                                \
        public init() {                                         \
        }                                                       \
                                                                \
        public set x(v) {                                       \
        }                                                       \
                                                                \
        public get x() {                                        \
            return 0;                                           \
        }                                                       \
    }                                                           \
                                                                \
    class TargetCamera extends Node {                           \
        constructor() {                                         \
            super();                                            \
        }                                                       \
                                                                \
        public set x1(v) {                                      \
        }                                                       \
                                                                \
        public get x1() {                                       \
            return 1;                                           \
        }                                                       \
    }                                                           \
                                                                \
    class ArcCamera extends TargetCamera {                      \
        constructor() {                                         \
            super();                                            \
        }                                                       \
                                                                \
        public set x2(v) {                                      \
        }                                                       \
                                                                \
        public get x2() {                                       \
            return 2;                                           \
        }                                                       \
    }                                                           \
                                                                \
    new ArcCamera();                                            \
    console.log("Run");                                         \
    '])).to.equals('Run\r\n'));

    it('Class - deep inheritance 2',  () => expect(new Run().test([
        'export interface IBehaviorAware {                      \
            init2(): void;                                      \
        }                                                       \
        export interface IBehaviorAware2 {                      \
            init2(): void;                                      \
        }                                                       \
        export interface IBehaviorAware3 {                      \
            init2(): void;                                      \
        }                                                       \
                                                                \
        class Node {                                            \
        public metadata: any = null;                            \
                                                                \
        public animations = [];                                 \
                                                                \
        constructor(scene: any = null) {                        \
            this.init();                                        \
        }                                                       \
                                                                \
        public init() {                                         \
            console.log("Run1");                                \
        }                                                       \
                                                                \
        public set x(v) {                                       \
        }                                                       \
                                                                \
        public get x() {                                        \
            return 0;                                           \
        }                                                       \
    }                                                           \
                                                                \
    class TargetCamera extends Node implements IBehaviorAware, IBehaviorAware2, IBehaviorAware3 { \
        constructor() {                                         \
            super();                                            \
        }                                                       \
                                                                \
        public init2() {                                        \
        }                                                       \
                                                                \
        public set x1(v) {                                      \
        }                                                       \
                                                                \
        public get x1() {                                       \
            return 1;                                           \
        }                                                       \
    }                                                           \
                                                                \
    class ArcCamera extends TargetCamera {                      \
        constructor() {                                         \
            super();                                            \
        }                                                       \
                                                                \
        public set x2(v) {                                      \
        }                                                       \
                                                                \
        public get x2() {                                       \
            return 2;                                           \
        }                                                       \
    }                                                           \
                                                                \
    new ArcCamera();                                            \
    console.log("Run");                                         \
    '])).to.equals('Run1\r\nRun\r\n'));

    it('Class - this in static',  () => expect('Run\r\n').to.equals(new Run().test([
        'export class Node1 {                                                           \
            private static _NodeConstructors: {[key: string]: any} = {};                \
                                                                                        \
            public static AddNodeConstructor(type: string, constructorFunc: any) {      \
                this._NodeConstructors[type] = constructorFunc;                         \
            }                                                                           \
        }                                                                               \
                                                                                        \
        Node1.AddNodeConstructor("asd", () => {});                                      \
                                                                                        \
        console.log("Run");                                                             \
    '])));

    it('Class - BUG (count of method return vars)',  () => expect('Run\r\n').to.equals(new Run().test([
        'class Node1 {                                      \
        public _scene: Scene;                               \
                                                            \
        constructor(scene: Scene) {                         \
            this._scene = scene;                            \
        }                                                   \
                                                            \
        public getScene(): Scene {                          \
            return this._scene;                             \
        }                                                   \
                                                            \
        public get parent(): any {                          \
            return 1;                                       \
        }                                                   \
                                                            \
        public set parent(v) {                              \
        }                                                   \
    }                                                       \
                                                            \
    abstract class AbstractScene {                          \
    }                                                       \
                                                            \
    class Scene extends AbstractScene {                     \
        private cameras =[];                                \
                                                            \
        public addCamera(newCamera: Camera): void {         \
            this.cameras[1] = newCamera;                    \
        }                                                   \
                                                            \
        public get parent(): any {                          \
            return 1;                                       \
        }                                                   \
                                                            \
        public set parent(v) {                              \
        }                                                   \
    }                                                       \
                                                            \
    class Camera extends Node1 {                            \
        constructor(scene: Scene) {                         \
            super(scene);                                   \
            this.getScene().addCamera(this);                \
        }                                                   \
                                                            \
        public get parent(): any {                          \
            return 1;                                       \
        }                                                   \
    }                                                       \
                                                            \
    let s = new Scene();                                    \
    let c = new Camera(s);                                  \
    console.log("Run");                                     \
    '])));

    it('Class - BUG (class static method should not have "this" as in param)',  () => expect('0\r\n0\r\n0\r\n').to.equals(new Run().test([
        'class Vector3 {                                    \
            constructor(                                    \
                public x: number = 0,                       \
                public y: number = 0,                       \
                public z: number = 0                        \
            ) {                                             \
            }                                               \
                                                            \
            public static Zero(): Vector3 {                 \
                return new Vector3(0.0, 0.0, 0.0);          \
            }                                               \
        }                                                   \
                                                            \
        class Matrix {                                      \
            public static LookAtLHToRef(eye: Vector3, target: Vector3, up: Vector3, view: Matrix): void {\
                console.log(up.x);                          \
                console.log(up.y);                          \
                console.log(up.z);                          \
                                                            \
                const t = this;                             \
            }                                               \
        }                                                   \
                                                            \
        class Camera {                                      \
            protected _globalPosition = Vector3.Zero();     \
            protected _globalCurrentTarget = Vector3.Zero();\
            protected _globalCurrentUpVector = Vector3.Zero();\
            protected _view = new Matrix();                 \
                                                            \
            public _computeViewMatrix(): void {             \
                Matrix.LookAtLHToRef(this._globalPosition, this._globalCurrentTarget, this._globalCurrentUpVector, this._view);\
            }                                               \
        }                                                   \
                                                            \
        let c = new Camera();                               \
        c._computeViewMatrix();                             \
    '])));

    it('Class - BUG (base class has setter and derived not)',  () => expect('Run\r\n').to.equals(new Run().test([
        'class Node1 {                                          \
            public _scene: Scene;                               \
                                                                \
            constructor(scene: Scene) {                         \
                this._scene = scene;                            \
            }                                                   \
                                                                \
            public set parent(v) {                              \
            }                                                   \
        }                                                       \
                                                                \
        class Camera extends Node1 {                            \
            constructor(scene: Scene) {                         \
                super(null);                                    \
            }                                                   \
        }                                                       \
                                                                \
        let c = new Camera(s);                                  \
        console.log("Run");                                     \
    '])));

    it('Class - BUG (chain call)',  () => expect(new Run().test([
        'class Vector3 {                                        \
            constructor(                                        \
                public x: number = 0,                           \
                public y: number = 0,                           \
                public z: number = 0                            \
            ) {                                                 \
            }                                                   \
                                                                \
            public addInPlace(otherVector: Vector3): Vector3 {  \
                this.x += otherVector.x;                        \
                this.y += otherVector.y;                        \
                this.z += otherVector.z;                        \
                return this;                                    \
            }                                                   \
                                                                \
            public scaleInPlace(scale: number): Vector3 {       \
                this.x *= scale;                                \
                this.y *= scale;                                \
                this.z *= scale;                                \
                return this;                                    \
            }                                                   \
                                                                \
            public copyFrom(source: Vector3): Vector3 {         \
                this.x = source.x;                              \
                this.y = source.y;                              \
                this.z = source.z;                              \
                return this;                                    \
            }                                                   \
                                                                \
            public get isNonUniform(): boolean {                \
                let absX = Math.abs(this.x);                    \
                let absY = Math.abs(this.y);                    \
                if (absX !== absY) {                            \
                    return true;                                \
                }                                               \
                                                                \
                return false;                                   \
            }                                                   \
        }                                                       \
                                                                \
        const center: Vector3 = new Vector3();                  \
        const maximum: Vector3 = new Vector3();                 \
        const minimum: Vector3 = new Vector3();                 \
        center.copyFrom(maximum).addInPlace(minimum).scaleInPlace(0.5);  \
                                                                \
        console.log("Run1");                                    \
    '])).to.equals('Run1\r\n'));

    it('Class - BUG (chain call) 2',  () => expect(new Run().test([
        'class Vector3 {                                        \
            constructor(                                        \
                public x: number = 0,                           \
                public y: number = 0,                           \
                public z: number = 0                            \
            ) {                                                 \
            }                                                   \
                                                                \
            public addInPlace(otherVector: Vector3): Vector3 {  \
                this.x += otherVector.x;                        \
                this.y += otherVector.y;                        \
                this.z += otherVector.z;                        \
                return this;                                    \
            }                                                   \
                                                                \
            public scaleInPlace(scale: number): Vector3 {       \
                this.x *= scale;                                \
                this.y *= scale;                                \
                this.z *= scale;                                \
                return this;                                    \
            }                                                   \
                                                                \
            public copyFrom(source: Vector3): Vector3 {         \
                this.x = source.x;                              \
                this.y = source.y;                              \
                this.z = source.z;                              \
                return this;                                    \
            }                                                   \
                                                                \
            public get isNonUniform(): boolean {                \
                let absX = Math.abs(this.x);                    \
                let absY = Math.abs(this.y);                    \
                if (absX !== absY) {                            \
                    return true;                                \
                }                                               \
                                                                \
                return false;                                   \
            }                                                   \
        }                                                       \
                                                                \
        class Run1 {                                            \
            private maximum: Vector3 = new Vector3();           \
            private minimum: Vector3 = new Vector3();           \
            public exec() {                                     \
                const center: Vector3 = new Vector3();          \
                center.copyFrom(this.maximum).addInPlace(this.minimum).scaleInPlace(0.5); \
            }                                                   \
        }                                                       \
                                                                \
        const r = new Run1();                                   \
        r.exec();                                               \
        console.log("Run1");                                    \
    '])).to.equals('Run1\r\n'));

    it('Class - class method call by reference',  () => expect(new Run().test([
        'class Test {                           \
            val = 10;                           \
                                                \
            public testMethod() {               \
                console.log(this.val);          \
            }                                   \
        }                                       \
                                                \
        const t = new Test();                   \
        const m2 = t.testMethod;                \
        m2();                                   \
    '])).to.equals('10\r\n'));

    it('Class - class bind method call by reference',  () => expect(new Run().test([
        'class Test {                           \
            val = 10;                           \
                                                \
            public testMethod() {               \
                console.log(this.val);          \
            }                                   \
        }                                       \
                                                \
        class Test2 {                           \
            val = 20;                           \
        }                                       \
                                                \
        const t = new Test();                   \
                                                \
        const m1 = t.testMethod;                \
        m1();                                   \
                                                \
        const t2 = new Test2();                 \
                                                \
        const m2 = t.testMethod.bind(t2);       \
        m2();                                   \
        function fff(m3) {                      \
            m3();                               \
        }                                       \
                                                \
        fff(t.testMethod.bind(t2));             \
    '])).to.equals('10\r\n20\r\n20\r\n'));

    it('Class - class static method reference by this reference',  () => expect(new Run().test([
        'class Test {                           \
            public m: (val: number) => void;    \
                                                \
            public constructor() {              \
                this.m = Test.staticMethodTest; \
            }                                   \
                                                \
            public static staticMethodTest(val2: number) {  \
                console.log(val2);              \
            }                                   \
                                                \
            public run() {                      \
                this.m(10);                     \
            }                                   \
        }                                       \
                                                \
        const t = new Test();                   \
        t.run();                                \
    '])).to.equals('10\r\n'));


    it('Class - calling chain of lamdas with this', () => expect(new Run().test([
        'class Test {                           \
        public run() {                          \
            const s = "20";                     \
            this.run2(10, (x) => {              \
                this.run3(x, (y) => {           \
                    this.run4(y);               \
                    console.log(s);             \
                });                             \
            });                                 \
        }                                       \
                                                \
        public run2(x, callback: (data: any) => void) { \
            callback(x);                        \
        }                                       \
                                                \
        public run3(x, callback: (data: any) => void) { \
            callback(x);                        \
        }                                       \
                                                \
        public run4(x) {                        \
            console.log(x);                     \
        }                                       \
    }                                           \
                                                \
    const t = new Test();                       \
    t.run();                                    \
    '])).to.equals('10\r\n20\r\n'));

    // TODO: you can cast Camera => ICamera and convert method to function pointer
    it.skip('Class - calling method via interface function', () => expect(new Run().test([
        'interface ICamera {                    \
            attachControl: (element: HTMLElement, noPreventDefault?: boolean) => void;  \
            checkInputs?: () => void;           \
        }                                       \
                                                \
        class Camera implements ICamera {       \
            public checkInputs: () => void;     \
                                                \
            public attachControl(element: HTMLElement, noPreventDefault?: boolean) {    \
                console.log(noPreventDefault);  \
            }                                   \
        }                                       \
                                                \
        const c = new Camera();                 \
                                                \
        const ci = <ICamera>c;                  \
                                                \
        c.attachControl(null, 10);              \
        ci.attachControl(null, 20);             \
    '])).to.equals('10\r\n20\r\n'));

    it('Class - calling method reference via method reference', () => expect(new Run().test([
        'class Test {                                           \
        private _pointerInput: (p: any, s: any) => void;        \
                                                                \
        public runTest() {                                      \
            this._pointerInput = (p, s) => {                    \
                console.log(p.obj);                             \
                console.log(s.obj);                             \
            };                                                  \
                                                                \
            this.add(this._pointerInput);                       \
        }                                                       \
                                                                \
        public add(callback: (eventData: any, eventState: any) => void) {   \
            callback({ obj: 1 }, { obj: 2});                    \
        }                                                       \
    }                                                           \
                                                                \
    const t = new Test();                                       \
    t.runTest();                                                \
    '])).to.equals('1\r\n2\r\n'));
});

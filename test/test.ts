function Class1() {
    console.log("const");
}

Class1.prototype.sayHi = function () {
    console.log("Hi");
};

let c = new Class1();
c.sayHi();

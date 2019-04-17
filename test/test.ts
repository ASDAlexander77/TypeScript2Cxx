class Class1 {
}

class Class2 extends Class1 {
}

class Class3 {
}

let c2 = new Class2();
console.log(c2 instanceof Class2);
console.log(c2 instanceof Class1);
console.log(c2 instanceof Class3);

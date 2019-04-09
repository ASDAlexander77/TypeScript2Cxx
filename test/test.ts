function buildName(firstName: string, lastName: string = "Smith") {
    return firstName + " " + lastName;
}

let result1 = buildName("Bob", "Adams");
let result2 = buildName("Bob");
console.log(result1);
console.log(result2);

function buildName(firstName: string, lastName?: string) {
    if (lastName)
        return firstName + " " + lastName;
    else
        return firstName;
}

let result1 = buildName("Bob", "Adams");
let result2 = buildName("Bob");
console.log(result1);
console.log(result2);

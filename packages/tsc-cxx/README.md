TypeScript to C++
===========================

License
-------

TypeScript2Cxx is licensed under the MIT license.

Quick Start
-----------

0) install

```
node -i typescript-cxx
```


1) Compile test.ts

create file test.ts

```TypeScript
class Person {
    protected name: string;
    constructor(name: string) { this.name = name; }
}

class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        this.department = department;
    }

    public get ElevatorPitch() {
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee("Howard", "Sales");
console.log(howard.ElevatorPitch);
```

```
tsc-cxx test.ts
```

Now you have test.cpp and test.h

test.h:
```C++
#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Person;
class Employee;

class Person : public object, public std::enable_shared_from_this<Person> {
public:
    string name;

    Person(string name);
};

class Employee : public Person, public std::enable_shared_from_this<Employee> {
public:
    string department;

    Employee(string name, string department);
    virtual any get_ElevatorPitch();
    Employee(string name);
};

extern std::shared_ptr<Employee> howard;
#endif
```

test.cpp:
```C++
#include "test.h"

using namespace js;

Person::Person(string name) {
    this->name = name;
}

Employee::Employee(string name, string department) : Person(name) {
    this->department = department;
}

any Employee::get_ElevatorPitch()
{
    return "Hello, my name is "_S + this->name + " and I work in "_S + this->department + "."_S;
}

Employee::Employee(string name) : Person(name) {
}

std::shared_ptr<Employee> howard = std::make_shared<Employee>("Howard"_S, "Sales"_S);

void Main(void)
{
    console->log(howard->get_ElevatorPitch());
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
```

2) Compile it.

cl /W3 /GR /EHsc /std:c++latest /Fe:test.exe /I ../cpplib test.cpp

3) Run it.

```
test.exe
```

Result:
```
Hello, my name is Howard and I work in Sales.
```

Enjoy it. 

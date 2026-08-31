TypeScript to C++
===========================

TypeScript2Cxx (`tsc-cxx`) compiles TypeScript source into readable, dependency-light C++20 (a `.h`/`.cpp` pair per module). Generated code links against `cpplib`, a small header-only runtime that reproduces JavaScript semantics in C++ — `any`, `string`, `number`, `object`, `array`, closures, prototypal-style classes, and JS-flavored operators (`==`, `+`, truthiness, `undefined`/`null`) — so the output behaves like the original TypeScript, not like hand-ported C++.

License
-------

TypeScript2Cxx is licensed under the MIT license.

Chat Room
---------

Want to chat with other members of the TypeScript to C++ community?

[![Join the chat at https://gitter.im/ASDAlexander77/TypeScript2Cxx](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ASDAlexander77/TypeScript2Cxx?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Prerequisites
--------------

- [Node.js](https://nodejs.org/) to build and run the compiler itself.
- A C++20 compiler to build the generated output: Visual Studio 2022/2026 (MSVC) or Clang++ (verified with 21.x).

Quick Start
-----------

1) Build Project

```bash
npm install
npm run build
```

2) Compile test.ts

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

const howard = new Employee("Howard", "Sales");
console.log(howard.ElevatorPitch);
```

```bash
node __out\main.js test.ts
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

3) Compile it.

Visual Studio C++

```bash
cl /W3 /GR /EHsc /std:c++20 /Fe:test.exe /I ../cpplib test.cpp
```

or Clang++

```bash
clang++ -std=c++20 -Wno-switch -Wno-deprecated-declarations -I../cpplib test.cpp -o test.exe
```

4) Run it.

```bash
test.exe
```

Result:

```text
Hello, my name is Howard and I work in Sales.
```

Enjoy it.

CLI Options
-----------

`node __out\main.js [files...] [-options]`

With no input files, the compiler reads `tsconfig.json` from the current directory.

| Option | Description |
| --- | --- |
| `-watch` | Recompile on source changes (requires a `tsconfig.json` project). |
| `-suppressOutput` | Suppress compiler console output. |
| `-run_on_compile <command>` | Run `<command>` after a successful compile. |

Running Tests
-------------

1) TypeScript compiler unit tests (`spec/**/*.spec.ts`)

```bash
npm test
```

2) C++ runtime (cpplib) test suite

The `test/` folder contains a hand-maintained C++ test suite (`test.cpp`) that exercises `cpplib/core.h` directly, plus batch scripts to build and run it with either toolchain:

```bash
cd test
ms.bat          REM MSVC (Visual Studio), release
ms_d.bat        REM MSVC, debug
clang_build.bat REM Clang++, release
```

A successful run prints `test OK!` and exits with code 0.

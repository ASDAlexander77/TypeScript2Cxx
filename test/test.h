#include "core.h"

using namespace js;

class Person {
public:
    virtual void dummy() {};
    string name;
    Person(string name) {
        this->name = name;
    }
};
class Employee : public Person {
public:
    string department;
    Employee(string name, string department) : Person(name) {
        this->department = department;
    }

    auto getElevatorPitch() -> auto
    {
        return "Hello, my name is "_S + this->name + " and I work in "_S + this->department + "."_S;
    }
};

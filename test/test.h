#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Person;
class Employee;
extern Employee* howard;

class Person {
public:
    virtual void dummy() {};
    string name;

    Person(string name);
};

class Employee : public Person {
public:
    string department;

    Employee(string name, string department);
    any get_ElevatorPitch();
};

Person::Person(string name) {
    this->name = name;
}

Employee::Employee(string name, string department) : Person(name) {
    this->department = department;
}

any Employee::get_ElevatorPitch()
{
    return cast<any>("Hello, my name is "_S + this->name + " and I work in "_S + this->department + "."_S);
}

#endif

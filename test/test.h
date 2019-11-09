#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Person;
class Employee;
extern Employee* howard;

class Person : public object {
public:
    string name;

    Person(string name);
};

class Employee : public Person {
public:
    string department;

    Employee(string name, string department);
    virtual any getElevatorPitch();
    Employee(string name);
};

#endif

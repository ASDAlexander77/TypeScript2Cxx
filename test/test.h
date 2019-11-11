#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Employee;
extern Employee* employee;

class Employee : public object {
public:
    string _fullName;

    virtual string get_fullName();
    virtual void set_fullName(string newName);
};

#endif

#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Base;
class Derived;
extern Derived* d1;
extern Derived* d2;

class Base : public object {
public:
    js::number number;

    Base(js::number number_);
};

class Derived : public Base {
public:
    Derived(js::number number);
};

#endif

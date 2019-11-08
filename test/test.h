#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;
class Test2;
extern Test2* c;

class Test : public object {
public:
    string name;

    Test(string name_);
};

class Test2 : public Test {
public:
    string name;

    Test2(string name_);
};

#endif

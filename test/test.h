#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Class0;
class Class1;
extern Class1* c;

class Class0 : public object {
public:
    virtual string Identity();
};

class Class1 : public object {
public:
    Class1(js::number v1, string v2, js::number v3, js::number d = 10);
};

#endif

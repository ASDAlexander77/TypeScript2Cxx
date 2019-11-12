#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Class1;
extern Class1* c;

class Class1 : public object {
public:
    Class1(js::number v1, string v2, js::number v3, js::number d = 10);
    static js::number Identity();
};

#endif

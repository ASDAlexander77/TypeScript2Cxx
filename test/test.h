#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test : public object {
public:
    Test(js::number t1 = undefined, js::number t2 = undefined, js::number t3 = undefined);
};

#endif

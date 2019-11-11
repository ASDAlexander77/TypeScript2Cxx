#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test : public object {
public:
    Test(any t1, any t2 = undefined, any t3 = undefined);
};

any getValue(any val);

void run(any val);

#endif

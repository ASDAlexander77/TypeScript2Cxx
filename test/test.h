#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Test;

class Test : public object {
public:
    virtual string get_Name();
    virtual void set_Name(string value);
};

#endif

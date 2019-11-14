#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

template <typename ...Args>
void buildName(string firstName, Args... restOfName_);

template <typename ...Args>
void buildName(string firstName, Args... restOfName_)
{
    array restOfName = {restOfName_...};
    console->log(firstName);
    console->log(const_(restOfName)[0]);
    console->log(const_(restOfName)[1]);
    console->log(const_(restOfName)[2]);
};


#endif

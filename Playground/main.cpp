#define EXTRA_DEBUG
#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

any buildName = (functionPtrType) [] (any *_this, const paramsType &params) -> any
{
    PARAMS
    PARAM(firstName);
    PARAM_DEFAULT(lastName, any("Smith"));
    // body
    return firstName + any(" ") + lastName;
};

constexpr struct ParamsStream {
    paramsType::iterator it;
    paramsType::iterator end;
    
    constexpr ParamsStream(const paramsType &param) : it(param.begin()), end(param.end())  {
    }

    constexpr ParamsStream& operator>> (any& value)
    {
        if (end != it) 
        {
            value = *it++;
        }

        return *this;
    }    
};

any buildName2 = (functionPtrType) [] (any *_this, const paramsType &params) -> any
{
    ParamsStream strm(params);
    any firstName;
    any lastName;
    strm >> firstName >> lastName;

    return firstName + any(" ") + lastName;
};

int main(int argc, char** argv)
{
    

    return 0;
}

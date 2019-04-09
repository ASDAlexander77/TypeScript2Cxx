//#define EXTRA_DEBUG
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
    const clock_t begin_time0 = clock();

    for (int i = 0; i < 100000; i++) {
        buildName(any("First"), any("Second"));
    }

    std::cout << "First run (direct): " << double( clock () - begin_time0 ) /  CLOCKS_PER_SEC << std::endl;

    const clock_t begin_time1 = clock();

    for (int i = 0; i < 100000; i++) {
        buildName2(any("First"), any("Second"));
    }

    std::cout << "Second run: " << double( clock () - begin_time1 ) /  CLOCKS_PER_SEC << std::endl;

    return 0;
}

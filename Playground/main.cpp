#include "core.h"
#include <iostream>
#include <ctime>

using namespace js;

any buildName(any firstName, any secondName = any()) {
    return firstName + secondName;
}

int testCall0(int p0, int p1, int p2, int p3, int p4, int p5, int p6, int p7, int p8, int p9) {
    return p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
}

any testCall1(any p0, any p1, any p2, any p3, any p4, any p5, any p6, any p7, any p8, any p9) {
    return p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
}

any testCall2(const paramsType &params) {
    auto iter = params.begin();
    auto end = params.end();
    any p0 = end != iter ? *iter++ : any();
    any p1 = end != iter ? *iter++ : any();
    any p2 = end != iter ? *iter++ : any();
    any p3 = end != iter ? *iter++ : any();
    any p4 = end != iter ? *iter++ : any();
    any p5 = end != iter ? *iter++ : any();
    any p6 = end != iter ? *iter++ : any();
    any p7 = end != iter ? *iter++ : any();
    any p8 = end != iter ? *iter++ : any();
    any p9 = end != iter ? *iter++ : any();

    return p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
}

int main(int argc, char **argv)
{
    any val1 = 1;

    const clock_t begin_time0 = clock();

    int t0 = 0;
    for (int i = 0; i < 1000000; i++) {
        t0 += testCall0(i, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    }

    std::cout << t0 << std::endl;
    std::cout << "First run (direct): " << double( clock () - begin_time0 ) /  CLOCKS_PER_SEC << std::endl;

    const clock_t begin_time1 = clock();

    any t2 = 0;
    for (int i = 0; i < 1000000; i++) {
        t2 += testCall1(i, val1, val1, val1, val1, val1, val1, val1, val1, val1);
    }

    std::cout << t2 << std::endl;
    std::cout << "First run (direct): " << double( clock () - begin_time1 ) /  CLOCKS_PER_SEC << std::endl;

    const clock_t begin_time2 = clock();

    any t3 = 0;
    for (int i = 0; i < 1000000; i++) {
        t3 += testCall2( { i, val1, val1, val1, val1, val1, val1, val1, val1, val1 } );
    }

    std::cout << t3 << std::endl;
    std::cout << "Second run (via initializer_list): " << double( clock () - begin_time2 ) /  CLOCKS_PER_SEC << std::endl;

    any outer = 12;
    std::function<any(const paramsType &)> main1 = [&] (const paramsType &params) -> any {
        auto iter = params.begin();
        auto end = params.end();
        any p0 = end != iter ? *iter++ : any();
        any p1 = end != iter ? *iter++ : any();

        std::cout << outer << std::endl;
        return p0 + p1;
    };

    any o1 = any(anyTypeId::object);
    o1["method"] = buildName;
    o1["method2"] = main1;

    any r = o1["method"](any("First"), any("Second"));

    std::cout << r << std::endl;

    any r2 = o1["method"](any("First"));

    std::cout << r2 << std::endl;    

    any r3 = o1["method2"](any("p1"), any("p2"));

    std::cout << r3 << std::endl;    

    return 0;
}
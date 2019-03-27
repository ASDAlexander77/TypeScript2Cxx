#include <iostream>
#include "core.h"

using namespace js;

void functionTest() {
    std::cout << "Hello - functionTest" << std::endl;
} 


auto functionTest2() -> std::function<void(void)> {
    std::cout << "Hello - functionTest2" << std::endl;

    std::shared_ptr<any> bptr = std::make_shared<any>(12);
    any& b = *bptr;

    auto r = [=] () {
        any& b = *bptr;

        std::cout << "Hello - functionTest2 - lambda" << std::endl;
        std::cout << b << std::endl;
    };
    return r;
} 

int main(int argc, char** argv)
{
    std::cout << "'any' size = " << sizeof(any) << std::endl;

    // const
    any a;
    any b = nullptr;
    any c = true;
    any d = 1;
    any e = 2L;
    any f = 1123.12;
    any g = "string";
    any h = functionTest;

    // copy
    any i = b;

    std::cout << a << " " << b << " " << c << " " << d << " " << e << " " << f << " " << g << " " << h << " " << i << std::endl;

    // call function reference
    h();

    // lambdas
    any j = functionTest2();
    j();

    std::cout << j << std::endl;

    // operators
    any k = d + e;

    std::cout << "d + e = " << d << " + " << e << " = " << k << std::endl;

    // array
    any l = { 1, 2, 3 };

    std::cout << " l[0] = " << l[0] << " l[1] = " << l[1] << " l[2] = " << l[2] << std::endl;

    any index = 0;
    for (auto& item : l) 
    {
        std::cout << "for l[" << index << "] = " << item << std::endl;
        index = index + 1;
    }

    any m = 
    {
        std::make_tuple("field 1", 1), 
        std::make_tuple("field 2", 2), 
        std::make_tuple("field 3", 3) 
    };

    std::cout << "m['field 1'] = " << m["field 1"] << std::endl;
    std::cout << "m['field 2'] = " << m["field 2"] << std::endl;
    std::cout << "m['field 3'] = " << m["field 3"] << std::endl;

    return 0;
}
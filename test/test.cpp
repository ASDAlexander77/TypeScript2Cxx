#include "core.h"

using namespace js;

any x;
any x2;

int main(int argc, char** argv)
{
    x = { "hello", 10 };
    console.log(x[0]);
    console.log(x[1]);
    x2 = { "hello", 10 };
    console.log(x2[0]);
    console.log(x2[1]);
}

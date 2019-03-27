#include "core.h"

using namespace js;

any list({ 1, 2, 3 });
any list2({ 1, 2, 3 });

int main(int argc, char** argv)
{
    console.log(list[0]);
    console.log(list[1]);
    console.log(list[2]);
    list[2] = 10;
    console.log(list[2]);
    console.log(list2[0]);
    console.log(list2[1]);
    console.log(list2[2]);
    list2[2] = 10;
    console.log(list2[2]);
}

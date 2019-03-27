#include "core.h"

using namespace js;

any fullName("Bob Bobbington");
any age(37);
any sentence("Hello, my name is " + fullName + ". I'll be " + (age + 1) + " years old next month.");

int main(int argc, char** argv)
{
    console.log(sentence);
    console["log"]();
}

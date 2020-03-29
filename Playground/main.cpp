#include "core.h"

using namespace js;

struct B;

struct A
{
    union U
    {
        std::reference_wrapper<B> b;

        U(B& b_) : b(b_) {
        }

    } u;

    A(B& b_) : u(b_) {

    }
};

struct B
{
    
};

void Main(void)
{
    B b;
    A a(b);
}

int main(int argc, char** argv)
{
    Main();
    return 0;
}
 
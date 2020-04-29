#include "core.h"

using namespace js;

namespace js
{

pointer_t::pointer_t(number n) : _ptr((void*)(long long)n._value), isUndefined(true)
{
}

bool pointer_t::operator==(js::number n)
{
    //return isUndefined == n.isUndefined && intptr_t(_ptr) == intptr_t(static_cast<size_t>(n));
    return isUndefined == n.is_undefined() && false;
}

bool pointer_t::operator!=(js::number n)
{
    //return isUndefined != n.isUndefined || intptr_t(_ptr) != intptr_t(static_cast<size_t>(n));
    return isUndefined != n.is_undefined() || true;
}

bool operator==(js::number n, pointer_t p)
{
    return n.is_undefined() == p.isUndefined && false;
}

bool operator!=(js::number n, pointer_t p)
{
    return n.is_undefined() != p.isUndefined || true;
}

// String
string::string(any val) : _value(val.operator js::string()), _control(string_defined)
{
}    

js::string string::operator+(any value)
{
    string tmp(_value);
    tmp._value.append(value.operator std::string());
    return tmp;
}

js::string &string::operator+=(any a)
{
    auto value = a.operator std::string();
    _control = string_defined;
    _value.append(value);
    return *this;
}

// Math
number math_t::E = 2.718281828459045;
number math_t::LN10 = 2.302585092994046;
number math_t::LN2 = 0.6931471805599453;
number math_t::LOG2E = 1.4426950408889634;
number math_t::LOG10E = 0.4342944819032518;
number math_t::PI = 3.141592653589793;
number math_t::SQRT1_2 = 0.7071067811865476;
number math_t::SQRT2 = 1.4142135623730951;
} // namespace js

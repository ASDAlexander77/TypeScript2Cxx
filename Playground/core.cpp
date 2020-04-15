#include "core.h"

using namespace js;

namespace js
{
// String
js::string string::operator+(any value)
{
    string tmp(_value);
    tmp._value.append(value.operator std::string().c_str());
    return tmp;
}

js::string &string::operator+=(any value)
{
    _value.append(value.operator std::string().c_str());
    length = (size_t)*this;
    return *this;
}

// Object
object::object() : _values(), undefined_t(false)
{
}

object::object(std::initializer_list<pair> values)
{
    for (auto &item : values)
    {
        _values[item.first] = item.second;
    }
}

ObjectKeys<decltype(object::_values)> object::keys()
{
    return ObjectKeys<decltype(object::_values)>(_values);
}

any &object::operator[](const char *s) const
{
    return mutable_(_values)[std::string(s)];
}

any &object::operator[](std::string s) const
{
    return mutable_(_values)[s];
}

any &object::operator[](string s) const
{
    return mutable_(_values)[(std::string)s];
}

any &object::operator[](const char *s)
{
    return _values[std::string(s)];
}

any &object::operator[](std::string s)
{
    return _values[s];
}

any &object::operator[](string s)
{
    return _values[(std::string)s];
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

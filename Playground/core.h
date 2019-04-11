#include <memory>
#include <string>
#include <functional>
#include <type_traits>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <sstream>
#include <ostream>
#include <iostream>
#include <cmath>

namespace js
{

#define OR(x, y) ((bool)(x) ? (x) : (y))
#define AND(x, y) ((bool)(x) ? (y) : (x))

struct number {

    double _value;

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    number (T initValue) {
        _value = (T)initValue;
    }

};

struct any {

    enum anyType {
        number,
        array,
        object
    };

    anyType _type;
    union u {
        js::number _number;
    };

    template<class T, class = std::enable_if<std::is_integral_v<T>>>
    any(T initValue) {
        _type = anyType::number;
        _value.u._number = (T)initValue;
    }

};

static struct Console
{
    template<class ... Args>
    void log(Args ... args) 
    {
        for (auto& arg : {args...}) 
        {
            std::cout << arg;
        }

        std::cout << std::endl;
    }

} console;

} // namespace js

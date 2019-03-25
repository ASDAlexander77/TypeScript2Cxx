#include <functional>
#include <memory>
#include <vector>
#include <ostream>

namespace js
{

typedef void (*functionPtr)(void);
typedef std::function<void(void)> func;

enum anyTypeId
{
    undefined,
    null,
    boolean,
    integer,
    integer64,
    real,
    string,
    function,
    closure
};

union anyType {
    bool boolean;
    int integer;
    long integer64;
    double real;
    char *string;
    functionPtr function;
    int closure;
};

struct any
{
    static std::vector<func> closures;

    anyTypeId _type;
    anyType _value;

    any()
    {
        _type = anyTypeId::undefined;
    }

    any(const any &other)
    {
        _type = other._type;
        _value = other._value;
    }

    any(any &&other)
    {
        _type = other._type;
        _value = other._value;
        other._type = undefined;
    }

    any(bool value)
    {
        _type = anyTypeId::boolean;
        _value.boolean = value;
    }

    any(int value)
    {
        _type = anyTypeId::integer;
        _value.integer = value;
    }

    any(long value)
    {
        _type = anyTypeId::integer64;
        _value.integer64 = value;
    }

    any(double value)
    {
        _type = anyTypeId::real;
        _value.real = value;
    }

    any(std::nullptr_t value)
    {
        _type = anyTypeId::null;
        _value.string = value;
    }    

    any(char* value)
    {
        _type = anyTypeId::string;
        _value.string = value;
    }

    template <class R, class... Args>
    any(R (*value)(Args &&...))
    {
        _type = anyTypeId::function;
        _value.function = (functionPtr)value;
    }

    template <class R, class... Args>
    any(std::function<R(Args &&...)> func)
    {
        _type = anyTypeId::closure;
        closures.push_back(func);
        _value.closure = closures.size() - 1;
    }

    operator int() const
    {
        if (_type == anyTypeId::integer)
        {
            return _value.integer;
        }

        throw "wrong cast";
    }

    void operator()()
    {
        if (_type == anyTypeId::function)
        {
            _value.function();
            return;
        }

        if (_type == anyTypeId::closure)
        {
            closures[_value.closure]();
            return;
        }

        throw "not function or closure";
    }

    friend std::ostream& operator<<(std::ostream& os, const any& other);
};

} // namespace js

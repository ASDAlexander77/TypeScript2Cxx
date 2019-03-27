#include <memory>
#include <string>
#include <functional>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <sstream>
#include <ostream>
#include <iostream>

namespace js
{

struct any;

typedef void (*functionPtr)(void);
typedef std::function<void(void)> functionType;
typedef std::unordered_map<std::string, any> objectType;
typedef std::vector<any> arrayType;

enum anyTypeId
{
    undefined,
    null,
    boolean,
    integer,
    integer64,
    real,
    const_string,
    function,
    closure,
    array,
    object,
    string,
};

union anyType {
    bool boolean;
    int integer;
    long integer64; // i think we can use pointer to data to reduce size of anyType
    double real;  // i think we can use pointer to data to reduce size of anyType
    const char *const_string;
    functionPtr function;

    functionType* closure;
    objectType* object;
    arrayType* array;
    std::string* string;
};

struct any
{
    anyTypeId _type;
    anyType _value;

    any()
    {
        _type = anyTypeId::undefined;
    }

    any(const any& other)
    {
        _type = other._type;
        _value = other._value;
    }

    any(any&& other)
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

    any(const char *value)
    {
        _type = anyTypeId::const_string;
        _value.const_string = value;
    }

    any(const std::string& value)
    {
        _type = anyTypeId::string;
        _value.string = new std::string(value);
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
        _value.closure = new functionType(func);
    }

    any(const std::initializer_list<any>& values)
    {
        _type = anyTypeId::array;

        std::vector<any> vals;
        vals.reserve(values.size());
        for (auto& item : values)
        {
            vals.push_back(item);
        }

        _value.array = new arrayType(vals);
    }

    any(const std::initializer_list<std::tuple<std::string, any>>& values)
    {
        _type = anyTypeId::object;

        objectType obj;
        for (auto& item : values)
        {
            obj[std::get<0>(item)] = std::get<1>(item);
        }

        _value.object = new objectType(obj);
    }    

    void operator()()
    {
        switch (_type)
        {
        case anyTypeId::function:
            _value.function();
            return;

        case anyTypeId::closure:
            (*(_value.closure))();
            return;

        default:
            break;
        }

        throw "not function or closure";
    }

    any operator[](any index)
    {
        switch (_type)
        {
        case anyTypeId::array:
            switch (index._type)
            {
            case anyTypeId::integer:
                return (*(_value.array))[index._value.integer];
            case anyTypeId::integer64:
                return (*(_value.array))[index._value.integer64];
            }

            throw "not allowed index type";
        case anyTypeId::object:
            switch (index._type)
            {
            case anyTypeId::const_string:
                return (*(_value.object))[index._value.const_string];
            case anyTypeId::string:
                return (*(_value.object))[(const char*) index._value.string];
            }

            throw "not allowed index type";
        }

        throw "not array";
    }

    std::vector<js::any>::iterator begin() 
    { 
        if (_type == anyTypeId::array) 
        {
            return _value.array->begin(); 
        }

        throw "not array";
    }
    
    std::vector<js::any>::const_iterator cbegin() const 
    { 
        if (_type == anyTypeId::array) 
        {
            return _value.array->cbegin(); 
        }

        throw "not array";
    }
    
    std::vector<js::any>::iterator end() 
    { 
        if (_type == anyTypeId::array) 
        {
            return _value.array->end(); 
        }

        throw "not array";
    }

    std::vector<js::any>::const_iterator cend() const 
    { 
        if (_type == anyTypeId::array) 
        {
            return _value.array->cend(); 
        }

        throw "not array";
    }    

    any& operator=(const any& other)
    {
        _type = other._type;
        _value = other._value;        
        return *this;
    }

    any operator+(const any& other)
    {
        switch (other._type)
        {
            case anyTypeId::const_string:
            case anyTypeId::string:
            {
                std::stringstream stream;
                stream << *this;
                stream << other;
                return any(stream.str());
            }            
        }

        switch (_type)
        {
        case anyTypeId::integer:
            return any(_value.integer + other._value.integer);

        case anyTypeId::integer64:
            break;

        case anyTypeId::real:
            break;

        case anyTypeId::const_string:
        case anyTypeId::string:
        {
            std::stringstream stream;
            stream << *this;
            stream << other;
            return any(stream.str());
        }

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    friend any operator+(int value, const any& rhs);    
    friend any operator+(const char* value, const any& rhs);    

    friend std::ostream& operator<<(std::ostream& os, const any& other);
};

    static struct Console {
        void log(any value) {
            std::cout << value;
            std::cout << std::endl;
        }
    } console;
    
} // namespace js

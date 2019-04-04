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

namespace js
{

#define __OR(x, y) ((bool)x ? x : y)
#define __AND(x, y) ((bool)x ? y : x)

struct any;

typedef any (*functionPtr)(...);
typedef std::function<any(const std::initializer_list<any> &)> functionType;
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
    double real;    // i think we can use pointer to data to reduce size of anyType
    const char *const_string;
    functionPtr function;

    functionType *closure;
    objectType *object;
    arrayType *array;
    std::string *string;
};

enum anyIteratorTypeId
{
    iterator_array_key,
    iterator_array,
    iterator_object_key,
    iterator_object,
    iterator_string,
};

template <class T>
class index_iterator
{
  public:
    using iterator_category = std::forward_iterator_tag;

    using self_type = index_iterator;
    using value_type = T;
    using pointer = value_type*;
    using reference = value_type&;

    using beginObjectIterType = decltype(((objectType*)nullptr)->begin());
    using endObjectIterType = decltype(((objectType*)nullptr)->end());

    using beginArrayIterType = decltype(((arrayType*)nullptr)->begin());
    using endArrayIterType = decltype(((arrayType*)nullptr)->end());

    using beginStringIterType = decltype(((std::string*)nullptr)->begin());
    using endStringIterType = decltype(((std::string*)nullptr)->end());

    index_iterator(T indx) : _index(indx), _iteratorType(anyIteratorTypeId::iterator_array_key)
    {
    }    

    index_iterator(beginObjectIterType objectIteratorBegin, endObjectIterType objectIteratorEnd) 
        : index_iterator(anyIteratorTypeId::iterator_object_key, objectIteratorBegin, objectIteratorEnd)
    {
    }    

    index_iterator(anyIteratorTypeId anyIteratorType, beginObjectIterType objectIteratorBegin, endObjectIterType objectIteratorEnd) 
        : _index(),  _iteratorType(anyIteratorType), _objectIteratorBegin(objectIteratorBegin), _objectIteratorEnd(objectIteratorEnd)
    {
        if (_objectIteratorBegin != _objectIteratorEnd) 
        {
            switch (_iteratorType)
            {
                case anyIteratorTypeId::iterator_object_key:
                    _index = _objectIteratorBegin->first;
                    break;
                case anyIteratorTypeId::iterator_object:
                    _index = _objectIteratorBegin->second;
                    break;
            }            
        }
    }        

    index_iterator(beginArrayIterType arrayIteratorBegin, endArrayIterType arrayIteratorEnd) 
        : _index(),  _iteratorType(anyIteratorTypeId::iterator_array), _arrayIteratorBegin(arrayIteratorBegin), _arrayIteratorEnd(arrayIteratorEnd)
    {
        if (_arrayIteratorBegin != _arrayIteratorEnd) 
        {
            _index = *_arrayIteratorBegin;
        }
    }        

    index_iterator(beginStringIterType stringIteratorBegin, endStringIterType stringIteratorEnd) 
        : _index(),  _iteratorType(anyIteratorTypeId::iterator_string), _stringIteratorBegin(stringIteratorBegin), _stringIteratorEnd(stringIteratorEnd)
    {
        if (_stringIteratorBegin != _stringIteratorEnd) 
        {
            _index = *_stringIteratorBegin;
        }
    }     

    reference operator*() const
    {
        return (reference) _index;
    }

    self_type &operator++()
    {
        switch (_iteratorType)
        {
            case anyIteratorTypeId::iterator_string:
                ++_stringIteratorBegin;
                if (_stringIteratorBegin != _stringIteratorEnd) 
                {
                    _index = (char) *_stringIteratorBegin;
                }                
                
                break;
            case anyIteratorTypeId::iterator_array:
                ++_arrayIteratorBegin;
                if (_arrayIteratorBegin != _arrayIteratorEnd) 
                {
                    _index = *_arrayIteratorBegin;
                }                
                
                break;
            case anyIteratorTypeId::iterator_object_key:
            case anyIteratorTypeId::iterator_object:
                ++_objectIteratorBegin;
                if (_objectIteratorBegin != _objectIteratorEnd) 
                {
                    switch (_iteratorType)
                    {
                        case anyIteratorTypeId::iterator_object_key:
                            _index = _objectIteratorBegin->first;
                            break;
                        case anyIteratorTypeId::iterator_object:
                            _index = _objectIteratorBegin->second;
                            break;
                    }            
                }   

                break;

            default:
                ++_index;
                break;
        }

        return (*this);
    }

    bool operator!=(const self_type &_right) const
    {
        switch (_iteratorType)
        {
            case anyIteratorTypeId::iterator_string:
                return _stringIteratorBegin != _right._stringIteratorEnd;

            case anyIteratorTypeId::iterator_array:
                return _arrayIteratorBegin != _right._arrayIteratorEnd;

            case anyIteratorTypeId::iterator_object_key:
            case anyIteratorTypeId::iterator_object:
                return _objectIteratorBegin != _right._objectIteratorEnd;

            default:
                return (!(_index == _right._index));
        }        
    }

    value_type _index;
    anyIteratorTypeId _iteratorType;
    beginObjectIterType _objectIteratorBegin;    
    endObjectIterType _objectIteratorEnd;    
    beginArrayIterType _arrayIteratorBegin;    
    endArrayIterType _arrayIteratorEnd;    
    beginStringIterType _stringIteratorBegin;    
    endStringIterType _stringIteratorEnd;    
};

template <class T>
struct keys_iterator
{
    keys_iterator(arrayType *arr) 
        : _arr(arr), _obj(nullptr)
    {            
    }

    keys_iterator(objectType *obj) 
        : _arr(nullptr), _obj(obj)
    {            
    }

    index_iterator<T> begin()
    {
        if (_obj) { 
            return index_iterator<T>(_obj->begin(), _obj->end());
        }

        return index_iterator<T>(0);
    }

    index_iterator<T> end()
    {
        if (_obj) { 
            return index_iterator<T>(_obj->end(), _obj->end());
        }

        if (_arr) { 
            return index_iterator<T>((int)_arr->size());
        }

        return index_iterator<T>(0);
    }    

    arrayType *_arr;
    objectType *_obj;
};    

template <class T>
struct values_iterator
{
    values_iterator(arrayType *arr) 
        : _arr(arr), _obj(nullptr), _str(nullptr)
    {            
    }

    values_iterator(objectType *obj) 
        : _arr(nullptr), _obj(obj), _str(nullptr)
    {            
    }

    values_iterator(std::string* str) 
    : _arr(nullptr), _obj(nullptr), _str(str)
    {            
    }

    index_iterator<T> begin()
    {
        if (_arr) { 
            return index_iterator<T>(_arr->begin(), _arr->end());
        }

        if (_obj) { 
            return index_iterator<T>(anyIteratorTypeId::iterator_object, _obj->begin(), _obj->end());
        }

        if (_str) {
            return index_iterator<T>(_str->begin(), _str->end());
        }

        return index_iterator<T>(0);
    }

    index_iterator<T> end()
    {
        if (_arr) { 
            return index_iterator<T>(_arr->end(), _arr->end());
        }

        if (_obj) { 
            return index_iterator<T>(anyIteratorTypeId::iterator_object, _obj->end(), _obj->end());
        }

        if (_str) {
            return index_iterator<T>(_str->end(), _str->end());
        }

        return index_iterator<T>(0);
    }    

    arrayType *_arr;
    objectType *_obj;
    std::string *_str;
};

struct any
{
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

    any(const char value)
    {
        _type = anyTypeId::string;
        _value.string = new std::string({value});
    }    

    any(std::nullptr_t value)
    {
        _type = anyTypeId::null;
        _value.const_string = value;
    }

    any(const char *value)
    {
        _type = anyTypeId::const_string;
        _value.const_string = value;
    }

    any(const std::string &value)
    {
        _type = anyTypeId::string;
        _value.string = new std::string(value);
    }

    any(functionPtr value)
    {
        _type = anyTypeId::function;
        _value.function = value;
    }

    any(functionType func)
    {
        _type = anyTypeId::closure;
        _value.closure = new functionType(func);
    }    

    template <class R, class... Args>
    any(R (*value)(Args...))
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

    any(anyTypeId type, const std::initializer_list<any> &values)
    {
        _type = anyTypeId::array;

        std::vector<any> vals;
        vals.reserve(values.size());
        for (auto &item : values)
        {
            vals.push_back(item);
        }

        _value.array = new arrayType(vals);
    }

    any(const std::initializer_list<any> &values) : any(anyTypeId::array, values)
    {
    }

    any(anyTypeId type, const std::initializer_list<std::tuple<any, any>> &values)
    {
        _type = anyTypeId::object;

        objectType obj;
        for (auto &item : values)
        {
            std::string stringIndex;
            auto index = std::get<0>(item);
            switch (index._type)
            {
            case anyTypeId::integer:
                stringIndex = std::to_string(index._value.integer);
                break;
            case anyTypeId::integer64:
                stringIndex = std::to_string(index._value.integer64);
                break;
            case anyTypeId::const_string:
                stringIndex = index._value.const_string;
                break;
            case anyTypeId::string:
                stringIndex = *index._value.string;
                break;
            }

            obj[stringIndex] = std::get<1>(item);
        }

        _value.object = new objectType(obj);
    }

    any(const std::initializer_list<std::tuple<any, any>> &values) : any(anyTypeId::object, values)
    {
    }

    any(anyTypeId initType)
    {
        _type = initType;

        switch (_type)
        {
        case anyTypeId::array:
            _value.array = new arrayType();
            return;

        case anyTypeId::object:
            _value.object = new objectType();
            return;
        }

        throw "wrong type";
    }

    operator bool()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
        case anyTypeId::null:
            return false;

        case anyTypeId::boolean:
            return _value.boolean;

        case anyTypeId::integer:
            return (bool)_value.integer;

        case anyTypeId::integer64:
            return (bool)_value.integer64;

        case anyTypeId::const_string:
            return (bool)_value.const_string[0];

        case anyTypeId::string:
            return _value.string->size() > 0;
        }

        return true;
    }

    operator int()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
        case anyTypeId::null:
            return 0;

        case anyTypeId::boolean:
            return (int)_value.boolean;

        case anyTypeId::integer:
            return _value.integer;

        case anyTypeId::integer64:
            return (int)_value.integer64;

        case anyTypeId::real:
            return (int)_value.real;

        case anyTypeId::const_string:
            return std::stoi(_value.const_string);

        case anyTypeId::string:
            return std::stoi(*_value.string);
        }

        throw "can't convert to int";
    }

    operator long()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
        case anyTypeId::null:
            return 0;

        case anyTypeId::boolean:
            return (long)_value.boolean;

        case anyTypeId::integer:
            return _value.integer;

        case anyTypeId::integer64:
            return (long)_value.integer64;

        case anyTypeId::real:
            return (long)_value.real;

        case anyTypeId::const_string:
            return std::stol(_value.const_string);

        case anyTypeId::string:
            return std::stol(*_value.string);
        }

        return true;
    }    

    operator size_t()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
        case anyTypeId::null:
            return 0;

        case anyTypeId::boolean:
            return _value.boolean;

        case anyTypeId::integer:
            return _value.integer;

        case anyTypeId::integer64:
            return _value.integer64;

        case anyTypeId::real:
            return (size_t)_value.real;

        case anyTypeId::const_string:
            return std::stol(_value.const_string);

        case anyTypeId::string:
            return std::stol(*_value.string);
        }

        throw "can't convert to size_t";
    }       

    operator double()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
        case anyTypeId::null:
            return 0;

        case anyTypeId::boolean:
            return (double)_value.boolean;

        case anyTypeId::integer:
            return _value.integer;

        case anyTypeId::integer64:
            return (double)_value.integer64;

        case anyTypeId::real:
            return (double)_value.real;

        case anyTypeId::const_string:
            return std::stof(_value.const_string);

        case anyTypeId::string:
            return std::stof(*_value.string);
        }

        return true;
    }    

    operator std::string()
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return std::to_string(_value.integer);

        case anyTypeId::integer64:
            return std::to_string(_value.integer64);

        case anyTypeId::real:
            return std::to_string(_value.real);

        case anyTypeId::const_string:
            return std::string(_value.const_string);

        case anyTypeId::string:
            return *_value.string;
        }

        throw "can't convert to string";
    }

    template <class... Args>
    any operator()(Args... args)
    {
        switch (_type)
        {
        case anyTypeId::function:
            return _value.function(args...);

        case anyTypeId::closure:
            return (*(_value.closure))({args...});

        default:
            break;
        }

        throw "not function or closure";
    }

    template <class T, class = std::enable_if<std::is_integral_v<T>>>
    const any operator[](T index) const
    {
        try
        {
            switch (_type)
            {
            case anyTypeId::array:
                return (*(_value.array))[index];
            case anyTypeId::object:
                return (*(_value.object))[std::to_string(index)];
            case anyTypeId::const_string:
                return any(_value.const_string[index]);
            case anyTypeId::string:
                return any(_value.string->operator[](index));                
            }
        }
        catch (const std::out_of_range &)
        {
            return any();
        }

        throw "not an array or an object";
    }

    const any operator[](const char *field) const
    {
        try
        {
            switch (_type)
            {
            case anyTypeId::object:
                return (*(_value.object))[field];
            }
        }
        catch (const std::out_of_range &)
        {
            return any();
        }

        throw "not an array or an object";
    }

    template <class T, class = std::enable_if<std::is_integral_v<T>>>
    any &operator[](T index)
    {
        int tries = 2;
        while (tries-- > 0)
        {
            try
            {
                switch (_type)
                {
                case anyTypeId::array:
                    return (_value.array)->at(index);
                case anyTypeId::object:
                    return (_value.object)->at(std::to_string(index));
                case anyTypeId::const_string:
                    return any(_value.const_string[index]);
                case anyTypeId::string:
                    return any(_value.string->operator[](index));
                }
            }
            catch (const std::out_of_range &)
            {
                if (tries < 1)
                {
                    throw;
                }

                // create new element
                any newUndefined;
                switch (_type)
                {
                case anyTypeId::array:
                {
                    auto &arrayInst = (*(_value.array));
                    while (arrayInst.size() <= index)
                    {
                        arrayInst.push_back(newUndefined);
                    }
                }

                break;
                case anyTypeId::object:
                    (*(_value.object))[std::to_string(index)] = newUndefined;
                    break;
                }

                continue;
            }
        }

        throw "not an object";
    }

    any &operator[](const char *field)
    {
        int tries = 2;
        while (tries-- > 0)
        {
            try
            {
                switch (_type)
                {
                case anyTypeId::object:
                    return (_value.object)->at(field);
                }
            }
            catch (const std::out_of_range &)
            {
                if (tries < 1)
                {
                    throw;
                }

                // create new element
                any newUndefined;
                switch (_type)
                {
                case anyTypeId::object:
                    (*(_value.object))[field] = newUndefined;
                    break;
                }

                continue;
            }
        }

        throw "not an object";
    }

    any &operator[](any index)
    {
        int tries = 2;
        while (tries-- > 0)
        {
            try
            {
                switch (_type)
                {
                case anyTypeId::array:
                    return (_value.array)->at((size_t)index);
                case anyTypeId::object:
                    return (_value.object)->at((std::string)index);
                case anyTypeId::const_string:
                    return any(_value.const_string[(size_t)index]);
                case anyTypeId::string:
                    return any(_value.string->at((size_t)index));
                }
            }
            catch (const std::out_of_range &)
            {
                if (tries < 1)
                {
                    throw;
                }

                // create new element
                any newUndefined;
                switch (_type)
                {
                case anyTypeId::array:
                    while (_value.array->size() <= (size_t)index)
                    {
                        _value.array->push_back(newUndefined);
                    }

                    break;

                case anyTypeId::object:
                    (*(_value.object))[std::string(index)] = newUndefined;
                    break;
                }

                continue;
            }
        }

        throw "not an array or an object";
    }

    const any operator[](any index) const
    {
        try
        {
            switch (_type)
            {
            case anyTypeId::array:
                return (*(_value.array))[(size_t)index];

            case anyTypeId::object:
                return (*(_value.object))[(std::string)index];

                throw "not allowed index type";
            }
        }
        catch (const std::out_of_range &)
        {
            return any();
        }

        throw "not an array or an object";
    }

    keys_iterator<any> keys() 
    {
        if (_type == anyTypeId::array)
        {
            return keys_iterator<any>(_value.array);
        }

        if (_type == anyTypeId::object)
        {
            return keys_iterator<any>(_value.object);
        }

        throw "can't iterate";
    }

    index_iterator<any> begin()
    {
        if (_type == anyTypeId::array)
        {
            return values_iterator<any>(_value.array).begin();
        }

        if (_type == anyTypeId::object)
        {
            return values_iterator<any>(_value.object).begin();
        }

        if (_type == anyTypeId::const_string)
        {
            _type = anyTypeId::string;
            _value.string = new std::string(_value.const_string);
        }

        if (_type == anyTypeId::string)
        {
            return values_iterator<any>(_value.string).begin();
        }

        throw "not an array or anobject";
    }

    index_iterator<any> end()
    {
        if (_type == anyTypeId::array)
        {
            return values_iterator<any>(_value.array).end();
        }

        if (_type == anyTypeId::object)
        {
            return values_iterator<any>(_value.object).end();
        }

        if (_type == anyTypeId::const_string)
        {
            _type = anyTypeId::string;
            _value.string = new std::string(_value.const_string);
        }

        if (_type == anyTypeId::string)
        {
            return values_iterator<any>(_value.string).end();
        }

        throw "not an array or anobject";
    }

    any &operator=(const any &other)
    {
        _type = other._type;
        _value = other._value;
        return *this;
    }

    any operator+(const any &other)
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
            return any(_value.integer + (int)const_cast<any&>(other));

        case anyTypeId::integer64:
            return any(_value.integer64 + (long)const_cast<any&>(other));

        case anyTypeId::real:
            return any(_value.real + (double)const_cast<any&>(other));

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

    any operator-(any other)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return any(_value.integer - (int)other);

        case anyTypeId::integer64:
            return any(_value.integer64 - (long)other);

        case anyTypeId::real:
            return any(_value.real - (double)other);

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    any& operator+=(const any &other)
    {
        (*this) = (*this) + other;
        return *this;
    }    

    auto operator>(any other)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer > (int)other;

        case anyTypeId::integer64:
            return _value.integer64 > (long)other;

        case anyTypeId::real:
            return _value.real > (double)other;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    auto operator<(any other)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer < (int)other;

        case anyTypeId::integer64:
            return _value.integer64 < (long)other;

        case anyTypeId::real:
            return _value.real < (double)other;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    bool operator==(const any& other) const
    {
        if (_type != other._type) 
        {
            return false;
        }

        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer == other._value.integer;
        case anyTypeId::integer64:
            return _value.integer64 == other._value.integer64;
        case anyTypeId::real:
            return _value.real == other._value.real;

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, other._value.const_string) == 0;
        case anyTypeId::string:
            return *(_value.string) == *(other._value.string);            
        }        

        throw "not implemented";
    }

    bool operator==(const any& other)
    {
        if (_type != other._type) 
        {
            return false;
        }

        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer == other._value.integer;
        case anyTypeId::integer64:
            return _value.integer64 == other._value.integer64;
        case anyTypeId::real:
            return _value.real == other._value.real;

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, other._value.const_string) == 0;
        case anyTypeId::string:
            return *(_value.string) == *(other._value.string);            
        }        

        throw "not implemented";
    }

    friend bool operator!=(const any& lhs, const any& rhs)
    {
        if (lhs._type == rhs._type) 
        {
            return false;
        }

        switch (lhs._type)
        {
        case anyTypeId::integer:
            return lhs._value.integer != rhs._value.integer;
        case anyTypeId::integer64:
            return lhs._value.integer64 != rhs._value.integer64;
        case anyTypeId::real:
            return lhs._value.real != rhs._value.real;

        case anyTypeId::const_string:
            return std::strcmp(lhs._value.const_string, rhs._value.const_string) != 0;
        case anyTypeId::string:
            return *(lhs._value.string) != *(rhs._value.string);            
        }        

        throw "not implemented";
    }

    bool operator!=(const any& other)
    {
        return *this != other;
    }    

    any &operator++()
    {
        switch (_type)
        {
        case anyTypeId::integer:
            _value.integer++;
            break;

        case anyTypeId::integer64:
            _value.integer64++;
            break;

        case anyTypeId::real:
            _value.real++;
            break;

        default:
            throw "wrong type";
        }

        return *this;
    }

    any operator++(int)
    {
        any res(*this);
        ++(*this);
        return res;
    }

    any &operator--()
    {
        switch (_type)
        {
        case anyTypeId::integer:
            _value.integer--;
            break;

        case anyTypeId::integer64:
            _value.integer64--;
            break;

        case anyTypeId::real:
            _value.real--;
            break;

        default:
            throw "wrong type";
        }

        return *this;
    }

    any operator--(int)
    {
        any res(*this);
        --(*this);
        return res;
    }

    friend std::ostream &operator<<(std::ostream &os, const any &other);

    void Delete(const char* field)
    {
        switch (_type)
        {
        case anyTypeId::object:
            _value.object->erase(field);
            break;

        default:
            throw "wrong type";
        }
    }    
};

static struct Helper
{
    any Void(any value)
    {
        return any();
    }
} helper;

static struct Console : any
{
    Console() : any(anyTypeId::object)
    {
        //(*this)["log"] = static_cast<std::function<void(void)>>(std::bind(&Console::__log, this));
    }

    void log(any value)
    {
        std::cout << value << std::endl;
    }

    /*
    void __log()
    {
        // experiment to call method by expression
        std::cout << "I'm working..." << std::endl;
    }
    */
} console;

} // namespace js

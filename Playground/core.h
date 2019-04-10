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

#define __OR(x, y) ((bool)(x) ? (x) : (y))
#define __AND(x, y) ((bool)(x) ? (y) : (x))

#define HEADER                      \
    auto param = params.begin();    \
    auto end = params.end();        

#define PARAM(x) any x = end != param ? *param++ : any();
#define PARAM_DEFAULT(x, y) any x = end != param ? *param++ : (y);

struct any;

typedef std::initializer_list<any> paramsType;

typedef void (*functionNoReturnNoParamsPtrType)(any *_this);
typedef void (*functionNoReturnPtrType)(any *_this, const paramsType &);
typedef any (*functionNoParamsPtrType)(any *_this);
typedef any (*functionPtrType)(any *_this, const paramsType &);

typedef std::function<void(any *_this)> functionNoReturnNoParamsType;
typedef std::function<void(any *_this, const paramsType &)> functionNoReturnType;
typedef std::function<any(any *_this)> functionNoParamsType;
typedef std::function<any(any *_this, const paramsType &)> functionType;

typedef std::function<void(void)> lambdaNoReturnNoParamsType;
typedef std::function<void(const paramsType &)> lambdaNoReturnType;
typedef std::function<any(void)> lambdaNoParamsType;
typedef std::function<any(const paramsType &)> lambdaType;

typedef std::unordered_map<std::string, any> objectType;
typedef std::vector<any> arrayType;

#define FN_R_PARAMS(x) (functionPtrType) [x] (any *_this, const paramsType &params)
#define FN_R(x) (functionNoParamsPtrType) [x] (any *_this)
#define FN_PARAMS(x) (functionNoReturnPtrType) [x] (any *_this, const paramsType &params)
#define FN(x) (functionNoReturnNoParamsPtrType) [x] (any *_this)
#define LMB_R_PARAMS(x) (lambdaType) [x] (const paramsType &params)
#define LMB_R(x) (lambdaNoParamsType) [x] ()
#define LMB_PARAMS(x) (lambdaNoReturnType) [x] (const paramsType &params)
#define LMB(x) (lambdaNoReturnNoParamsType) [x] ()

enum anyTypeId
{
    undefined,
    null,
    boolean,
    integer,
    integer64,
    real,
    const_string,
    string,
    array,
    object,
    closure
};

enum anySubTypeId
{
    none,
    functionPtr,
    functionNoReturnPtr,
    functionNoParamsPtr,
    functionNoReturnNoParamsPtr,
    function,
    functionNoReturn,
    functionNoParams,
    functionNoReturnNoParams,
    lambda,
    lambdaNoReturn,
    lambdaNoParams,
    lambdaNoReturnNoParams
};

union anyType {
    bool boolean;
    int integer;
    long integer64; // i think we can use pointer to data to reduce size of anyType
    double real;    // i think we can use pointer to data to reduce size of anyType
    const char *const_string;
    std::string *string;
    arrayType *array;
    objectType *object;
    functionPtrType functionPtr;
};

enum anyIteratorTypeId
{
    iterator_array_key,
    iterator_array,
    iterator_object_key,
    iterator_object,
    iterator_string,
};

inline std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

template <class T>
class index_iterator
{
  public:
    using iterator_category = std::forward_iterator_tag;

    using self_type = index_iterator;
    using value_type = T;
    using pointer = value_type *;
    using reference = value_type &;

    using beginObjectIterType = decltype(((objectType *)nullptr)->begin());
    using endObjectIterType = decltype(((objectType *)nullptr)->end());

    using beginArrayIterType = decltype(((arrayType *)nullptr)->begin());
    using endArrayIterType = decltype(((arrayType *)nullptr)->end());

    using beginStringIterType = decltype(((std::string *)nullptr)->begin());
    using endStringIterType = decltype(((std::string *)nullptr)->end());

    index_iterator(T indx) : _index(indx), _iteratorType(anyIteratorTypeId::iterator_array_key)
    {
    }

    index_iterator(beginObjectIterType objectIteratorBegin, endObjectIterType objectIteratorEnd)
        : index_iterator(anyIteratorTypeId::iterator_object_key, objectIteratorBegin, objectIteratorEnd)
    {
    }

    index_iterator(anyIteratorTypeId anyIteratorType, beginObjectIterType objectIteratorBegin, endObjectIterType objectIteratorEnd)
        : _index(), _iteratorType(anyIteratorType), _objectIteratorBegin(objectIteratorBegin), _objectIteratorEnd(objectIteratorEnd)
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
        : _index(), _iteratorType(anyIteratorTypeId::iterator_array), _arrayIteratorBegin(arrayIteratorBegin), _arrayIteratorEnd(arrayIteratorEnd)
    {
        if (_arrayIteratorBegin != _arrayIteratorEnd)
        {
            _index = *_arrayIteratorBegin;
        }
    }

    index_iterator(beginStringIterType stringIteratorBegin, endStringIterType stringIteratorEnd)
        : _index(), _iteratorType(anyIteratorTypeId::iterator_string), _stringIteratorBegin(stringIteratorBegin), _stringIteratorEnd(stringIteratorEnd)
    {
        if (_stringIteratorBegin != _stringIteratorEnd)
        {
            _index = *_stringIteratorBegin;
        }
    }

    reference operator*() const
    {
        return (reference)_index;
    }

    self_type &operator++()
    {
        switch (_iteratorType)
        {
        case anyIteratorTypeId::iterator_string:
            ++_stringIteratorBegin;
            if (_stringIteratorBegin != _stringIteratorEnd)
            {
                _index = (char)*_stringIteratorBegin;
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
        if (_obj)
        {
            return index_iterator<T>(_obj->begin(), _obj->end());
        }

        return index_iterator<T>(0);
    }

    index_iterator<T> end()
    {
        if (_obj)
        {
            return index_iterator<T>(_obj->end(), _obj->end());
        }

        if (_arr)
        {
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

    values_iterator(std::string *str)
        : _arr(nullptr), _obj(nullptr), _str(str)
    {
    }

    index_iterator<T> begin()
    {
        if (_arr)
        {
            return index_iterator<T>(_arr->begin(), _arr->end());
        }

        if (_obj)
        {
            return index_iterator<T>(anyIteratorTypeId::iterator_object, _obj->begin(), _obj->end());
        }

        if (_str)
        {
            return index_iterator<T>(_str->begin(), _str->end());
        }

        return index_iterator<T>(0);
    }

    index_iterator<T> end()
    {
        if (_arr)
        {
            return index_iterator<T>(_arr->end(), _arr->end());
        }

        if (_obj)
        {
            return index_iterator<T>(anyIteratorTypeId::iterator_object, _obj->end(), _obj->end());
        }

        if (_str)
        {
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
    anySubTypeId _subType;
    anyType _value;
    any *_owner;
    objectType *_associate;

    any() : _type(anyTypeId::undefined), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
    }

    any(const any &other)
    {
        _type = other._type;
        _subType = other._subType;
        _value = other._value;
        _owner = other._owner;
        _associate = other._associate;
#ifdef EXTRA_DEBUG
        std::cout << "allocate(const&): " << *this << std::endl;
#endif
    }

    any(any &&other)
    {
        _type = other._type;
        _subType = other._subType;
        _value = other._value;
        _owner = other._owner;
        _associate = other._associate;
        other._type = undefined;
#ifdef EXTRA_DEBUG
        std::cout << "allocate(move): " << *this << std::endl;
#endif
    }

    any(bool value) : _type(anyTypeId::boolean), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.boolean = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif        
    }

    any(int value) : _type(anyTypeId::integer), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.integer = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif        
    }

    any(long value) : _type(anyTypeId::integer64), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.integer64 = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif        
    }

    any(double value) : _type(anyTypeId::real), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.real = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif        
    }

    any(const char value) : _type(anyTypeId::string), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.string = new std::string({value});
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(std::nullptr_t value) : _type(anyTypeId::null), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.const_string = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(const char *value) : _type(anyTypeId::const_string), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.const_string = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(const std::string &value) : _type(anyTypeId::string), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        _value.string = new std::string(value);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionPtrType value, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionPtr), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoReturnPtrType value, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoReturnPtr), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoParamsPtrType value, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoParamsPtr), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoReturnNoParamsPtrType value, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoReturnNoParamsPtr), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionType func, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::function), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new functionType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoReturnType func, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoReturn), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new functionNoReturnType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoParamsType func, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoParams), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new functionNoParamsType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(functionNoReturnNoParamsType func, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoReturnNoParams), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new functionNoReturnNoParamsType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(lambdaType lambda, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::lambda), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaType(lambda);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(lambdaNoReturnType lambda, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::lambdaNoReturn), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaNoReturnType(lambda);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(lambdaNoParamsType lambda, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::lambdaNoParams), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaNoParamsType(lambda);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(lambdaNoReturnNoParamsType lambda, any *owner = nullptr) : _type(anyTypeId::closure), _subType(anySubTypeId::lambdaNoReturnNoParams), _owner(owner), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaNoReturnNoParamsType(lambda);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class R, class... Args>
    any(R (*value)(Args...)) : _type(anyTypeId::closure), _subType(anySubTypeId::functionPtr), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType)value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class... Args>
    any(void (*value)(Args...)) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoReturnPtr), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class R>
    any(R (*value)()) : _type(anyTypeId::closure), _subType(anySubTypeId::functionNoParamsPtr), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) value;
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class R, class... Args>
    any(std::function<R(Args &&...)> func) : _type(anyTypeId::closure), _subType(anySubTypeId::lambda), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class... Args>
    any(std::function<void(Args &&...)> func) : _type(anyTypeId::closure), _subType(anySubTypeId::lambdaNoReturn), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaNoReturnType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    template <class R>
    any(std::function<R(void)> func) : _type(anyTypeId::closure), _subType(anySubTypeId::lambdaNoParams), _owner(nullptr), _associate(nullptr)
    {
        _value.functionPtr = (functionPtrType) new lambdaNoParamsType(func);
#ifdef EXTRA_DEBUG
        std::cout << "allocate: " << *this << std::endl;
#endif
    }

    any(paramsType::iterator begin, paramsType::iterator end) : _type(anyTypeId::array), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        // count size;
        auto count = 0;
        auto beginCount = begin;
        for (auto it = beginCount; it != end; it++)
        {
            count;
        }

        std::vector<any> vals;
        vals.reserve(count);
        for (auto it = begin; it != end; it++)
        {
            vals.push_back(*it);
        }

        _value.array = new arrayType(vals);
#ifdef EXTRA_DEBUG
        std::cout << "allocate (params): " << *this << std::endl;
#endif
    }

    any(anyTypeId type, const paramsType &values) : _type(anyTypeId::array), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        std::vector<any> vals(values);
        _value.array = new arrayType(vals);
#ifdef EXTRA_DEBUG
        std::cout << "allocate (copy params): " << *this << std::endl;
#endif
    }

    any(const paramsType &values) : any(anyTypeId::array, values)
    {
    }

    any(anyTypeId type, const std::initializer_list<std::tuple<any, any>> &values) : _type(anyTypeId::object), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
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

            auto value = std::get<1>(item);
            value._owner = this;
            obj[stringIndex] = value;
        }

        _value.object = new objectType(obj);
#ifdef EXTRA_DEBUG
        std::cout << "allocate object: " << *this << std::endl;
#endif
    }

    any(const std::initializer_list<std::tuple<any, any>> &values) : any(anyTypeId::object, values)
    {
    }

    any(anyTypeId initType) : _type(initType), _subType(anySubTypeId::none), _owner(nullptr), _associate(nullptr)
    {
        switch (initType)
        {
        case anyTypeId::array:
            _value.array = new arrayType();
#ifdef EXTRA_DEBUG
            std::cout << "allocate array: " << *this << std::endl;
#endif
            return;

        case anyTypeId::object:
            _value.object = new objectType();
#ifdef EXTRA_DEBUG
            std::cout << "allocate object: " << *this << std::endl;
#endif
            return;
        }

        throw "wrong type";
    }

#ifdef EXTRA_DEBUG
    ~any()
    {
        std::cout << "~delete: " << *this << std::endl;
    }
#endif

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

    constexpr operator paramsType()
    {
        if (_type != anyTypeId::array) {
            throw "is not array type (params cast)";
        }

        return paramsType(&_value.array->front(), (&_value.array->back() + 1));
    }

    template <class... Args>
    any operator()(anyTypeId newObjectType, Args... args)
    {
        // New operator
        any newObject(newObjectType);
        auto storeOwner = _owner;
        _owner = &newObject;
        operator()(args...);
        _owner = storeOwner;
        return newObject;
    }

    template <class... Args>
    any operator()(Args... args)
    {
        switch (_subType)
        {
        case anySubTypeId::functionPtr:
            return _value.functionPtr(_owner, {args...});

        case anySubTypeId::functionNoReturnPtr:
            ((functionNoReturnPtrType)_value.functionPtr)(_owner, {args...});
            return any();

        case anySubTypeId::functionNoParamsPtr:
            return ((functionNoParamsPtrType)_value.functionPtr)(_owner);

        case anySubTypeId::functionNoReturnNoParamsPtr:
            ((functionNoReturnNoParamsPtrType)_value.functionPtr)(_owner);
            return any();

        case anySubTypeId::function:
            return (*((functionType*)_value.functionPtr))(_owner, {args...});

        case anySubTypeId::functionNoReturn:
            (*((functionNoReturnType*)_value.functionPtr))(_owner, {args...});
            return any();

        case anySubTypeId::functionNoParams:
            return (*((functionNoParamsType*)_value.functionPtr))(_owner);

        case anySubTypeId::functionNoReturnNoParams:
            (*((functionNoReturnNoParamsType*)_value.functionPtr))(_owner);
            return any();

        case anySubTypeId::lambda:
            return (*((lambdaType*)_value.functionPtr))({args...});

        case anySubTypeId::lambdaNoReturn:
            (*((lambdaNoReturnType*)_value.functionPtr))({args...});
            return any();

        case anySubTypeId::lambdaNoParams:
            return (*((lambdaNoParamsType*)_value.functionPtr))();

        case anySubTypeId::lambdaNoReturnNoParams:
            (*((lambdaNoReturnNoParamsType*)_value.functionPtr))();
            return any();

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

            case anyTypeId::closure:
                if (_associate) {
                    return (*(_associate))[std::to_string(index)];
                }

                break;
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    return (*(_associate))[std::to_string(index)];
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    (*(_associate))[std::to_string(index)] = newUndefined;                
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    return (_associate)->at(field);
                    break;                     
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    (*(_associate))[field] = newUndefined;
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    return _associate->at((std::string)index);                   
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

                case anyTypeId::closure:
                    if (!_associate) {
                        _associate = new objectType();
                    }                    

                    (*(_associate))[std::string(index)] = newUndefined;
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

            case anyTypeId::closure:
                if (!_associate) {
                    const_cast<any*>(this)->_associate = new objectType();
                }                    

                return (*(_associate))[(std::string)index];                
            }

            throw "not allowed index type";
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
        _subType = other._subType;
        _value = other._value;
        _owner = other._owner;
        _associate = other._associate;
        return *this;
    }

    any operator+(const any &other)
    {
        if (_type == anyTypeId::const_string || _type == anyTypeId::string 
            || other._type == anyTypeId::const_string || other._type == anyTypeId::string)
        {
            std::stringstream stream;
            stream << *this;
            stream << other;
            return any(stream.str());
        }

        if (_type == anyTypeId::real)
        {
            return any(_value.real + (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator double() + other._value.real);
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 + (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() + other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer + (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() + other._value.integer);
        }

        throw "not implemented";
    }

    any operator-(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator double() - (double)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(_value.real - (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator double() - other._value.real);
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 - (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() - other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer - (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() - other._value.integer);
        }

        throw "not implemented";
    }

    any operator*(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator double() * (double)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(_value.real * (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator double() * other._value.real);
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 * (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() * other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer * (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() * other._value.integer);
        }

        throw "not implemented";
    }    

    any operator/(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator double() / (double)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(_value.real / (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator double() / other._value.real);
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 / (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() / (double)other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer / (double)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() / (double)other._value.integer);
        }

        throw "not implemented";
    }  

    any operator%(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() % (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() % (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() % (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 % (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() % other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer % (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() % other._value.integer);
        }

        throw "not implemented";
    }      

    any operator|(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() | (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() | (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() | (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 | (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() | other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer | (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() | other._value.integer);
        }

        throw "not implemented";
    }      

    any operator&(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() & (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() & (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() & (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 & (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() & other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer & (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() & other._value.integer);
        }

        throw "not implemented";
    }   

    any operator^(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() ^ (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() ^ (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() ^ (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 ^ (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() ^ other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer ^ (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() ^ other._value.integer);
        }

        throw "not implemented";
    }     

    any operator<<(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() << (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() << (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() << (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 << (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() << other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer << (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() << other._value.integer);
        }

        throw "not implemented";
    } 

    any operator>>(any other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(this->operator long() >> (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::real)
        {
            return any(this->operator long() >> (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::real)
        {
            return any(this->operator long() >> (long)const_cast<any &>(other));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(_value.integer64 >> (long)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(this->operator long() >> other._value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(_value.integer >> (int)const_cast<any &>(other));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(this->operator int() >> other._value.integer);
        }

        throw "not implemented";
    }     

    any operator~()
    {
        if (_type == anyTypeId::boolean) {
            return !_value.boolean;
        }

        if ((_type == anyTypeId::const_string || _type == anyTypeId::string))
        {
            return any(~this->operator long());
        }

        if (_type == anyTypeId::real)
        {
            return any(~this->operator long());
        }

        if (_type == anyTypeId::integer64)
        {
            return any(~_value.integer64);
        }

        if (_type == anyTypeId::integer)
        {
            return any(~_value.integer);
        }

        throw "not implemented";
    }     

    any Pow(const any &other)
    {
        if ((_type == anyTypeId::const_string || _type == anyTypeId::string)
            && (other._type == anyTypeId::const_string || other._type == anyTypeId::string))
        {
            return any(pow(this->operator double(), (double)const_cast<any &>(other)));
        }

        if (_type == anyTypeId::real)
        {
            return any(pow(_value.real, (double)const_cast<any &>(other)));
        }

        if (other._type == anyTypeId::real)
        {
            return any(pow(this->operator double(), other._value.real));
        }

        if (_type == anyTypeId::integer64)
        {
            return any(pow(_value.integer64, (long)const_cast<any &>(other)));
        }

        if (other._type == anyTypeId::integer64)
        {
            return any(pow(this->operator long(), other._value.integer64));
        }

        if (_type == anyTypeId::integer)
        {
            return any(pow(_value.integer, (int)const_cast<any &>(other)));
        }

        if (other._type == anyTypeId::integer)
        {
            return any(pow(this->operator int(), other._value.real));
        }

        throw "not implemented";
    }     

    any &operator+=(const any &other)
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

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, std::string(other).c_str()) > 0;

        case anyTypeId::string:
            return _value.string->compare((std::string)other) > 0;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    auto operator>=(any other)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer >= (int)other;

        case anyTypeId::integer64:
            return _value.integer64 <= (long)other;

        case anyTypeId::real:
            return _value.real <= (double)other;

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, std::string(other).c_str()) <= 0;

        case anyTypeId::string:
            return _value.string->compare(std::string(other)) <= 0;

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

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, std::string(other).c_str()) < 0;

        case anyTypeId::string:
            return _value.string->compare(std::string(other)) < 0;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    auto operator<=(any other)
    {
        switch (_type)
        {
        case anyTypeId::integer:
            return _value.integer <= (int)other;

        case anyTypeId::integer64:
            return _value.integer64 <= (long)other;

        case anyTypeId::real:
            return _value.real <= (double)other;

        case anyTypeId::const_string:
            return std::strcmp(_value.const_string, std::string(other).c_str()) <= 0;

        case anyTypeId::string:
            return _value.string->compare(std::string(other)) <= 0;

        default:
            throw "wrong type";
        }

        throw "not implemented";
    }

    bool operator==(const any &other) const
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

    bool operator==(const any &other)
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

    friend bool operator!=(const any &lhs, const any &rhs)
    {
        return !(lhs == rhs);
    }

    bool StrictEquals(const any &other) 
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

    inline bool StrictNotEquals(const any &other) 
    {
        return !StrictEquals(other);
    }    

    bool In(const any &index) 
    {
        try
        {
            switch (_type)
            {
            case anyTypeId::array:
            {
                auto& value1 = (*(_value.array))[(size_t)const_cast<any &>(index)];
                return true;
            }
            case anyTypeId::object:
            {
                auto& value2 = (*(_value.object))[(std::string)const_cast<any &>(index)];
                return true;
            }
            }
        }
        catch (const std::out_of_range &)
        {
            return false;
        }

        throw "not implemented";
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

    int hash(void) const noexcept
    {
        size_t const h1 ( std::hash<int>{}((int)_type) );
        size_t h2;

        switch (_type)
        {
        case anyTypeId::undefined:
            h2 = 0;
            break;

        case anyTypeId::null:
            h2 = 0;
            break;

        case anyTypeId::boolean:
            h2 = std::hash<bool>{} (_value.boolean);
            break;

        case anyTypeId::integer:
            h2 = std::hash<int>{} (_value.integer);
            break;

        case anyTypeId::integer64:
            h2 = std::hash<long>{} (_value.integer64);
            break;

        case anyTypeId::real:
            h2 = std::hash<double>{} (_value.real);
            break;

        case anyTypeId::const_string:
            h2 = std::hash<std::string>{} (_value.const_string);
            break;

        case anyTypeId::string:
            h2 = std::hash<std::string>{} (*(_value.string));
            break;

        case anyTypeId::object:
            h2 = std::hash<void*>{} (_value.object);
            break;            

        case anyTypeId::closure:
            h2 = std::hash<void*>{} (_value.object);
            break;

        default:
            h2 = 0;
        }

        return hash_combine(h1, h2);
    }

    any TypeOf()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return "undefined";

        case anyTypeId::null:
            return "null";

        case anyTypeId::boolean:
            return "boolean";

        case anyTypeId::integer:
        case anyTypeId::integer64:
        case anyTypeId::real:
            return "number";

        case anyTypeId::const_string:
        case anyTypeId::string:
            return "string";

        case anyTypeId::closure:
            return "function";

        default:
            return "error";
        }
    }

    void Delete(const char *field)
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

    friend std::ostream &operator<<(std::ostream &os, const any &other)
    {
        switch (other._type)
        {
        case anyTypeId::undefined:
            os << "undefined";
            break;

        case anyTypeId::null:
            os << "null";
            break;

        case anyTypeId::boolean:
            os << (other._value.boolean ? "true" : "false");
            break;

        case anyTypeId::integer:
            os << other._value.integer;
            break;

        case anyTypeId::integer64:
            os << other._value.integer64;
            break;

        case anyTypeId::real:
            os << other._value.real;
            break;

        case anyTypeId::const_string:
            os << other._value.const_string;
            break;

        case anyTypeId::string:
            os << *other._value.string;
            break;

        case anyTypeId::object:
            os << "[object]";
            break;            

        case anyTypeId::closure:
            os << "[function]";

            switch (other._subType)
            {
            case anySubTypeId::functionPtr:
            case anySubTypeId::functionNoReturnPtr:
            case anySubTypeId::functionNoParamsPtr:
            case anySubTypeId::functionNoReturnNoParamsPtr:
                os << "(pointer)";
                break;

            case anySubTypeId::function:
            case anySubTypeId::functionNoReturn:
            case anySubTypeId::functionNoParams:
            case anySubTypeId::functionNoReturnNoParams:
                break;

            case anySubTypeId::lambda:
            case anySubTypeId::lambdaNoReturn:
            case anySubTypeId::lambdaNoParams:
            case anySubTypeId::lambdaNoReturnNoParams:
                os << "(arrow)";
                break;
            }

            break;

        default:
            os << "<error>";
        }

        return os;
    }
};

inline any operator"" _a ( const char* val, std::size_t len )
{
    return any(val);
}

template <class T>
static any TypeOf(T value);
template <>
static any TypeOf(any value)
{
    return value.TypeOf();
}

template< class T > static any Void(T value);
template<> 
static any Void(any value)
{
    return any();
}

template< class T > static T __Pow(T left, T right);
template<> 
inline static any __Pow(any left, any right)
{
    return left.Pow(right);
}

template< class T > static bool __StrictEquals(T left, T right);
template<> 
inline static bool __StrictEquals(any left, any right)
{
    return left.StrictEquals(right);
}

template< class T > static bool __StrictNotEquals(T left, T right);
template<> 
inline static bool __StrictNotEquals(any left, any right)
{
    return left.StrictNotEquals(right);
}

template< class T > static bool __In(T left, T right);
template<> 
inline static bool __In(any left, any right)
{
    return right.In(left);
}

struct Finally
{
private:    
	std::function<void()> _dtor;
public:
	Finally(std::function<void()> dtor) : _dtor(dtor) {};
	~Finally() { _dtor(); }
};

static any _ROOT(anyTypeId::object);

static void Console_log(any* _this, const paramsType &params)
{
    for (auto &item : params) {
        std::cout << item;
    }

    std::cout << std::endl;
}

static struct Console : any
{
    any log;

    Console() 
        : any(anyTypeId::object), 
          log(&Console_log, this)
    {
    }

} console;

} // namespace js

namespace std
{
    template<> struct hash<js::any>
    {
        typedef js::any argument_type;
        typedef std::size_t result_type;
        result_type operator()(argument_type const& value) const
        {
            return value.hash();
        }
    };
}

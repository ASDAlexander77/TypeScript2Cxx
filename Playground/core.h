#ifndef CORE_H
#define CORE_H

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
#include <typeinfo>
#include <typeindex>
#include <iomanip>
#include <cmath>
#include <algorithm>
#include <random>
#include <regex>

namespace js
{

//#define OR(x, y) ((bool)(x) ? (x) : (y))
//#define AND(x, y) ((bool)(x) ? (y) : (x))
#define OR(x, y) ([&]() { auto vx = (x); return ((bool)(vx) ? (vx) : (y)); })()
#define AND(x, y) ([&]() { auto vx = (x); return ((bool)(vx) ? (y) : (vx)); })()

struct any;
struct object;
struct string;

template <typename T>
struct _Deduction_MethodPtr;

inline std::size_t hash_combine(const std::size_t hivalue, const std::size_t lovalue)
{
    return lovalue + 0x9e3779b9 + (hivalue << 6) + (hivalue >> 2);
}

std::ostream &operator<<(std::ostream &os, std::nullptr_t ptr);

template <typename I, typename T>
inline bool is(T *t)
{
    return dynamic_cast<I *>(t) != nullptr;
}

template <typename I, typename T>
inline bool is(const std::shared_ptr<T> &t)
{
    return std::dynamic_pointer_cast<I>(t) != nullptr;
}

template <typename I, typename T>
inline bool __is(T *t)
{
    return std::type_index(typeid(I *)) == std::type_index(typeid(t)) || is<I>(t);
}

template <class T>
static string typeOf(T value);

template <typename T>
inline auto isNaN(T t)
{
    return std::isnan(NAN);
}

template <typename R, typename T>
inline R cast(T t)
{
    return (R)t;
}

template <typename L, typename R>
constexpr bool Equals(L l, R r)
{
    return l == r;
}

template <typename L, typename R>
constexpr bool NotEquals(L l, R r)
{
    return l != r;
}

template <typename T>
constexpr const T &const_(T &t)
{
    return static_cast<const T &>(t);
}

template <typename T>
constexpr const T *const_(T *t)
{
    return static_cast<const T *>(t);
}

/*
template <typename T> 
constexpr const T const_(T t) {
	return static_cast<const T>(t);
}
*/

template <typename T>
constexpr T &mutable_(const T &t)
{
    return const_cast<T &>(t);
}

template <typename T>
constexpr T *mutable_(const T *t)
{
    return const_cast<T *>(t);
}

template <typename T>
constexpr T &deref_(T *t)
{
    return *t;
}

template <typename T>
constexpr T deref_(T t)
{
    return t;
}

template <typename T>
constexpr auto keys_(const T &t) -> decltype(t->keys())
{
    return t->keys();
}

template <typename T>
constexpr auto keys_(T &t) -> decltype(t->keys())
{
    return t->keys();
}

namespace bitwise
{
template <typename T>
inline T rshift(T op1, T op2)
{
    return (T)((long)op1 >> (long)op2);
}

template <typename T>
inline T lshift(T op1, T op2)
{
    return (T)((long)op1 << (long)op2);
}
} // namespace bitwise

static struct undefined_t
{

    bool isUndefined;

    undefined_t()
    {
        isUndefined = false;
    }

    undefined_t(bool value) : isUndefined(value)
    {
    }

    constexpr operator bool() const
    {
        return !isUndefined;
    }

    constexpr operator bool()
    {
        return !isUndefined;
    }

    inline operator std::nullptr_t()
    {
        return nullptr;
    }

    bool operator==(undefined_t other)
    {
        return isUndefined == other.isUndefined;
    }

    bool operator!=(undefined_t other)
    {
        return isUndefined != other.isUndefined;
    }

    bool operator==(std::nullptr_t)
    {
        return !isUndefined;
    }

    bool operator!=(std::nullptr_t)
    {
        return isUndefined;
    }

    bool operator==(int i)
    {
        return !isUndefined && i == 0;
    }

    bool operator!=(int i)
    {
        return isUndefined && i == 0;
    }

    friend std::ostream &operator<<(std::ostream &os, undefined_t val)
    {
        return os << "undefined";
    }
} undefined(true);

struct boolean : public undefined_t
{

    bool _value;

    boolean() : _value(false), undefined_t(true)
    {
    }

    boolean(bool initValue)
    {
        _value = initValue;
    }

    boolean(const undefined_t &undef) : undefined_t(true)
    {
    }

    constexpr operator const bool() const
    {
        return !isUndefined && _value;
    }

    constexpr operator bool()
    {
        return !isUndefined && _value;
    }

    constexpr boolean *operator->()
    {
        return this;
    }

    friend std::ostream &operator<<(std::ostream &os, boolean val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << ((bool)val ? "true" : "false");
    }
};

namespace tmpl
{
template <typename V>
struct number : public undefined_t
{
    using number_t = number<V>;
    V _value;

    number() : _value(0), undefined_t(true)
    {
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number(T initValue)
    {
        _value = static_cast<V>(initValue);
    }

    number(const undefined_t &undef) : undefined_t(true)
    {
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    constexpr operator T() const
    {
        return static_cast<T>(_value);
    }

    constexpr operator size_t() const
    {
        return (size_t)_value;
    }

    constexpr operator bool() const
    {
        return !isUndefined && _value != 0;
    }

    constexpr operator double() const
    {
        return _value;
    }

    constexpr number_t *operator->()
    {
        return this;
    }

    operator std::string() const
    {
        std::ostringstream streamObj2;
        streamObj2 << _value;
        return streamObj2.str();
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator+(const T t)
    {
        return number_t(_value + t);
    }

/*
    number_t operator+(number_t n)
    {
        return number_t(_value + n._value);
    }
*/

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator+(const T t, number_t value)
    {
        return number_t(t + value._value);
    }

    friend number_t operator+(const number_t n, number_t value)
    {
        return number_t(n._value + value._value);
    }

    number_t operator+()
    {
        return number_t(+_value);
    }

    number_t &operator++()
    {
        _value += 1;
        return *this;
    }

    number_t operator++(int)
    {
        number_t tmp(*this);
        operator++();
        return tmp;
    }

    number_t &operator+=(number_t other)
    {
        _value += other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend T &operator+=(T &t, number_t other)
    {
        t += other._value;
        return t;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator-(T t)
    {
        return number_t(_value - t);
    }

    number_t operator-(number_t n)
    {
        return number_t(_value - n._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator-(T t, number_t value)
    {
        return number_t(t - value._value);
    }

    number_t operator-()
    {
        return number_t(-_value);
    }

    number_t &operator--()
    {
        _value -= 1;
        return *this;
    }

    number_t operator--(int)
    {
        number_t tmp(*this);
        operator--();
        return tmp;
    }

    number_t &operator-=(number_t other)
    {
        _value -= other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend T &operator-=(T &t, number_t other)
    {
        t -= other._value;
        return t;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator*(T t)
    {
        return number_t(_value * t);
    }

    number_t operator*(number_t n)
    {
        return number_t(_value * n._value);
    }

    number_t &operator*=(number_t other)
    {
        _value *= other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend T &operator*=(T &t, number_t other)
    {
        t *= other._value;
        return t;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator*(T t, number_t value)
    {
        return number_t(t * value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator/(T t)
    {
        return number_t(_value / t);
    }

    number_t operator/(number_t n)
    {
        return number_t(_value / n._value);
    }

    number_t &operator/=(number_t other)
    {
        _value /= other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend T &operator/=(T &t, number_t other)
    {
        t /= other._value;
        return t;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator/(T t, number_t value)
    {
        return number_t(t / value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator^(T t)
    {
        return number_t((long)_value ^ (long)t);
    }

    number_t operator^(number_t n)
    {
        return number_t((long)_value ^ (long)n._value);
    }

    number_t &operator^=(number_t other)
    {
        _value = (long)_value ^ (long)other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator^(T t, number_t value)
    {
        return number_t((long)t ^ (long)value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator|(T t)
    {
        return number_t((long)_value | (long)t);
    }

    number_t operator|(number_t n)
    {
        return number_t((long)_value | (long)n._value);
    }

    number_t &operator|=(number_t other)
    {
        _value = (long)_value | (long)other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator|(T t, number_t value)
    {
        return number_t((long)t | (long)value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator&(T t)
    {
        return number_t((long)_value & (long)t);
    }

    number_t operator&(number_t n)
    {
        return number_t((long)_value & (long)n._value);
    }

    number_t &operator&=(number_t other)
    {
        _value = (long)_value & (long)other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    number_t operator%(T t)
    {
        return number_t((long)_value % (long)t);
    }

    number_t operator%(number_t n)
    {
        return number_t((long)_value % (long)n._value);
    }

    number_t &operator%=(number_t other)
    {
        _value = (long)_value % (long)other._value;
        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator%(T t, number_t value)
    {
        return number_t((long)t % (long)value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend number_t operator&(T t, number_t value)
    {
        return number_t((long)t & (long)value._value);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator==(T t)
    {
        return !isUndefined && _value == t;
    }

    bool operator==(number_t n)
    {
        return isUndefined == n.isUndefined && _value == n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator!=(T t)
    {
        return !isUndefined && _value != t;
    }

    bool operator!=(number_t n)
    {
        return isUndefined != n.isUndefined && _value != n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator<(T t)
    {
        return !isUndefined && _value < t;
    }

    bool operator<(number_t n)
    {
        return isUndefined == n.isUndefined && _value < n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator<=(T t)
    {
        return !isUndefined && _value <= t;
    }

    bool operator<=(number_t n)
    {
        return isUndefined == n.isUndefined && _value <= n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend bool operator<(T t, number_t value)
    {
        return !isUndefined && t < value._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend bool operator<=(T t, number_t value)
    {
        return !isUndefined && t <= value._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator>(T t)
    {
        return !isUndefined && _value > t;
    }

    bool operator>(number_t n)
    {
        return isUndefined == n.isUndefined && _value > n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator>=(T t)
    {
        return !isUndefined && _value >= t;
    }

    bool operator>=(number_t n)
    {
        return isUndefined == n.isUndefined && _value >= n._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend bool operator>(T t, number_t value)
    {
        return !isUndefined && t > value._value;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend bool operator>=(T t, number_t value)
    {
        return !isUndefined && t >= value._value;
    }

    js::string toString();
    js::string toString(number_t radix);

    friend std::ostream &operator<<(std::ostream &os, number_t val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << val._value;
    }
};
}

typedef tmpl::number<double> number;

struct string : public undefined_t
{

    std::string _value;

    string() : _value(), undefined_t(true)
    {
    }

    string(std::string value) : _value(value)
    {
    }

    string(const char *value) : _value(value)
    {
    }

    string(const char value) : _value(1, value)
    {
    }

    string(const undefined_t &undef) : undefined_t(true)
    {
    }

    inline operator const char *()
    {
        return _value.c_str();
    }

    constexpr string *operator->()
    {
        return this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    string operator[](T t) const
    {
        return string(_value[t]);
    }

    string operator[](number n) const
    {
        return string(_value[n]);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    string operator+(T t)
    {
        string tmp(_value);
        tmp._value.append(std::to_string(t));
        return tmp;
    }

    string operator+(number value)
    {
        string tmp(_value);
        tmp._value.append(value.operator std::string());
        return tmp;
    }

    string operator+(string value)
    {
        string tmp(_value);
        tmp._value.append(value._value);
        return tmp;
    }

    string operator+(any value);

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    string &operator+=(T t)
    {
        _value.append(std::to_string(t));
        return *this;
    }

    string &operator+=(number value)
    {
        _value.append(value.operator std::string().c_str());
        return *this;
    }

    string &operator+=(string value)
    {
        _value.append(value._value.c_str());
        return *this;
    }

    string &operator+=(any value);

    bool operator==(const js::string &other)
    {
        return isUndefined && _value.compare(other._value) == 0;
    }

    bool operator==(std::nullptr_t)
    {
        return isUndefined && _value.c_str() == nullptr;
    }

    bool operator!=(const js::string &other)
    {
        return isUndefined && _value.compare(other._value) != 0;
    }

    bool operator!=(std::nullptr_t)
    {
        return isUndefined && _value.c_str() != nullptr;
    }    

    string toUpperCase()
    {
        std::string result(*this);
        for (auto &c : result)
        {
            c = toupper(c);
        }

        return string(result);
    }

    string toLowerCase()
    {
        std::string result(*this);
        for (auto &c : result)
        {
            c = tolower(c);
        }

        return string(result);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    string substring(T begin, T end)
    {
        return string(_value.substr(begin, end - begin));
    }

    string substring(number begin, number end)
    {
        return string(_value.substr(begin, end - begin));
    }

    auto begin() -> decltype(_value.begin())
    {
        return _value.begin();
    }

    auto end() -> decltype(_value.end())
    {
        return _value.end();
    }

    friend std::ostream &operator<<(std::ostream &os, string val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << val._value;
    }
};

static js::string operator""_S(const char *s, std::size_t size)
{
    return js::string(s);
}

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx (__thiscall _Cls::*)(Args...) const>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename Rx, typename _Cls, typename... Args>
struct _Deduction_MethodPtr<Rx (__thiscall _Cls::*)(Args...)>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename Rx, typename... Args>
struct _Deduction_MethodPtr<Rx (__cdecl *)(Args...)>
{
    using _ReturnType = Rx;
    const static size_t _CountArgs = sizeof...(Args);
};

template <typename F, typename _type = decltype(&F::operator())>
struct _Deduction
{
    using type = _type;
};

template <typename F, typename Array, std::size_t... I>
auto invoke_seq_impl(const F &f, Array &a, std::index_sequence<I...>)
{
    return std::invoke(f, a[I]...);
}

template <std::size_t N, typename F, typename Array, typename Indices = std::make_index_sequence<N>>
auto invoke_seq(const F &f, Array &a)
{
    return invoke_seq_impl(f, a, Indices{});
}

template <typename F, typename Array, std::size_t... I>
auto invoke_seq_impl(F &f, Array &a, std::index_sequence<I...>)
{
    return std::invoke(f, a[I]...);
}

template <std::size_t N, typename F, typename Array, typename Indices = std::make_index_sequence<N>>
auto invoke_seq(F &f, Array &a)
{
    return invoke_seq_impl(f, a, Indices{});
}


struct function
{
    virtual any invoke(std::initializer_list<any> args_) = 0;

    template <typename... Args>
    auto operator()(Args... args);
};

template <typename F, typename _MethodType = typename _Deduction<F>::type>
struct function_t : function
{
    using _MethodPtr = _Deduction_MethodPtr<_MethodType>;
    using _ReturnType = typename _MethodPtr::_ReturnType;

    F _f;

    function_t(const F &f) : _f{f}
    {
    }

    virtual any invoke(std::initializer_list<any> args_) override;
};

template <typename T>
struct ArrayKeys
{
    typedef ArrayKeys<T> iterator;

    T _index;
    T _end;

    ArrayKeys(T end_) : _index(0), _end(end_)
    {
    }

    iterator &begin()
    {
        return *this;
    }

    iterator &end()
    {
        return *this;
    }

    const T &operator*() const
    {
        return _index;
    }

    bool operator!=(const iterator &rhs) const
    {
        return _index != rhs._end;
    }

    iterator &operator++()
    {
        _index++;
        return *this;
    }
};

namespace tmpl
{
template <typename E>
struct array : public undefined_t
{
    std::vector<E> _values;

    array() : _values(), undefined_t(false)
    {
    }

    array(std::initializer_list<E> values) : _values(values)
    {
    }

    array(const undefined_t &undef) : undefined_t(true)
    {
    }

    constexpr array *operator->()
    {
        return this;
    }

    template <class I, class = std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, js::number>>>
    E &operator[](I i) const
    {
        if ((size_t)i >= _values.size())
        {
            return E(undefined);
        }

        return mutable_(_values)[(size_t)i];
    }

    template <class I, class = std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, js::number>>>
    E &operator[](I i)
    {
        while ((size_t)i >= _values.size())
        {
            _values.push_back(undefined_t());
        }

        return _values[(size_t)i];
    }

    ArrayKeys<std::size_t> keys()
    {
        return ArrayKeys<std::size_t>(_values.size());
    }

    auto begin() -> decltype(_values.begin())
    {
        return _values.begin();
    }

    auto end() -> decltype(_values.end())
    {
        return _values.end();
    }

    friend std::ostream &operator<<(std::ostream &os, array val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << "[array]";
    }

    template <class I>
    std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, js::number>, bool> exists(I i) const
    {
        return (size_t)i < _values.size();
    }

    template <class I>
    std::enable_if_t<!std::is_arithmetic_v<I> && !std::is_same_v<I, js::number>, bool> exists(I i) const
    {
        return false;
    }
};
} // namespace tmpl

typedef tmpl::array<any> array;

template <typename V, typename T = decltype(V().begin())>
struct ObjectKeys
{
    typedef ObjectKeys<V> iterator;

    T _index;
    const T _end;

    ObjectKeys(V &values_) : _index(values_.begin()), _end(values_.end())
    {
    }

    iterator &begin()
    {
        return *this;
    }

    iterator &end()
    {
        return *this;
    }

    const std::string &operator*() const
    {
        return _index->first;
    }

    bool operator!=(const iterator &rhs) const
    {
        return _index != rhs._end;
    }

    iterator &operator++()
    {
        ++_index;
        return *this;
    }
};

struct object : public undefined_t
{

    using pair = std::pair<std::string, any>;

    std::unordered_map<std::string, any> _values;

    object();

    object(std::initializer_list<pair> values);

    object(const undefined_t &undef) : undefined_t(true)
    {
    }

    virtual ~object()
    {
    }

    ObjectKeys<decltype(_values)> keys();

    constexpr object *operator->()
    {
        return this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T> || std::is_same_v<T, number>>>
    any &operator[](T t) const
    {
        return mutable_(_values)[std::to_string(t)];
    }

    any &operator[](const char *s) const;

    any &operator[](std::string s) const;

    any &operator[](string s) const;

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T> || std::is_same_v<T, number>>>
    any &operator[](T t)
    {
        return _values[std::to_string(t)];
    }

    any &operator[](const char *s);

    any &operator[](std::string s);

    any &operator[](string s);

    void Delete(const char *field)
    {
        _values.erase(field);
    }

    template <class I>
    std::enable_if_t<std::is_same_v<I, const char *> || std::is_same_v<I, std::string> || std::is_same_v<I, string> || std::is_same_v<I, any> || std::is_arithmetic_v<I> || std::is_same_v<I, number>, bool> exists(I i) const
    {
        return _values.find(std::to_string(i)) != _values.end();
    }

    template <class I>
    std::enable_if_t<!std::is_same_v<I, const char *> && !std::is_same_v<I, std::string> && !std::is_same_v<I, string> && !std::is_same_v<I, any> && !std::is_arithmetic_v<I> && !std::is_same_v<I, number>, bool> exists(I i) const
    {
        return false;
    }

    friend std::ostream &operator<<(std::ostream &os, object val)
    {
        if (val.isUndefined)
        {
            return os << "undefined";
        }

        return os << "[object]";
    }
};

struct any
{

    enum anyTypeId
    {
        undefined,
        boolean,
        number,
        string,
        function,
        array,
        object,
        object_class
    };

    union anyType {
        js::boolean _boolean;
        js::number _number;
        void *_data;
        js::function *_function;

        constexpr anyType() : _data(nullptr)
        {
        }

        inline anyType(js::boolean value) : _boolean(value)
        {
        }

        inline anyType(js::number t) : _number(t)
        {
        }

        constexpr anyType(std::nullptr_t) : _data(nullptr)
        {
        }

        constexpr anyType(void *ptr) : _data(ptr)
        {
        }

        constexpr anyType(js::function *funcPtr) : _function(funcPtr)
        {
        }
    };

    anyTypeId _type;
    anyType _value;
    long* _counter;

    any() : _type(anyTypeId::undefined), _value(nullptr), _counter(nullptr)
    {
    }

    any(const js::any &value) : _type(value._type), _value(value._value), _counter(value._counter)
    {
        if (_counter != nullptr) 
        {
            ++(*_counter);
        }
    }

    any(const undefined_t &undef) : _type(anyTypeId::undefined), _counter(nullptr)
    {
    }

    any(std::nullptr_t v) : _type(anyTypeId::object), _value(v), _counter(nullptr)
    {
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    any(T initValue) : _type(anyTypeId::number), _value(js::number(initValue)), _counter(nullptr)
    {
    }

    any(bool value) : _type(anyTypeId::boolean), _value(js::boolean(value)), _counter(nullptr)
    {
    }

    any(const js::boolean &value) : _type(anyTypeId::boolean), _value(value), _counter(nullptr)
    {
    }

    any(const js::number &value) : _type(anyTypeId::number), _value(value), _counter(nullptr)
    {
    }

    any(const js::string &value) : _type(anyTypeId::string), _value((void *)new js::string(value)), _counter(new long)
    {
        *_counter = 1;
    }

    any(const js::array &value) : _type(anyTypeId::array), _value((void *)new js::array(value)), _counter(new long)
    {
        *_counter = 1;
    }

    any(const js::object &value) : _type(anyTypeId::object), _value((void *)new js::object(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename F, class = std::enable_if_t<std::is_member_function_pointer_v<typename _Deduction<F>::type>>>
    any(const F &value) : _type(anyTypeId::function), _value((js::function *)new js::function_t<F>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename Rx, typename... Args>
    any(Rx (__cdecl *value)(Args...)) : _type(anyTypeId::function), _value((js::function *)new js::function_t<Rx (__cdecl *)(Args...), Rx (__cdecl *)(Args...)>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    template <typename C>
    any(std::shared_ptr<C> value) : _type(anyTypeId::object_class), _value((void *)new std::shared_ptr<js::object>(value)), _counter(new long)
    {
        *_counter = 1;
    }

    ~any()
    {
        if (_value._data == nullptr || _counter == nullptr || !*_counter || --(*_counter) > 0)
        {
            return;
        }

        switch (_type)
        {
            case anyTypeId::undefined:
            case anyTypeId::boolean:
            case anyTypeId::number:
                break;
            case anyTypeId::string:
                delete (js::string*)_value._data;
                break;
            case anyTypeId::object:
                delete (js::object*)_value._data;
                break;
            case anyTypeId::array:
                delete (js::array*)_value._data;
                break;
            case anyTypeId::object_class:
                delete (std::shared_ptr<js::object>*)_value._data;
                break;
            default:
                break;
        }

        delete _counter;
        _counter = nullptr;
        _value._data = nullptr;
    }

    constexpr any *operator->()
    {
        return this;
    }

    any& operator=(const any& other)
    {
        _type = other._type;
        _value = other._value;  
        _counter = other._counter;
        if (_counter != nullptr) 
        {
            ++(*_counter);
        }

        return *this;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T> || std::is_same_v<T, js::number>>>
    any &operator[](T t) const
    {
        if (_type == anyTypeId::array)
        {
            return mutable_(*(js::array *)_value._data)[t];
        }

        throw "wrong type";        
    }    

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T> || std::is_same_v<T, js::number>>>
    any &operator[](T t)
    {
        if (_type == anyTypeId::array)
        {
            return (*(js::array *)_value._data)[t];
        }

        throw "wrong type";
    }

    template <class T>
    any &operator[](T t) const
    {
        if (_type == anyTypeId::object)
        {
            return mutable_(*(js::object *)_value._data)[t];
        }

        throw "wrong type";
    }

    template <class T>
    any &operator[](T t)
    {
        if (_type == anyTypeId::object)
        {
            return (*(js::object *)_value._data)[t];
        }

        throw "wrong type";
    }

    using js_boolean = js::boolean;
    operator js_boolean()
    {
        if (_type == anyTypeId::boolean)
        {
            return _value._boolean;
        }

        throw "wrong type";
    }

    using js_number = js::number;
    operator js_number()
    {
        if (_type == anyTypeId::number)
        {
            return _value._number;
        }

        if (_type == anyTypeId::string)
        {
            return js::number(std::atof((*(js::string *)_value._data).operator const char *()));
        }

        throw "wrong type";
    }

    using js_string = js::string;
    operator js_string()
    {
        if (_type == anyTypeId::string)
        {
            return *(js::string *)_value._data;
        }

        if (_type == anyTypeId::number)
        {
            return js::string(_value._number.operator std::string());
        }

        throw "wrong type";
    }

    using js_object = js::object;
    operator js_object()
    {
        if (_type == anyTypeId::object)
        {
            return *(js::object *)_value._data;
        }

        throw "wrong type";
    }

    using js_array = js::array;
    operator js_array()
    {
        if (_type == anyTypeId::array)
        {
            return *(js::array *)_value._data;
        }

        throw "wrong type";
    }

    operator bool()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return false;
        case anyTypeId::boolean:
            return _value._boolean._value;
        case anyTypeId::number:
            return _value._number._value != 0.0;
        case anyTypeId::string:
            return ((js::string *)_value._data)->_value.length() > 0;
        case anyTypeId::object:
            return _value._data != nullptr && ((js::object *)_value._data)->_values.size() > 0;
        case anyTypeId::array:
            return ((js::array *)_value._data)->_values.size() > 0;
        case anyTypeId::object_class:
            return _value._data != nullptr;
        default:
            break;
        }

        return false;
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    operator T()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return T{0};
        case anyTypeId::boolean:
            return static_cast<T>(_value._boolean._value);
        case anyTypeId::number:
            return static_cast<T>(_value._number._value);
        case anyTypeId::string:
            return static_cast<T>(std::stold(((js::string *)_value._data)->_value));
        default:
            return (T)(_value._data);
        }

        throw "wrong type";
    }

    template <typename T>
    using std_shared_ptr = std::shared_ptr<T>;
    template <typename T>
    operator std_shared_ptr<T>()
    {
        if (_type == anyTypeId::object_class)
        {
            return std::shared_ptr<T>(*(std::shared_ptr<js::object> *)_value._data);
        }

        throw "wrong type";
    }

    template <typename Rx, typename... Args>
    operator std::function<Rx(Args...)>()
    {
        if (_type == anyTypeId::function)
        {
            auto func = _value._function;
            return std::function<Rx(Args...)>([=](Args... args) -> Rx {
                return func->invoke({args...});
            });
        }

        throw "wrong type";
    }

    operator std::string()
    {
        std::ostringstream streamObj2;
        streamObj2 << *this;
        return streamObj2.str();
    }

    template <typename T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator==(T t) const
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return false;
        case anyTypeId::boolean:
            return _value._boolean._value == (bool)t;
        case anyTypeId::number:
            return _value._number._value == t;
        case anyTypeId::string:
            return ((js::string *)_value._data)->_value == std::to_string(t);
        case anyTypeId::object:
            return false;
        }

        throw "not implemented";
    }

    bool operator==(const js::any &other) const
    {
        if (_type != other._type)
        {
            return false;
        }

        switch (_type)
        {
        case anyTypeId::undefined:
            return true;
        case anyTypeId::boolean:
            return _value._boolean._value == other._value._boolean._value;
        case anyTypeId::number:
            return _value._number._value == other._value._number._value;
        case anyTypeId::string:
            return std::strcmp(((js::string *)_value._data)->_value.c_str(), ((js::string *)other._value._data)->_value.c_str()) == 0;
        case anyTypeId::object:
            return ((js::object *)_value._data) == ((js::object *)other._value._data);
        }

        throw "not implemented";
    }

    bool operator!=(const js::any &other) const
    {
        return !(*this == other);
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    any operator+(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number + t);
        }

        throw "not implemented";
    }

    any operator+(any t) const
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number + t._value._number);
            case anyTypeId::string:
                return any(js::string(std::strcat(mutable_(static_cast<std::string>(_value._number).c_str()), ((js::string *)t._value._data)->_value.c_str())));
            }
            break;
        case anyTypeId::string:
            switch (t._type)
            {
            case anyTypeId::string:
                return any(js::string(std::strcat(mutable_(((js::string *)_value._data)->_value.c_str()), ((js::string *)t._value._data)->_value.c_str())));
            }
            break;
        }

        throw "not implemented";
    }

    any operator+(any t)
    {
        return const_(this)->operator+(t);
    }

    any &operator++()
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number += 1;
            return *this;
        }

        throw "not implemented";
    }

    any operator++(int)
    {
        any tmp(*this);
        operator++();
        return tmp;
    }

    any &operator+=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number += other;
            return *this;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    any operator-(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number - t);
        }

        throw "not implemented";
    }

    any operator-(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number - t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    any &operator--()
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number -= 1;
            return *this;
        }

        throw "not implemented";
    }

    any operator--(int)
    {
        any tmp(*this);
        operator--();
        return tmp;
    }

    any &operator-=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number -= other;
            return *this;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    any operator*(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number * t);
        }

        throw "not implemented";
    }

    any operator*(const js::number &t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number * t);
        }

        throw "not implemented";
    }

    any operator*(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number * t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    any &operator*=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number *= other;
            return *this;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend any operator*(T t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number:
            return any(t * value._value._number);
        }

        throw "not implemented";
    }

    friend any operator*(js::number n, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number:
            return any(n._value * value._value._number);
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    any operator/(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number / t);
        }

        throw "not implemented";
    }

    any operator/(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number / t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    any operator/(const js::number &t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return any(_value._number / t);
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    friend any operator/(T t, any value)
    {
        switch (value._type)
        {
        case anyTypeId::number:
            return any(t / value._value._number);
        }

        throw "not implemented";
    }

    any &operator/=(js::number other)
    {
        switch (_type)
        {
        case anyTypeId::number:
            _value._number /= other;
            return *this;
        }

        throw "not implemented";
    }

    bool operator>(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value > n._value;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator>(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value > t;
        }

        throw "not implemented";
    }

    any operator>(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number > t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator>=(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value >= n._value;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator>=(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value >= t;
        }

        throw "not implemented";
    }

    any operator>=(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number >= t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator<(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value < n._value;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator<(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value < t;
        }

        throw "not implemented";
    }

    any operator<(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number < t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    bool operator<=(js::number n)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value <= n._value;
        }

        throw "not implemented";
    }

    template <class T, class = std::enable_if_t<std::is_arithmetic_v<T>>>
    bool operator<=(T t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            return _value._number._value <= t;
        }

        throw "not implemented";
    }

    any operator<=(any t)
    {
        switch (_type)
        {
        case anyTypeId::number:
            switch (t._type)
            {
            case anyTypeId::number:
                return any(_value._number <= t._value._number);
            }
            break;
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args) const
    {
        switch (_type)
        {
        case anyTypeId::function:
            return _value._function->invoke({args...});
        }

        throw "not implemented";
    }

    template <typename... Args>
    any operator()(Args... args)
    {
        switch (_type)
        {
        case anyTypeId::function:
            return _value._function->invoke({args...});
        }

        throw "not implemented";
    }

    js::string typeOf()
    {
        switch (_type)
        {
        case anyTypeId::undefined:
            return "undefined";

        case anyTypeId::boolean:
            return "boolean";

        case anyTypeId::number:
            return "number";

        case anyTypeId::string:
            return "string";

        case anyTypeId::array:
            return "array";

        case anyTypeId::object:
            return "object";

        default:
            return "error";
        }
    }

    void Delete(const char *field)
    {
        switch (_type)
        {
        case anyTypeId::object:
            ((js::object *)_value._data)->_values.erase(field);
            break;

        default:
            throw "wrong type";
        }
    }

    size_t hash(void) const noexcept
    {
        size_t const h1(std::hash<int>{}((int)_type));
        size_t h2;

        switch (_type)
        {
        case anyTypeId::undefined:
            h2 = 0;
            break;

        case anyTypeId::boolean:
            h2 = std::hash<bool>{}(_value._boolean._value);
            break;

        case anyTypeId::number:
            h2 = std::hash<double>{}(_value._number._value);
            break;

        case anyTypeId::string:
            h2 = std::hash<std::string>{}(((js::string *)_value._data)->_value);
            break;

        case anyTypeId::object:
            h2 = std::hash<void *>{}((js::object *)_value._data);
            break;

        default:
            h2 = 0;
        }

        return hash_combine(h1, h2);
    }

    friend std::ostream &operator<<(std::ostream &os, any val)
    {
        if (val._type == anyTypeId::undefined)
        {
            return os << "undefined";
        }

        if (val._type == anyTypeId::boolean)
        {
            return os << val._value._boolean;
        }

        if (val._type == anyTypeId::number)
        {
            return os << val._value._number;
        }

        if (val._value._data == nullptr)
        {
            return os << "null";
        }

        if (val._type == anyTypeId::string)
        {
            return os << *(js::string *)val._value._data;
        }

        if (val._type == anyTypeId::function)
        {
            return os << "[function]";
        }

        if (val._type == anyTypeId::array)
        {
            return os << "[array]";
        }

        if (val._type == anyTypeId::object)
        {
            return os << "[object]";
        }

        return os << "[any]";
    }
};

template <>
inline bool Equals(undefined_t l, undefined_t r)
{
    return l.isUndefined == r.isUndefined;
}

template <>
inline bool Equals(undefined_t l, std::nullptr_t)
{
    return l.isUndefined;
}

template <>
inline bool Equals(std::nullptr_t, undefined_t r)
{
    return r.isUndefined;
}

template <>
inline bool Equals(undefined_t l, int r)
{
    return l.isUndefined && r == 0;
}

template <>
inline bool Equals(int l, undefined_t r)
{
    return l == 0 && r.isUndefined;
}

template <>
inline bool Equals(any l, int r)
{
    return l.operator==(r);
}

template <>
inline bool Equals(int l, any r)
{
    return r.operator==(l);
}

template <>
inline bool NotEquals(undefined_t l, undefined_t r)
{
    return l.isUndefined != r.isUndefined;
}

template <>
inline bool NotEquals(undefined_t l, std::nullptr_t)
{
    return !l.isUndefined;
}

template <>
inline bool NotEquals(std::nullptr_t, undefined_t r)
{
    return !r.isUndefined;
}

template <>
inline bool NotEquals(undefined_t l, int r)
{
    return !(l.isUndefined && r == 0);
}

template <>
inline bool NotEquals(int l, undefined_t r)
{
    return !(l == 0 && r.isUndefined);
}

template <>
inline bool NotEquals(any l, int r)
{
    return !(l.operator==(r));
}

template <>
inline bool NotEquals(int l, any r)
{
    return !(r.operator==(l));
}

template <>
string typeOf(boolean value)
{
    return "boolean"_S;
}

template <>
string typeOf(number value)
{
    return "number"_S;
}

template <>
string typeOf(string value)
{
    return "string"_S;
}

template <>
string typeOf(object value)
{
    return "object"_S;
}

template <>
string typeOf(any value)
{
    return value.typeOf();
}

template <class T>
static any Void(T value);

template <>
any Void(any value)
{
    return any();
}

template <typename I>
inline bool is(js::any t);

template <>
inline bool is<js::boolean>(js::any t)
{
    return t && t._type == any::boolean;
}

template <>
inline bool is<js::number>(js::any t)
{
    return t && t._type == any::number;
}

template <>
inline bool is<js::string>(js::any t)
{
    return t && t._type == any::string;
}

template <>
inline bool is<js::array>(js::any t)
{
    return t && t._type == any::array;
}

template <>
inline bool is<js::object>(js::any t)
{
    return t && t._type == any::object;
}

template <>
inline bool is<js::function>(js::any t)
{
    return t && t._type == any::function;
}

struct Finally
{
private:
    std::function<void()> _dtor;

public:
    Finally(std::function<void()> dtor) : _dtor(dtor){};
    ~Finally() { _dtor(); }
};

struct Utils
{
    template <typename... Args>
    static object assign(object &dst, const Args &... args)
    {
        for (auto src : {args...})
        {
            for (auto &k : keys_(src))
            {
                dst[k] = const_(src)[k];
            }
        }

        return dst;
    }
};

template <typename... Args>
auto function::operator()(Args... args)
{
    return invoke({args...});
}

template <typename F, typename _MethodType>
any function_t<F, _MethodType>::invoke(std::initializer_list<any> args_)
{
    auto args_vector = std::vector<any>(args_);
    if constexpr (std::is_void_v<_ReturnType>)
    {
        invoke_seq<_MethodPtr::_CountArgs>(_f, args_vector);
        return any();
    }
    else
    {
        return invoke_seq<_MethodPtr::_CountArgs>(_f, args_vector);
    }
}

template <typename V>
constexpr bool IN(V v, const array &a)
{
    return a.exists(v);
}

template <typename V>
constexpr bool IN(V v, const object &a)
{
    return a.exists(v);
}

template <typename V, class Ax, class=std::enable_if_t<std::is_member_function_pointer_v<decltype(&Ax::exists)>>>
constexpr bool IN(V v, const Ax &a)
{
    return a.exists(v);
}

template <typename V, class Ax, class=std::enable_if_t<std::is_member_function_pointer_v<decltype(&Ax::exists)>>>
constexpr bool IN(V v, Ax *a)
{
    return a->exists(v);
}

template <typename V, class O>
constexpr bool IN(V v, O o)
{
    return false;
}

// Number
namespace tmpl {
template <typename V>
js::string number<V>::toString() {
    std::ostringstream streamObj2;
    streamObj2 << _value;
    return streamObj2.str();
} 

template <typename V>
js::string number<V>::toString(number_t radix) {
    return js::string(std::to_string(_value));
}
} // namespace tmpl

} // namespace js

namespace std
{
template <>
struct hash<js::any>
{
    typedef js::any argument_type;
    typedef std::size_t result_type;
    result_type operator()(argument_type const &value) const
    {
        return value.hash();
    }
};
} // namespace std

#define MAIN \
int main(int argc, char** argv) \
{   \
    try \
    {   \
        Main(); \
    }   \
    catch (std::exception& exception)   \
    {   \
        std::cout << exception.what() << std::endl; \
    }   \
    catch (std::string& s)  \
    {   \
        std::cout << s << std::endl;    \
    }   \
    catch (char* s) \
    {   \
        std::cout << s << std::endl;    \
    }   \
    catch (...) \
    {   \
        std::cout << "General failure." << std::endl;    \
    }   \
    return 0;   \
}

// JS Core classes
namespace js {

template <typename T>
struct ReadonlyArray
{
    number length;
    std::vector<T> _values;

    ReadonlyArray() : _values()
    {
    }

    ReadonlyArray(std::initializer_list<T> values) : _values(values)
    {
    }

    ArrayKeys<std::size_t> keys()
    {
        return ArrayKeys<std::size_t>(_values.size());
    }

    template <class I, class = std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, number>>>
    T &operator[](I i) const
    {
        if ((size_t)i >= _values.size())
        {
            return T(undefined);
        }

        return mutable_(_values)[(size_t)i];
    }

    void forEach(std::function<void(T, size_t)> callback)
    {
    }
};

template <typename T>
struct Array : public ReadonlyArray<T>
{
    typedef ReadonlyArray<T> super__;
    using super__::_values;

    Array() : ReadonlyArray<T>()
    {
    }

    Array(std::initializer_list<T> values) : ReadonlyArray<T>(values)
    {
    }

    template <class I, class = std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, number>>>
    T &operator[](I i) const
    {
        if ((size_t)i >= _values.size())
        {
            return T(undefined);
        }

        return mutable_(_values)[(size_t)i];
    }

    template <class I, class = std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, number>>>
    T &operator[](I i)
    {
        while ((size_t)i >= _values.size())
        {
            _values.push_back(undefined_t());
        }

        return _values[(size_t)i];
    }

    void push(T t)
    {
        _values.push_back(t);
    }

    template <typename... Args>
    void push(Args... args)
    {
        for (const auto &item : {args...})
        {
            _values.push_back(item);
        }
    }

    T pop()
    {
        return _values.pop_back();
    }

    auto begin() -> decltype(_values.begin())
    {
        return _values.begin();
    }

    auto end() -> decltype(_values.end())
    {
        return _values.end();
    }

    template <class I>
    std::enable_if_t<std::is_arithmetic_v<I> || std::is_same_v<I, number>, bool> exists(I i) const
    {
        return (size_t)i < _values.size();
    }

    template <class I>
    std::enable_if_t<!std::is_arithmetic_v<I> && !std::is_same_v<I, number>, bool> exists(I i) const
    {
        return false;
    }
};

struct Date
{
    number getHours()
    {
        return number(0);
    }

    number getMinutes()
    {
        return number(0);
    }

    number getSeconds()
    {
        return number(0);
    }
};

struct Function
{
};

struct RegExp
{

    std::regex re;

    RegExp(js::string pattern) : re((const char *)pattern)
    {
    }

    js::boolean test(js::string val)
    {
        try
        {
            if (std::regex_search((const char *)val, re))
            {
                return true;
            }
        }
        catch (std::regex_error &)
        {
        }

        return false;
    }
};

template <typename T>
struct TypedArray : public Array<T>
{
    js::number length;
    TypedArray(js::number length_) : length(length_)
    {
    }
};

struct Int16Array : TypedArray<short>
{
    Int16Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint16Array : TypedArray<unsigned short>
{
    Uint16Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Float32Array : TypedArray<float>
{
    Float32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Float64Array : TypedArray<double>
{
    Float64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Int32Array : TypedArray<int>
{
    Int32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint32Array : TypedArray<unsigned int>
{
    Uint32Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Int64Array : TypedArray<long>
{
    Int64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct Uint64Array : TypedArray<unsigned long>
{
    Uint64Array(js::number length_) : TypedArray(length_)
    {
    }
};

struct ArrayBuffer
{
};

struct ArrayBufferView
{
};

static number parseInt(const js::string &value, int base = 10)
{
    return number(std::stoi(value._value, 0, base));
}

static number parseFloat(const js::string &value)
{
    return number(std::stod(value._value, 0));
}

template <typename T>
struct Promise
{
    static void all()
    {
    }

    void _catch()
    {
    }

    void finally()
    {
    }

    void then()
    {
    }

    static void race()
    {
    }

    static void reject()
    {
    }

    static void resolve()
    {
    }
};

static struct MathImpl
{
    static number E;
    static number LN10;
    static number LN2;
    static number LOG2E;
    static number LOG10E;
    static number PI;
    static number SQRT1_2;
    static number SQRT2;

    constexpr MathImpl *operator->()
    {
        return this;
    }

    static number pow(number op, number op2)
    {
        return number(std::pow((double)op, (double)op2));
    }

    static number min(number op, number op2)
    {
        return number(std::min((double)op, (double)op2));
    }

    static number max(number op, number op2)
    {
        return number(std::max((double)op, (double)op2));
    }

    static number sin(number op)
    {
        return number(std::sin((double)op));
    }

    static number cos(number op)
    {
        return number(std::cos((double)op));
    }

    static number asin(number op)
    {
        return number(std::asin((double)op));
    }

    static number acos(number op)
    {
        return number(std::acos((double)op));
    }

    static number abs(number op)
    {
        return number(std::abs((double)op));
    }

    static number floor(number op)
    {
        return number(std::floor((double)op));
    }

    static number round(number op, int numDecimalPlaces = 0)
    {
        const auto mult = 10 ^ (numDecimalPlaces);
        return number(std::floor((double)op * mult + 0.5) / mult);
    }

    static number sqrt(number op)
    {
        return number(std::sqrt((double)op));
    }

    static number tan(number op)
    {
        return number(std::tan((double)op));
    }

    static number atan(number op)
    {
        return number(std::atan((double)op));
    }

    static number atan2(number op1, number op2)
    {
        return number(std::atan2((double)op1, (double)op2));
    }

    static number log(number op)
    {
        return number(std::log((double)op));
    }

    static number exp(number op)
    {
        return number(std::exp((double)op));
    }

    static number random()
    {
        std::default_random_engine generator;
        std::uniform_real_distribution<double> distribution(0.0, 1.0);
        auto rnd = distribution(generator);
        return number(rnd);
    }
} Math;

static struct Console
{
    Console()
    {
        std::cout << std::boolalpha;
    }

    constexpr Console *operator->()
    {
        return this;
    }

    template <class... Args>
    void log(Args... args)
    {
        for (auto &arg : {args...})
        {
            std::cout << arg;
        }

        std::cout << std::endl;
    }

    template <class... Args>
    void warn(Args... args)
    {
        for (auto &arg : {args...})
        {
            std::clog << arg;
        }

        std::clog << std::endl;
    }

    template <class... Args>
    void error(Args... args)
    {
        for (auto &arg : {args...})
        {
            std::cerr << arg;
        }

        std::cerr << std::endl;
    }

} console;

struct XMLHttpRequest
{
};

template <typename T>
using ArrayLike = Array<T>;

// HTML
struct HTMLElement
{
};

struct HTMLImageElement
{
};

struct EventListenerOptions
{
    boolean capture;
};

struct AddEventListenerOptions : public EventListenerOptions
{
    boolean once;
    boolean passive;
};

struct Blob
{
};

struct DataView
{
};

struct BodyInit
{
};

struct Document
{
};

struct WebGLQuery
{
};

struct HTMLCanvasElement
{
};

struct CanvasRenderingContext2D
{
};

struct WebGLFramebuffer
{
};

struct WebGLRenderbuffer
{
};

struct WebGLTexture
{
};

// end of HTML
} // namespace js

#endif // CORE_H
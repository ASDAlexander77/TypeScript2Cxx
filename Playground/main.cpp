#include "core.h"
#include <iostream>

using namespace js;

void functionTest() { std::cout << "Hello - functionTest" << std::endl; }

auto functionTest2() -> std::function<void(void)>
{
    std::cout << "Hello - functionTest2" << std::endl;

    std::shared_ptr<any> bptr = std::make_shared<any>(12);
    any &b = *bptr;

    auto r = [=]() {
        any &b = *bptr;

        std::cout << "Hello - functionTest2 - lambda" << std::endl;
        std::cout << b << std::endl;
    };
    return r;
}

template <class T>
class base_iterator
{
  public:
    using iterator_category = std::forward_iterator_tag;

    using self_type = base_iterator;
    using value_type = T;
    using pointer = value_type*;
    using reference = value_type&;

    base_iterator()
    {
    }    

    reference operator*() const {
        return const_cast<base_iterator<T>*>(this)->GetReference();
    }

    self_type &operator++() {
        Increment();
        return *this;
    };

    virtual bool operator!=(const self_type &_right) const = 0;

    virtual reference GetReference() = 0;
    virtual void Increment() = 0;
};

template <class T>
class index_iterator1 : public base_iterator<T>
{
public:    
    index_iterator1(T idx, T end) : _index(idx), _end(end)
    {
        current = _index;
    }

    virtual base_iterator<T>::reference GetReference() override {
        return current;
    }

    virtual void Increment() override {
        _index++;
        current = _index;
    }

    virtual bool operator!=(const base_iterator<T>::self_type &right) const {
        auto d = dynamic_cast<index_iterator1<T>*>(const_cast<base_iterator<T>*>(&right));
        if (d) {
            return d->current != this->current;
        }

        return false;
    }

    T _index;
    T _end;
    base_iterator<T>::value_type current;
};

int main(int argc, char **argv)
{
    std::cout << "'any' size = " << sizeof(any) << std::endl;

    for (auto i = index_iterator1<int>(0, 10); i != index_iterator1<int>(10, 10); ++i) {
        std::cout << *i << std::endl;
    }
 
    // const
    any a;
    any b = nullptr;
    any c = true;
    any d = 1;
    any e = 2L;
    any f = 1123.12;
    any g = "string";
    any h = functionTest;

    // copy
    any i = b;

    std::cout << a << " " << b << " " << c << " " << d << " " << e << " " << f
              << " " << g << " " << h << " " << i << std::endl;

    // call function reference
    h();

    // lambdas
    any j = functionTest2();
    j();

    std::cout << j << std::endl;

    // operators
    any k = d + e;

    std::cout << "d + e = " << d << " + " << e << " = " << k << std::endl;

    // array
    any l = {1, 2, 3};

    std::cout << " l[0] = " << l[0] << " l[1] = " << l[1] << " l[2] = " << l[2]
              << std::endl;

    any index = 0;
    for (auto &item : l)
    {
        std::cout << "for l[" << index << "] = " << item << std::endl;
        index = index + 1;
    }

    any m = {std::make_tuple("field 1", 1), std::make_tuple("field 2", 2),
             std::make_tuple("field 3", 3)};

    std::cout << "m['field 1'] = " << m["field 1"] << std::endl;
    std::cout << "m['field 2'] = " << m["field 2"] << std::endl;
    std::cout << "m['field 3'] = " << m["field 3"] << std::endl;

    return 0;
}
#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Node;
class TargetCamera;
class ArcCamera;

template <typename T>
class IBehaviorAware : public object {
public:
    virtual void init() = 0;
};

class Node : public IBehaviorAware<Node > {
public:
    any metadata = nullptr;

    Array<any>* animations = new Array<any>();

    Node(any scene = nullptr);
    virtual void init();
    virtual void set_x(any v);
    virtual any get_x();
};

class TargetCamera : public Node {
public:
    TargetCamera();
    virtual void set_x1(any v);
    virtual any get_x1();
};

class ArcCamera : public TargetCamera {
public:
    ArcCamera();
    virtual void set_x2(any v);
    virtual any get_x2();
};

#endif

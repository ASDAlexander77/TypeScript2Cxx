#ifndef TEST_H
#define TEST_H
#include "core.h"

using namespace js;

class Node1;
class AbstractScene;
class Scene;
class Camera;
extern Scene* s;
extern Camera* c;

class Node1 : public object {
public:
    Scene* _scene;

    Node1(Scene* scene);
    virtual Scene* getScene();
    virtual any get_parent();
    virtual void set_parent(any v);
};

class AbstractScene : public object {
public:
};

class Scene : public AbstractScene {
public:
    Array<any>* cameras = new Array<any>();

    virtual void addCamera(Camera* newCamera);
    virtual any get_parent();
    virtual void set_parent(any v);
};

class Camera : public Node1 {
public:
    Camera(Scene* scene);
    virtual any get_parent();
};

#endif

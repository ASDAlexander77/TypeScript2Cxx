interface ITest {
    abort();
}

class Test implements ITest {
    abort() {
    }
};

const a: Test = new Test();

const b = new Test();

const c: ITest = new Test();

var o = {
    prop: 37,
    f: function () {
        return this.prop;
    }
};

console.log(o.f());

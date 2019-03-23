namespace js {

    typedef void (*functionPtr)();

    enum anyTypeId
    {
        undefined,
        boolean,
        integer,
        integer64,
        real,
        string,
        function
    };

    union anyType
    {
        bool boolean;
        int integer;
        long integer64;
        double real;
        char* string;
        functionPtr function;
    };

    struct any
    {
        anyTypeId _type;
        anyType _value;

        any() {
            _type = anyTypeId::undefined;            
        }

        any(int value) {
            _type = anyTypeId::integer;
            _value.integer = value;
        }

        operator int() const {
            if (_type == anyTypeId::integer) {
                return _value.integer; 
            }

            throw "cast";
        }
    };

}

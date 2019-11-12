	class Test {                           
            val = 10;                           
                                                
            public testMethod() {               
                console.log(this.val);          
            }                                   
        }                                       
                                                
        const t = new Test();                   
        const m2 = t.testMethod;                
        m2();                                   
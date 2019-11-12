	class Test {                           
            val = 10;                           
                                                
            public testMethod() {               
                console.log(this.val);          
            }                                   
        }                                       
                                                
        class Test2 {                           
            val = 20;                           
        }                                       
                                                
        const t = new Test();                   
                                                
        const m1 = t.testMethod;                
        m1();                                   
                                                
        const t2 = new Test2();                 
                                                
        const m2 = t.testMethod.bind(t2);       
        m2();                                   
        function fff(m3) {                      
            m3();                               
        }                                       
                                                
        fff(t.testMethod.bind(t2));             
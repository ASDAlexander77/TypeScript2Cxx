class Class1 {                                     
            public class0 = false;                          
            public class1 = false;                          
            public method1(): boolean {                     
                this.class1 = false;                        
                return false;                               
            }                                               
        }                                                   
        class Class2 extends Class1 {                       
            public class2 = false;                          
            public method1(): boolean {                     
                this.class1 = true;                         
                this.class2 = false;                        
                return super.method1();                     
            }                                               
        }                                                   
        const c1 = new Class1();                            
        c1.method1();                                       
        console.log(c1.class0);                             
        console.log(c1.class1);                             
        const c2 = new Class2();                            
        c2.method1();                                       
        console.log(c2.class0);                             
        console.log(c2.class1);                             
        console.log(c2.class2);     
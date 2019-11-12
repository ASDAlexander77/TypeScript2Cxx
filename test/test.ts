	class Class1 {                                 
            constructor(v1: number, v2:string, v3: number, d: number = 10) {  
                console.log(v1);                        
                console.log(v2);                        
                console.log(v3);                        
                console.log(d);                         
            }                                           
                                                        
            public static Identity(): number {          
                return "class1";                        
            }                                           
        }                                               
                                                        
        var c = new Class1(1, Class1.Identity(), 3);    
        c.show();                                       
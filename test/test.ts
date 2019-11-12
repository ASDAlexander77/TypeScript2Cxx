	class Class0 {                                 
            public Identity(): string {                 
                return "class0";                        
            }                                           
        }                                               
        class Class1 {                                 
            constructor(v1: number, v2:string, v3: number, d: number = 10) {  
                console.log(v1);                        
                console.log(v2);                        
                console.log(v3);                        
                console.log(d);                         
            }                                           
        }                                               
                                                        
        var c = new Class1(1, new Class0().Identity(), 3);    
        c.show();                                       
        class Test {                                                   
            public constructor(private name: string) {                  
                console.log(this.name);                                 
            }                                                           
        }                                                               
                                                                        
        class Test2 extends Test {                                      
        }                                                               
                                                                        
        const c = new Test2("asd");                                     
        console.log(c.name);                                            

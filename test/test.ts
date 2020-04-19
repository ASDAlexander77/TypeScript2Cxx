module M1  {                               
            module M2 {                             
                export class C {                    
                    static Y() { return 2; }        
                                                    
                    X() { return 1; }               
                }                                   
            }                                       
        }                                           
                                                    
        const c = new M1.M2.C();                    
        console.log(c.X()); 
module M {                                 
            export class C {                        
                static Y() { return 2; }            
                                                    
                X() { return 1; }                   
            }                                       
        }                                           
                                                    
        const c = new M.C();                        
        console.log(c.X());
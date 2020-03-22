    function ffff(f1, f2?, f3?, f4?, f5?, f6?, f7?, f8 = 1) {              
        console.log(f1);                                                       
        console.log(f2 === undefined ? "<error>" : f2);                        
        console.log(f3 === null ? "null" : "<error>");                         
        console.log(f4 === undefined ? "<error>" : f4);                        
        console.log(f5 === undefined ? "undef" : "<error>");                   
        console.log(f6 === undefined ? "undef" : "<error>");                   
        console.log(f7 === undefined ? "undef" : "<error>");                   
        console.log(f8 === undefined ? "<error>" : f8);                        
    }                                                                          
                                                                               
    ffff(10, 20, null, 30);     
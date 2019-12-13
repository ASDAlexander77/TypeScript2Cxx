function f() {                             
        const up3 = 3;                          
        function ff() {                         
            const up2 = 2;                      
            function fff() {                    
                const up1 = 1;                  
                function ffff() {               
                    const l = up1;              
                    const m = up2;              
                    const n = up3;              
                    console.log(l);             
                    console.log(m);             
                    console.log(n);             
                }                               
                ffff();                         
            }                                   
            fff();                              
        }                                       
        ff();                                   
    }                                           
                                                
    f();
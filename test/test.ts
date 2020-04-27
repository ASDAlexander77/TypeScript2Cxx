	function run() {                                                   
            let o = 1;                                                      
            const a = function() {                                          
                o = 2;                                                      
            };                                                              
                                                                            
            a();                                                            
                                                                            
            console.log(o);                                                 
        }                                                                   
                                                                            
        run();
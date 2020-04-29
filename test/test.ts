	function run() {                                                   
            const o = [0, 1];                                               
            const a = function() {                                          
                o[1] = 2;                                                   
            };                                                              
                                                                            
            a();                                                            
                                                                            
            console.log(o[1]);                                              
        }                                                                   
                                                                            
        run();
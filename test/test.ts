	var i:any;                                    
        i = null; console.log(i && null);                     
        i = 0; console.log(i && null);                        
        i = 1; console.log(i && null);                        
                                                                 
        i = null; console.log(i && 0);                        
        i = 0; console.log(i && 0);                           
        i = 1; console.log(i && 0);                           
                                                                 
        i = null; console.log(i && 1);                        
        i = 0; console.log(i && 1);                           
        i = 1; console.log(i && 1);                           
        i = 1; console.log(i && 2);
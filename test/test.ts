	let options = {                                                    
            b1: false                                                       
        };                                                                  
                                                                            
        let mergedOptions = {                                               
            bilinearFiltering: false,                                       
            comparisonFunction: 0,                                          
            generateStencil: false,                                         
            ...options                                                      
        };                                                                  
                                                                            
        console.log(mergedOptions.comparisonFunction);                      
        console.log(mergedOptions.b1);
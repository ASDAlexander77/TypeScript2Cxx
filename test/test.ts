const falloffType = 0;                                      
                                                                
    const FALLOFF_GLTF = 2;                                     
    const FALLOFF_PHYSICAL = 1;                                 
    const FALLOFF_STANDARD = 3;                                 
                                                                
    switch (falloffType) {                                      
        case FALLOFF_GLTF:                                      
            console.log("not working 1");                       
        break;                                                  
        case FALLOFF_PHYSICAL:                                  
            console.log("not working 2");                       
        break;                                                  
        case FALLOFF_STANDARD:                                  
            console.log("not working 3");                       
        break;                                                  
    }                                                           
    console.log("done"); 
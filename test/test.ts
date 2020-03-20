	 function padLeft(value: string, padding: number)                       
         function padLeft(value: string, padding: string)                       
         function padLeft(value: string, padding: any) {                        
            if (typeof padding == "number") {                                   
                return padding + value;                                         
            }                                                                   
                                                                                
            if (typeof padding == "string") {                                   
                return padding + value;                                         
            }                                                                   
                                                                                
            return null;                                                        
        }                                                                       
                                                                                
        console.log(padLeft("Hello world", 4)); 
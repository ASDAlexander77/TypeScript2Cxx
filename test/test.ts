        function padLeft<T>(value: string, padding: T) {                        
            return padding + value;                                         
        }                                                                       
                                                                                
        console.log(padLeft("Hello world", 4));
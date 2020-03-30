	class Class1 {                                 
            private val: string;                        
                                                        
            public set(s: string): Class1 {             
                this.val = s;                           
                return this;                            
            }                                           
                                                        
            public show() {                             
                console.log(this.val);                  
            }                                           
        }                                               
                                                        
        new Class1().set("Hello").show();
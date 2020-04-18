	class Engine {                                                     
            private static _last: number;                                          
                                                                            
            public static get Last(): number {                              
                return this._last;                                          
            }                                                               
                                                                            
            public static set Last(v: number) {                             
                this._last = v;                                             
            }                                                               
        }                                                                   
                                                                            
        Engine.Last = 1;                                                    
        console.log(Engine.Last);
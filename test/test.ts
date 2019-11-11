	export class Test {                                                
            constructor(t1: any, t2?: any, t3?: any) {                      
                console.log(t1);                                            
                console.log(t2);                                            
                console.log(t3);                                            
            }                                                               
        }                                                                   
        function getValue(val) {                                            
            return val + 1;                                                 
        }                                                                   
        function run(val) {                                                 
            new Test(getValue(val));                                        
        }                                                                   
        run(10);                                                            
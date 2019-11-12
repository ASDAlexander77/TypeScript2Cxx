	export class Base {                                                
            constructor(public number: number) {                            
            }                                                               
        }                                                                   
                                                                            
        export class Derived extends Base {                                 
            constructor(number: number) {                                   
                super(number);                                              
            }                                                               
        }                                                                   
                                                                            
        const d1 = new Derived(1);                                          
        const d2 = new Derived(2);                                          
                                                                            
        console.log(d1.number);                                             
        console.log(d2.number);
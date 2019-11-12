	export class Observable<T> {                                       
            constructor(onObserverAdded?: (observer: any) => void) {        
                console.log("Run");                                         
                if (onObserverAdded) {                                      
                    console.log("Error");                                   
                }                                                           
            }                                                               
        }                                                                   
        new Observable();                                                   
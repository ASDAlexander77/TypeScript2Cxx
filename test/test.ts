	export class Node1 {                                                           
            private static _NodeConstructors: {[key: string]: any} = {};                
                                                                                        
            public static AddNodeConstructor(type: string, constructorFunc: any) {      
                this._NodeConstructors[type] = constructorFunc;                         
            }                                                                           
        }                                                                               
                                                                                        
        Node1.AddNodeConstructor("asd", () => {});                                      
                                                                                        
        console.log("Run"); 
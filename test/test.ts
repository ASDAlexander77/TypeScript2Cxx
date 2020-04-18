export interface IBehaviorAware<T> {                   
            init(): void;                                       
        }                                                       
                                                                
        class Node implements IBehaviorAware<Node> {            
        public metadata: any = null;                            
                                                                
        public animations = [];                                 
                                                                
        constructor(scene: any = null) {                        
            this.init();                                        
        }                                                       
                                                                
        public init() {                                         
        }                                                       
                                                                
        public set x(v) {                                       
        }                                                       
                                                                
        public get x() {                                        
            return 0;                                           
        }                                                       
    }                                                           
                                                                
    class TargetCamera extends Node {                           
        constructor() {                                         
            super();                                            
        }                                                       
                                                                
        public set x1(v) {                                      
        }                                                       
                                                                
        public get x1() {                                       
            return 1;                                           
        }                                                       
    }                                                           
                                                                
    class ArcCamera extends TargetCamera {                      
        constructor() {                                         
            super();                                            
        }                                                       
                                                                
        public set x2(v) {                                      
        }                                                       
                                                                
        public get x2() {                                       
            return 2;                                           
        }                                                       
    }                                                           
                                                                
    new ArcCamera();                                            
    console.log("Run");
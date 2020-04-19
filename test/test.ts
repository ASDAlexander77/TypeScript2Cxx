	class Scene {
}

	class Node1 {                                          
            public _scene: Scene;                               
                                                                
            constructor(scene: Scene) {                         
                this._scene = scene;                            
            }                                                   
                                                                
            public set parent(v) {                              
            }                                                   
        }                                                       
                                                                
        class Camera extends Node1 {                            
            constructor(scene: Scene) {                         
                super(null);                                    
            }                                                   
        }                                                       
                                                                
        let c = new Camera(new Scene());                                  
        console.log("Run");
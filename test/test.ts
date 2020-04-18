    class Node1 {                                      
        public _scene: Scene;                               
                                                            
        constructor(scene: Scene) {                         
            this._scene = scene;                            
        }                                                   
                                                            
        public getScene(): Scene {                          
            return this._scene;                             
        }                                                   
                                                            
        public get parent(): any {                          
            return 1;                                       
        }                                                   
                                                            
        public set parent(v) {                              
        }                                                   
    }                                                       
                                                            
    abstract class AbstractScene {                          
    }                                                       
                                                            
    class Scene extends AbstractScene {                     
        private cameras =[];                                
                                                            
        public addCamera(newCamera: Camera): void {         
            this.cameras[1] = newCamera;                    
        }                                                   
                                                            
        public get parent(): any {                          
            return 1;                                       
        }                                                   
                                                            
        public set parent(v) {                              
        }                                                   
    }                                                       
                                                            
    class Camera extends Node1 {                            
        constructor(scene: Scene) {                         
            super(scene);                                   
            this.getScene().addCamera(this);                
        }                                                   
                                                            
        public get parent(): any {                          
            return 1;                                       
        }                                                   
    }                                                       
                                                            
    let s = new Scene();                                    
    let c = new Camera(s);                                  
    console.log("Run"); 
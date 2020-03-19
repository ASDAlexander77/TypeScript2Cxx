	class Vector3 {                                    
            constructor(                                    
                public x: number = 0,                       
                public y: number = 0,                       
                public z: number = 0                        
            ) {                                             
            }                                               
                                                            
            public static Zero(): Vector3 {                 
                return new Vector3(0.0, 0.0, 0.0);          
            }                                               
        }                                                   
                                                            
        class Matrix {                                      
            public static LookAtLHToRef(eye: Vector3, target: Vector3, up: Vector3, view: Matrix): void {
                console.log(up.x);                          
                console.log(up.y);                          
                console.log(up.z);                          
                                                            
                const t = this;                             
            }                                               
        }                                                   
                                                            
        class Camera {                                      
            protected _globalPosition = Vector3.Zero();     
            protected _globalCurrentTarget = Vector3.Zero();
            protected _globalCurrentUpVector = Vector3.Zero();
            protected _view = new Matrix();                 
                                                            
            public _computeViewMatrix(): void {             
                Matrix.LookAtLHToRef(this._globalPosition, this._globalCurrentTarget, this._globalCurrentUpVector, this._view);
            }                                               
        }                                                   
                                                            
        let c = new Camera();                               
        c._computeViewMatrix();
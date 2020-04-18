class Matrix {                                 
        }                                               
                                                        
        class Class1 {                                  
            public _matrix1 = new Matrix();             
            private _name: string;                      
            constructor(name: string, scene: any, setActiveOnSceneIfNoneActive = true) { 
                this._name = name;                      
            }                                           
        }                                               
                                                        
        class Class2 extends Class1 {                   
            public _matrix2 = new Matrix();             
            private val: string;                        
            private val2: number;                       
                                                        
            constructor(name: string, alpha: number, beta: number, radius: number, setActiveOnSceneIfNoneActive = true) { 
                super(name, null);                     
                this.val = name;                        
                this.val2 = alpha;                      
            }                                           
                                                        
            public show() {                             
                console.log(this.val);                  
                console.log(this.val2);                 
            }                                           
        }                                               
                                                        
        var c = new Class2("Hello", 11, 12, 13);        
        c.show();
     class Test {                                           
        private _pointerInput: (p: any, s: any) => void;        
                                                                
        public runTest() {                                      
            this._pointerInput = (p, s) => {                    
                console.log(p.obj);                             
                console.log(s.obj);                             
            };                                                  
                                                                
            this.add(this._pointerInput);                       
        }                                                       
                                                                
        public add(callback: (eventData: any, eventState: any) => void) {   
            callback({ obj: 1 }, { obj: 2});                    
        }                                                       
    }                                                           
                                                                
    const t = new Test();                                       
    t.runTest();       
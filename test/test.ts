        class Person {                                                 
            protected name: string;                                     
            constructor(name: string) { this.Name = name; }             
            public get ElevatorPitch() {                                
                return `Hello, my name is ${this.Name} and I work in ${this.Department}.`;  
            }                                                           
                                                                        
            public get Name() {                                         
                return this.name;                                       
            }                                                           
                                                                        
            public set Name(val: string) {                              
                this.name = val;                                        
            }                                                           
                                                                        
            public get Department(): any;                                    
                                                                        
            public set Department(val: string);                         
        }                                                               
                                                                        
        class Employee extends Person {                                 
            private department: string;                                 
                                                                        
            constructor(name: string, department: string) {             
                super(name);                                            
                this.Department = department;                           
            }                                                           
                                                                        
            public get Department() {                                   
                return this.department;                                 
            }                                                           
                                                                        
            public set Department(val: string) {                        
                this.department = val;                                  
            }                                                           
        }                                                               
                                                                        
        let howard = new Employee("Howard", "Sales");                   
        console.log(howard.ElevatorPitch);
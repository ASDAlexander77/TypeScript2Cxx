	class Employee {                                                   
            _fullName: string;                                              
                                                                            
            get fullName(): string {                                        
                return this._fullName;                                      
            }                                                               
                                                                            
            set fullName(newName: string) {                                 
                this._fullName = newName;                                   
            }                                                               
        }                                                                   
                                                                            
        let employee = new Employee();                                      
        employee.fullName = "Bob Smith";                                    
        console.log(employee.fullName);                                     
        console.log(employee._fullName);
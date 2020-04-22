let a = { obj: "asd", obj2: "value" };     
        delete a.obj;                               
        for (let i in a)                            
        {                                           
            console.log(i);                         
            console.log(a[i]);                      
        }                   
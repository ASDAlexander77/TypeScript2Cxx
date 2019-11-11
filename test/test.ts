	function _x() {                      
            console.log(1);                   
            return 1;                         
        }                                     
        function _y() {                       
            console.log(2);                   
            return 2;                         
        }                                     
                                              
        console.log(!_x() || _x() == 0 ? _x() : _y());    
        console.log(_x() && _x() != 0 ? _x() : _y());     
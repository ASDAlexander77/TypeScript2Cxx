const attached = { type: function() { console.log("works"); } }; 
        for (var cam in attached) {                             
            attached[cam]();                                    
        }
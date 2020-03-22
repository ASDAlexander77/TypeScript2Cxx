	const ok = (<any>1) instanceof Number;      
        console.log(ok ? "true" : "false");         
        const ok1 = (<any>"a") instanceof String;   
        console.log(ok1 ? "true" : "false");        
        const ok2 = (<any>true) instanceof Boolean; 
        console.log(ok2 ? "true" : "false");
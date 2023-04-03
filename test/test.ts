function getNull()
{
	return null;
}	

function getUndef()
{
	return undefined;
}	

	console.log(getNull() == getNull());                                             
        console.log(getUndef() == getNull());                                        
        console.log(getUndef() == getUndef());                                   
        console.log(getNull() != getNull());                                             
        console.log(getUndef() != getNull());                                        
        console.log(getUndef() != getUndef());          
	let deck = {                                                           
            createCardPicker: function() {                                      
                return function() {                                             
                    return {suit: "spades"};                                    
                };                                                              
            }                                                                   
        };                                                                      
                                                                                
        let cardPicker = deck.createCardPicker();                               
        let pickedCard = cardPicker();                                          
                                                                                
        console.log(pickedCard.suit);                                           
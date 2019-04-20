function f(events: { name: string; handler: any; }[]) { 
    console.log(events[0].name);                                              
    if (events[1]) console.log("failed");                                     
}                                                                             
f([{ name: "blur", handler: 1 }]);
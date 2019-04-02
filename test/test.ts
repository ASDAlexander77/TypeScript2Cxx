function push(...objs: any[]) {
    for (const obj of objs) {
        console.log(obj);
    }
}

push(<any>1, <any>2, <any>3);

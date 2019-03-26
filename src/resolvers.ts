import * as ts from 'typescript';

export class IdentifierResolver {

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public getSymbolAtLocation(location: ts.Node): any {
        try {
            return (<any>this.typeChecker).getSymbolAtLocation(location);
        } catch (e) {
        }

        return undefined;
    }

    public getTypeAtLocation(location: ts.Node): any {
        try {
            return (<any>this.typeChecker).getTypeAtLocation(location);
        } catch (e) {
        }

        return undefined;
    }

}

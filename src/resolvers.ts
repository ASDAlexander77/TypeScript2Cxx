import * as ts from 'typescript';
import { Test } from 'mocha';

export class IdentifierResolver {

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public isAnyLikeType(typeInfo: ts.Type): boolean {
        const isAnonymousObject = ((<ts.ObjectType>typeInfo).objectFlags & ts.ObjectFlags.Anonymous) === ts.ObjectFlags.Anonymous;
        return isAnonymousObject || (<any>typeInfo).intrinsicName === 'any';
    }

    public isNotDetected(typeInfo: ts.Type): boolean {
        return !typeInfo || (<any>typeInfo).intrinsicName === 'error';
    }

    public getOrResolveTypeOf(location: ts.Node): ts.Type {
        const type = this.getTypeAtLocation(location);
        if (!type || this.isNotDetected(type)) {
            return this.resolveTypeOf(location);
        }

        return type;
    }

    public getTypeOf(location: ts.Node): ts.Type {
        const type = this.getTypeAtLocation(location);
        return type;
    }

    public getSymbolAtLocation(location: ts.Node): ts.Symbol {
        return this.typeChecker.getSymbolAtLocation(location);
    }

    public getTypeAtLocation(location: ts.Node): ts.Type {
        return this.typeChecker.getTypeAtLocation(location);
    }

    public resolveTypeOf(location: ts.Node): ts.Type {
        if (location.kind !== ts.SyntaxKind.Identifier) {
            // only identifier is accepted
            return undefined;
        }

        // find first node with 'locals'
        let locationWithLocals = location;
        while (locationWithLocals) {
            if ((<any>locationWithLocals).locals) {
                break;
            }

            locationWithLocals = locationWithLocals.parent;
        }

        if (!locationWithLocals) {
            // todo function, method etc can't be found
            return null;
        }

        const resolvedSymbol =
            (<any>this.typeChecker).resolveName((<ts.Identifier>location).text, locationWithLocals, ((1 << 27) - 1));
        if (!resolvedSymbol) {
            return null;
        }

        const typeNode = this.typeChecker.getTypeOfSymbolAtLocation(resolvedSymbol, location);
        return typeNode;
    }

}

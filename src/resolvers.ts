import * as ts from 'typescript';

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

    public getTypeOfSymbolAtLocation(symbol: ts.Symbol, location: ts.Node): ts.Type {
        return this.typeChecker.getTypeOfSymbolAtLocation(symbol, location);
    }

    public resolveTypeOf(location: ts.Node): ts.Type {
        if (location.kind !== ts.SyntaxKind.Identifier) {
            // only identifier is accepted
            return undefined;
        }

        const name = (<ts.Identifier>location).text;
        let resolvedSymbol;

        // find first node with 'locals'
        let locationWithLocals = location;
        while (true) {
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

            resolvedSymbol = (<any>this.typeChecker).resolveName(
                name, locationWithLocals, ((1 << 27) - 1));
            if (!resolvedSymbol) {
                locationWithLocals = locationWithLocals.parent;
                continue;
            }

            break;
        }

        const typeNode = this.typeChecker.getTypeOfSymbolAtLocation(resolvedSymbol, location);
        return typeNode;
    }

    public isLocal(location: ts.Node): boolean {
        if (location.kind !== ts.SyntaxKind.Identifier
            && location.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            // only identifier is accepted
            return undefined;
        }

        const name = (<ts.Identifier>location).text;
        let resolvedSymbol;

        // find first node with 'locals'
        let locationWithLocals = location;
        let level = 0;
        while (true) {
            while (locationWithLocals) {
                if ((<any>locationWithLocals).locals) {
                    if (locationWithLocals.kind === ts.SyntaxKind.FunctionDeclaration
                        || locationWithLocals.kind === ts.SyntaxKind.FunctionExpression
                        || locationWithLocals.kind === ts.SyntaxKind.ArrowFunction
                        || locationWithLocals.kind === ts.SyntaxKind.MethodDeclaration
                        || locationWithLocals.kind === ts.SyntaxKind.ClassDeclaration) {
                        level++;
                    }
                    break;
                }

                locationWithLocals = locationWithLocals.parent;
            }

            if (!locationWithLocals) {
                // todo function, method etc can't be found
                return undefined;
            }

            resolvedSymbol = (<any>locationWithLocals).locals.get(name);
            if (resolvedSymbol) {
                return level <= 1;
            }

            locationWithLocals = locationWithLocals.parent;
        }
    }
}

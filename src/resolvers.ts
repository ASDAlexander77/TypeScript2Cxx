import * as ts from 'typescript';

export class IdentifierResolver {

    public typesAreTheSame(typeReturnIn: ts.TypeNode, functionReturnIn: ts.TypeNode): boolean {
        let typeReturn = typeReturnIn;
        let functionReturn = functionReturnIn;
        if (!typeReturn || !functionReturn) {
            return false;
        }

        if (typeReturn.kind === ts.SyntaxKind.LiteralType) {
            typeReturn = (<any>typeReturn).literal;
        }

        if (functionReturn.kind === ts.SyntaxKind.LiteralType) {
            functionReturn = (<any>functionReturn).literal;
        }

        if ((typeReturn.kind === ts.SyntaxKind.BooleanKeyword && (functionReturn.kind === ts.SyntaxKind.TrueKeyword
                || functionReturn.kind === ts.SyntaxKind.FalseKeyword))
            || (functionReturn.kind === ts.SyntaxKind.BooleanKeyword && (typeReturn.kind === ts.SyntaxKind.TrueKeyword
                || typeReturn.kind === ts.SyntaxKind.FalseKeyword))) {
            return true;
        }

        if ((typeReturn.kind === ts.SyntaxKind.StringKeyword && functionReturn.kind === ts.SyntaxKind.StringLiteral)
            || (functionReturn.kind === ts.SyntaxKind.StringKeyword && typeReturn.kind === ts.SyntaxKind.StringLiteral)) {
            return true;
        }

        if ((typeReturn.kind === ts.SyntaxKind.NumberKeyword && functionReturn.kind === ts.SyntaxKind.NumericLiteral)
            || (functionReturn.kind === ts.SyntaxKind.NumberKeyword && typeReturn.kind === ts.SyntaxKind.NumericLiteral)) {
            return true;
        }

        if (typeReturn.kind !== functionReturn.kind) {
            return false;
        }

        if (typeReturn.kind === ts.SyntaxKind.ArrayType) {
            return this.typesAreTheSame((<any>typeReturn).elementType, (<any>functionReturn).elementType);
        }

        if ((<any>typeReturn).typeName === (<any>functionReturn).typeName) {
            return true;
        }

        return (<any>typeReturn).typeName.text === (<any>functionReturn).typeName.text;
    }

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public isAnyLikeType(typeInfo: ts.Type): boolean {
        if (!typeInfo) {
            return false;
        }

        const isAnonymousObject = ((<ts.ObjectType>typeInfo).objectFlags & ts.ObjectFlags.Anonymous) === ts.ObjectFlags.Anonymous;
        return (isAnonymousObject
            && (!typeInfo.symbol.name || typeInfo.symbol.name === '__type' || typeInfo.symbol.name === '__object'))
            || (<any>typeInfo).intrinsicName === 'any';
    }

    public isTypeFromSymbol(node: ts.Node | ts.Type, kind: ts.SyntaxKind) {
        return node
            && (<any>node).symbol
            && (<any>node).symbol.declarations[0].kind === kind;
    }

    public isThisType(typeInfo: ts.Type): boolean {
        if (!typeInfo) {
            return false;
        }

        if ((<ts.InterfaceType>typeInfo).thisType
            || (<any>typeInfo).isThisType
            || this.isThisType((<any>typeInfo).target)) {
            return true;
        }

        if (typeInfo.symbol && typeInfo.symbol.valueDeclaration) {
            const type = (<any>typeInfo.symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return typeInfo.symbol.name === 'Date' || typeInfo.symbol.name === 'RegExp';
            }
        }

        return false;
    }

    public isArrayType(typeInfo: ts.Type) {
        if (!typeInfo) {
            return false;
        }

        if (typeInfo.symbol && typeInfo.symbol.valueDeclaration) {
            const type = (<any>typeInfo.symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return typeInfo.symbol.name === 'Array';
            }
        }

        return false;
    }

    public isObjectType(typeInfo: ts.Type) {
        if (!typeInfo) {
            return false;
        }

        if (typeInfo.symbol && typeInfo.symbol.valueDeclaration) {
            const type = (<any>typeInfo.symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return typeInfo.symbol.name === 'Object';
            }
        }

        return false;
    }

    public isArrayOrStringType(typeInfo: ts.Type) {
        if (!typeInfo) {
            return false;
        }

        if ((<any>typeInfo).intrinsicName === 'string') {
            return true;
        }

        if (!typeInfo.symbol && (<any>typeInfo).value && typeof((<any>typeInfo).value) === 'string') {
            return true;
        }

        return this.isArrayOrStringTypeFromSymbol(typeInfo.symbol);
    }

    public isArrayOrStringTypeFromSymbol(symbol: ts.Symbol) {
        if (symbol && symbol.valueDeclaration) {
            const type = (<any>symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return symbol.name === 'Array' || symbol.name === 'String';
            }
        }

        return false;
    }

    public isStaticAccess(typeInfo: ts.Type): boolean {
        if (this.isThisType(typeInfo)) {
            return false;
        }

        if (!typeInfo || !typeInfo.symbol || !typeInfo.symbol.valueDeclaration) {
            return false;
        }

        return typeInfo.symbol.valueDeclaration.kind === ts.SyntaxKind.EnumDeclaration
            || typeInfo.symbol.valueDeclaration.kind === ts.SyntaxKind.ClassDeclaration;
    }

    public isNotDetected(typeInfo: ts.Type): boolean {
        return !typeInfo || (<any>typeInfo).intrinsicName === 'error';
    }

    public getOrResolveTypeOfAsTypeNode(location: ts.Node): ts.TypeNode {
        return this.typeToTypeNode(this.getOrResolveTypeOf(location));
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

    public typeToTypeNode(type: ts.Type): ts.TypeNode {
        return this.typeChecker.typeToTypeNode(type);
    }

    public checkTypeAlias(symbol: ts.Symbol): boolean {
        if  (symbol && symbol.declarations[0].kind === ts.SyntaxKind.TypeAliasDeclaration) {
            return true;
        }

        return false;
    }

    public checkImportSpecifier(symbol: ts.Symbol): boolean {
        if  (symbol && symbol.declarations[0].kind === ts.SyntaxKind.ImportSpecifier) {
            return true;
        }

        return false;
    }

    public checkUnionSymbol(symbol: ts.Symbol): boolean {
        if  (symbol && (<any>symbol.declarations[0]).type) {
            return this.checkUnionType((<any>symbol.declarations[0]).type);
        }

        return false;
    }

    public checkUnionType(type: ts.TypeNode): boolean {
        if  (type && type.kind === ts.SyntaxKind.UnionType) {
            const unionType = <ts.UnionTypeNode>(type);
            return unionType.types.filter(f => f.kind !== ts.SyntaxKind.NullKeyword
                && f.kind !== ts.SyntaxKind.UndefinedKeyword).length > 1;
        }

        return false;
    }

    public isTypeAlias(location: ts.Node): boolean {
        if (!location) {
            return undefined;
        }

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

        if  (this.checkTypeAlias(resolvedSymbol)) {
            return true;
        }

        const typeInfo = this.getTypeAtLocation(location);
        if (typeInfo) {
            return this.checkTypeAlias(typeInfo.aliasSymbol);
        }

        return false;
    }

    public isTypeAliasUnionType(location: ts.Node): boolean {
        if (!location) {
            return undefined;
        }

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

        if  (!this.checkTypeAlias(resolvedSymbol) && !this.checkImportSpecifier(resolvedSymbol)) {
            return false;
        }

        const typeInfo = this.getTypeAtLocation(location);
        if (this.checkUnionSymbol(typeInfo.aliasSymbol)) {
            return true;
        }

        return false;
    }

    public isTypeParameter(location: ts.Node): boolean {
        const typeInfo = this.getTypeAtLocation(location);
        if (this.isTypeFromSymbol(typeInfo, ts.SyntaxKind.TypeParameter)) {
            return true;
        }

        return false;
    }

    public resolveTypeOf(location: ts.Node): ts.Type {
        if (!location) {
            return undefined;
        }

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

        try {
            const typeNode = this.typeChecker.getTypeOfSymbolAtLocation(resolvedSymbol, location);
            return typeNode;
        } catch (e) {
        }

        return undefined;
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

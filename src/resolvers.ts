import * as ts from 'typescript';

export class IdentifierResolver {

    private implicitInterfaces = new Map<ts.ClassDeclaration, ts.InterfaceDeclaration[]>();
    private interfaceDeclarations = new Map<ts.SourceFile, ts.InterfaceDeclaration[]>();

    public constructor(private typeChecker: ts.TypeChecker) {
    }

    public getFirstDeclaration(typeInfo: ts.Type): ts.Declaration {
        return  typeInfo && typeInfo.symbol && typeInfo.symbol.declarations[0];
    }

    public getValueDeclaration(typeInfo: ts.Type): ts.Declaration {
        return typeInfo.symbol && typeInfo.symbol.valueDeclaration;
    }

    public getValueDeclarationType(typeInfo: ts.Type) {
        return (<any>this.getValueDeclaration(typeInfo))?.type;
    }

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

    public isAnyLikeType(typeInfo: ts.Type): boolean {
        if (!typeInfo) {
            return false;
        }

        const isAnonymousObject = ((<ts.ObjectType>typeInfo).objectFlags & ts.ObjectFlags.Anonymous) === ts.ObjectFlags.Anonymous;
        return (isAnonymousObject
            && (!typeInfo.symbol.name || typeInfo.symbol.name === '__type' || typeInfo.symbol.name === '__object'))
            || (<any>typeInfo).intrinsicName === 'any';
    }

    // An interface carrying an index signature (`{ [k: string]: string; foo: string }`) describes a
    // dynamic map, and that's what a value of it compiles to - so even its *named* members have to be
    // reached by key, not through the get_x()/set_x() pair a class-shaped interface gets.
    public isDynamicMapInterface(typeInfo: ts.Type): boolean {
        const declaration = typeInfo && typeInfo.symbol && typeInfo.symbol.declarations
            && typeInfo.symbol.declarations[0];
        return !!declaration
            && declaration.kind === ts.SyntaxKind.InterfaceDeclaration
            // the built-in types are interfaces with index signatures too (`Array`, `String`), but they
            // have real runtime counterparts here rather than being dynamic maps
            && !declaration.getSourceFile().isDeclarationFile
            && (<ts.InterfaceDeclaration>declaration).members.some(m => m.kind === ts.SyntaxKind.IndexSignature);
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

        const type = this.getValueDeclarationType(typeInfo);
        if (type && type.kind === ts.SyntaxKind.TypeReference) {
            return typeInfo.symbol.name === 'Date' || typeInfo.symbol.name === 'RegExp';
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

    public isNumberType(typeInfo: ts.Type) {
        if (!typeInfo) {
            return false;
        }

        if ((<any>typeInfo).intrinsicName === 'number') {
            return true;
        }

        if (!typeInfo.symbol && (<any>typeInfo).value !== undefined && typeof((<any>typeInfo).value) === 'number') {
            return true;
        }

        return this.isNumberTypeFromSymbol(typeInfo.symbol);
    }

    public isNumberTypeFromSymbol(symbol: ts.Symbol) {
        if (symbol && symbol.valueDeclaration) {
            const type = (<any>symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return symbol.name === 'Number';
            }
        }

        return false;
    }

    public isStringType(typeInfo: ts.Type) {
        if (!typeInfo) {
            return false;
        }

        if ((<any>typeInfo).intrinsicName === 'string') {
            return true;
        }

        if (!typeInfo.symbol && (<any>typeInfo).value && typeof((<any>typeInfo).value) === 'string') {
            return true;
        }

        return this.isStringTypeFromSymbol(typeInfo.symbol);
    }

    public isStringTypeFromSymbol(symbol: ts.Symbol) {
        if (symbol && symbol.valueDeclaration) {
            const type = (<any>symbol.valueDeclaration).type;
            if (type && type.kind === ts.SyntaxKind.TypeReference) {
                return symbol.name === 'String';
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

    // finds an explicit return type declared on a same-named member of a base class/interface, so an
    // overriding method's return type can be emitted covariantly instead of defaulting to a mismatched type
    public getBaseMemberReturnTypeNode(method: ts.MethodDeclaration, depth: number = 0): ts.TypeNode {
        const classDeclaration = method.parent as ts.ClassDeclaration;
        if (method.name.kind !== ts.SyntaxKind.Identifier || depth > 16) {
            return undefined;
        }

        const methodName = (<ts.Identifier>method.name).text;
        const implicitMember = this.findImplicitInterfaceMethod(classDeclaration, methodName);
        if (implicitMember && implicitMember.type) {
            return implicitMember.type;
        }

        if (!classDeclaration.heritageClauses) {
            return undefined;
        }

        for (const heritageClause of classDeclaration.heritageClauses) {
            for (const typeExpression of heritageClause.types) {
                const baseType = this.typeChecker.getTypeAtLocation(typeExpression);
                const property = baseType && baseType.getProperty(methodName);
                const declaration = property && property.valueDeclaration;
                if (declaration
                    && (declaration.kind === ts.SyntaxKind.MethodDeclaration
                        || declaration.kind === ts.SyntaxKind.MethodSignature)) {
                    const declaredType = (<ts.MethodDeclaration | ts.MethodSignature>declaration).type;
                    if (declaredType) {
                        return declaredType;
                    }

                    // The base member can be un-annotated itself and still take its type from further up -
                    // `class B extends A` where A's method gets its return type from an interface A
                    // implements. Without following that, B's override would default to `any` and no longer
                    // match A's signature (C++ requires the return types to agree).
                    if (declaration.kind === ts.SyntaxKind.MethodDeclaration && declaration !== method) {
                        const inheritedType = this.getBaseMemberReturnTypeNode(
                            <ts.MethodDeclaration>declaration, depth + 1);
                        if (inheritedType) {
                            return inheritedType;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    // TS interfaces are satisfied structurally - a class needs no `implements` clause to be usable where
    // the interface is expected. C++ has no such notion: a shared_ptr<A> only converts to shared_ptr<IFoo>
    // if A actually derives from IFoo. So work out which of the interfaces declared alongside a class it
    // satisfies structurally, and let the emitter add those as bases, as if `implements` had been written.
    public getImplicitInterfaces(classDeclaration: ts.ClassDeclaration): ts.InterfaceDeclaration[] {
        const cached = this.implicitInterfaces.get(classDeclaration);
        if (cached) {
            return cached;
        }

        const result: ts.InterfaceDeclaration[] = [];
        // stored before the work below so a re-entrant lookup (a class satisfying an interface that
        // mentions the class) sees an empty list rather than recursing
        this.implicitInterfaces.set(classDeclaration, result);

        // A class that already declares any heritage is left alone. Its own `implements` clauses are
        // handled the normal way, and adding an interface base to a class that already extends another
        // class would bring in a second `js::object` base - every inherited member access then becomes
        // ambiguous.
        if (classDeclaration.kind !== ts.SyntaxKind.ClassDeclaration
            || !classDeclaration.name
            || classDeclaration.heritageClauses && classDeclaration.heritageClauses.length > 0) {
            return result;
        }

        const classSymbol = classDeclaration.name && this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        if (!classSymbol) {
            return result;
        }

        const classType = this.typeChecker.getDeclaredTypeOfSymbol(classSymbol);
        const isAssignableTo = (<any>this.typeChecker).isTypeAssignableTo;
        if (!classType || typeof isAssignableTo !== 'function') {
            return result;
        }

        for (const interfaceDeclaration of this.collectInterfaceDeclarations(classDeclaration.getSourceFile())) {
            // An interface with an index signature is a dynamic map at runtime here, not a class shape,
            // and a call-signature-only one is a function type - neither is expressible as a base class.
            if (interfaceDeclaration.members.length === 0
                || interfaceDeclaration.members.some(m => m.kind === ts.SyntaxKind.IndexSignature
                    || m.kind === ts.SyntaxKind.CallSignature
                    || m.kind === ts.SyntaxKind.ConstructSignature)) {
                continue;
            }

            // Declarations are emitted in source order, and a base class has to be complete at that
            // point - an interface written after the class can't be one of its bases.
            if (interfaceDeclaration.getStart() > classDeclaration.getStart()) {
                continue;
            }

            const interfaceSymbol = this.typeChecker.getSymbolAtLocation(interfaceDeclaration.name);
            const interfaceType = interfaceSymbol && this.typeChecker.getDeclaredTypeOfSymbol(interfaceSymbol);
            if (interfaceType && isAssignableTo.call(this.typeChecker, classType, interfaceType)) {
                result.push(interfaceDeclaration);
            }
        }

        return result;
    }

    private collectInterfaceDeclarations(sourceFile: ts.SourceFile): ts.InterfaceDeclaration[] {
        const cached = this.interfaceDeclarations.get(sourceFile);
        if (cached) {
            return cached;
        }

        const declarations: ts.InterfaceDeclaration[] = [];
        const visit = (node: ts.Node) => {
            if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
                declarations.push(<ts.InterfaceDeclaration>node);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        this.interfaceDeclarations.set(sourceFile, declarations);
        return declarations;
    }

    // The parameter list a class method has to present in C++ to actually override the base/interface
    // member of the same name. TS allows an implementing method to declare *fewer* parameters than the
    // signature it satisfies; C++ treats that as an unrelated function, leaving the class abstract.
    public findImplicitInterfaceMethod(classDeclaration: ts.ClassDeclaration, methodName: string): ts.MethodSignature {
        if (classDeclaration.kind !== ts.SyntaxKind.ClassDeclaration) {
            return undefined;
        }

        for (const interfaceDeclaration of this.getImplicitInterfaces(classDeclaration)) {
            for (const member of interfaceDeclaration.members) {
                if (member.kind === ts.SyntaxKind.MethodSignature
                    && member.name.kind === ts.SyntaxKind.Identifier
                    && (<ts.Identifier>member.name).text === methodName) {
                    return <ts.MethodSignature>member;
                }
            }
        }

        return undefined;
    }

    public getBaseMemberParameters(method: ts.MethodDeclaration): ts.NodeArray<ts.ParameterDeclaration> {
        const classDeclaration = method.parent as ts.ClassDeclaration;
        if (method.name.kind !== ts.SyntaxKind.Identifier) {
            return undefined;
        }

        const methodName = (<ts.Identifier>method.name).text;
        const implicitMember = this.findImplicitInterfaceMethod(classDeclaration, methodName);
        if (implicitMember) {
            return implicitMember.parameters;
        }

        if (!classDeclaration.heritageClauses) {
            return undefined;
        }

        for (const heritageClause of classDeclaration.heritageClauses) {
            for (const typeExpression of heritageClause.types) {
                const baseType = this.typeChecker.getTypeAtLocation(typeExpression);
                const property = baseType && baseType.getProperty(methodName);
                const declaration = property && property.valueDeclaration;
                if (declaration
                    && (declaration.kind === ts.SyntaxKind.MethodDeclaration
                        || declaration.kind === ts.SyntaxKind.MethodSignature)) {
                    return (<ts.MethodDeclaration | ts.MethodSignature>declaration).parameters;
                }
            }
        }

        return undefined;
    }

    // collects the property/method signatures declared directly on the interfaces a class `implements`
    // (single level - does not follow interfaces that themselves extend other interfaces), so the emitter
    // can detect members the class must satisfy but implemented via a different C++ member kind than the
    // interface uses (e.g. a plain field implementing an interface method, or a method implementing an
    // interface property)
    public getImplementedInterfaceMembers(classDeclaration: ts.ClassDeclaration): Array<ts.PropertySignature | ts.MethodSignature> {
        const members: Array<ts.PropertySignature | ts.MethodSignature> = [];

        const collectFrom = (interfaceDeclaration: ts.InterfaceDeclaration) => {
            for (const member of interfaceDeclaration.members) {
                if (member.kind === ts.SyntaxKind.PropertySignature || member.kind === ts.SyntaxKind.MethodSignature) {
                    members.push(<ts.PropertySignature | ts.MethodSignature>member);
                }
            }
        };

        // interfaces the class satisfies structurally count the same as declared ones - the emitter gives
        // them the same C++ base-class treatment (see getImplicitInterfaces)
        this.getImplicitInterfaces(classDeclaration).forEach(collectFrom);

        if (!classDeclaration.heritageClauses) {
            return members;
        }

        for (const heritageClause of classDeclaration.heritageClauses) {
            if (heritageClause.token !== ts.SyntaxKind.ImplementsKeyword) {
                continue;
            }

            for (const typeExpression of heritageClause.types) {
                const baseType = this.typeChecker.getTypeAtLocation(typeExpression);
                const baseDeclaration = baseType && baseType.symbol && baseType.symbol.declarations
                    && baseType.symbol.declarations[0];
                if (baseDeclaration && baseDeclaration.kind === ts.SyntaxKind.InterfaceDeclaration) {
                    for (const member of (<ts.InterfaceDeclaration>baseDeclaration).members) {
                        if (member.kind === ts.SyntaxKind.PropertySignature || member.kind === ts.SyntaxKind.MethodSignature) {
                            members.push(<ts.PropertySignature | ts.MethodSignature>member);
                        }
                    }
                }
            }
        }

        return members;
    }

    // a class can implement an interface *method* (`xyz(): number`) via a property or get-accessor of
    // function type instead of an actual method - that member's name then collides with the virtual
    // override the class must also provide (C++ cannot have a field and a method share a name), so the
    // emitter needs to know to rename the field/route accesses differently. Returns the interface's method
    // signature when `member` is that kind of stand-in, otherwise undefined.
    public getInterfaceMethodSignatureForProperty(
        member: ts.PropertyDeclaration | ts.GetAccessorDeclaration): ts.MethodSignature {
        const classDeclaration = member.parent as ts.ClassDeclaration;
        if (member.name.kind !== ts.SyntaxKind.Identifier) {
            return undefined;
        }

        const memberName = (<ts.Identifier>member.name).text;
        for (const interfaceMember of this.getImplementedInterfaceMembers(classDeclaration)) {
            if (interfaceMember.kind === ts.SyntaxKind.MethodSignature
                && interfaceMember.name.kind === ts.SyntaxKind.Identifier
                && (<ts.Identifier>interfaceMember.name).text === memberName) {
                return <ts.MethodSignature>interfaceMember;
            }
        }

        return undefined;
    }

    // a get-accessor implementing an interface property (`get abc() { ... }` implementing `abc: number`)
    // naturally overrides that property's synthesized `get_abc()` (see processInterfacePropertySignature) -
    // but only if its return type actually matches the interface's declared property type, since an
    // un-annotated accessor otherwise defaults to `any`. Returns that property type when `accessor` is such
    // a case, otherwise undefined. Deliberately does NOT match a MethodSignature of the same name - a
    // get-accessor implementing an interface *method* returns a callable, not the method's own return type
    // (see getInterfaceMethodSignatureForProperty), so it must keep defaulting to `any`.
    public getInterfacePropertyTypeForAccessor(accessor: ts.GetAccessorDeclaration): ts.TypeNode {
        const classDeclaration = accessor.parent as ts.ClassDeclaration;
        if (classDeclaration.kind !== ts.SyntaxKind.ClassDeclaration
            || accessor.name.kind !== ts.SyntaxKind.Identifier) {
            return undefined;
        }

        const memberName = (<ts.Identifier>accessor.name).text;
        for (const interfaceMember of this.getImplementedInterfaceMembers(classDeclaration)) {
            if (interfaceMember.kind === ts.SyntaxKind.PropertySignature
                && interfaceMember.name.kind === ts.SyntaxKind.Identifier
                && (<ts.Identifier>interfaceMember.name).text === memberName) {
                return (<ts.PropertySignature>interfaceMember).type;
            }
        }

        return undefined;
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

    public getContextualType(node: ts.Expression): ts.Type {
        return this.typeChecker.getContextualType(node);
    }

    // The single call signature of `type`, or undefined if it isn't a (single-signature) function type.
    // Used to reconcile JS's "any arity goes" function assignability with std::function's exact arity.
    public getSingleCallSignature(type: ts.Type): ts.Signature {
        const signatures = type && type.getCallSignatures();
        return signatures && signatures.length === 1 ? signatures[0] : undefined;
    }

    public getCallSignatureParameters(type: ts.Type): ts.Symbol[] {
        const signature = this.getSingleCallSignature(type);
        return signature ? signature.getParameters() : undefined;
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
        let resolvedSymbol = this.resolveNameFromLocals(location);

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

        let resolvedSymbol = this.resolveNameFromLocals(location);

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

        let resolvedSymbol = this.resolveNameFromLocals(location);

        if (this.checkImportSpecifier(resolvedSymbol)) {
            /* todo: finish it */
            return undefined;
        }

        try {
            return this.typeChecker.getTypeOfSymbolAtLocation(resolvedSymbol, location);
        } catch (e) {
        }

        return undefined;
    }

    public resolveNameFromLocals(location: ts.Node): ts.Symbol {

        let resolvedSymbol: ts.Symbol;

        const name = (<ts.Identifier>location).text;

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

        return resolvedSymbol;
    }

    public isLocal(location: ts.Node): [boolean, any] {
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
                    resolvedSymbol = (<any>locationWithLocals).locals.get(name);
                    if (resolvedSymbol) {
                        break;
                    }

                    if (locationWithLocals.kind === ts.SyntaxKind.FunctionDeclaration
                        || locationWithLocals.kind === ts.SyntaxKind.FunctionExpression
                        || locationWithLocals.kind === ts.SyntaxKind.ArrowFunction
                        || locationWithLocals.kind === ts.SyntaxKind.MethodDeclaration
                        || locationWithLocals.kind === ts.SyntaxKind.ClassDeclaration) {
                        level++;
                    }
                }

                locationWithLocals = locationWithLocals.parent;
            }

            if (resolvedSymbol) {
                return [resolvedSymbol.valueDeclaration ? level === 0 : undefined, resolvedSymbol];
            }

            if (!locationWithLocals) {
                // todo function, method etc can't be found
                return undefined;
            }

            locationWithLocals = locationWithLocals.parent;
        }
    }
}

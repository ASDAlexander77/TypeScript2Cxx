import * as ts from 'typescript';
import { FunctionContext } from './contexts';
import { Ops, OpMode, OpCodes, LuaTypes } from './opcodes';

export enum ResolvedKind {
    // up values
    Upvalue,
    // const
    Const,
    // registers
    Register,
    // to support methods load
    LoadGlobalMember,
    // load array element
    LoadElement,
    // to support loading closures
    Closure
}

export class ResolvedInfo {
    public kind: ResolvedKind;
    public value: any;
    public identifierName: string;
    public memberInfo: ResolvedInfo;
    public objectInfo: ResolvedInfo;
    public register: number;
    public constIndex: number;
    public upvalueIndex: number;
    public protoIndex: number;
    public upvalueInstack: boolean;
    public upvalueStackIndex: number;
    public originalInfo: ResolvedInfo;
    public isTypeReference: boolean;
    public isDeclareVar: boolean;
    public isGlobalReference: boolean;
    public declarationInfo: any;
    // TODO: use chainPop instead
    public popRequired: boolean;
    public chainPop: ResolvedInfo;
    public hasPopChain: boolean;
    public poppedValues: number;

    public constructor(private functionContext: FunctionContext) {
    }

    public isLocal(): boolean {
        return this.kind === ResolvedKind.Register
            && this.register !== undefined
            && this.functionContext.isRegisterLocal(this.register);
    }

    public isEmptyRegister(): boolean {
        return this.kind === ResolvedKind.Register && this.register === undefined;
    }

    public isThis(): boolean {
        return this.kind === ResolvedKind.Register && this.register === 0 && this.identifierName === 'this';
    }

    public ensureConstIndex(): number {
        if (this.kind !== ResolvedKind.Const) {
            throw new Error('It is not Const');
        }

        if (this.constIndex !== undefined) {
            return this.constIndex;
        }

        if (this.value === undefined && this.identifierName === undefined) {
            throw new Error('Value is undefined or IdentifierName to create Const');
        }

        return this.constIndex = -this.functionContext.findOrCreateConst(this.value !== undefined ? this.value : this.identifierName);
    }

    public ensureUpvalueIndex(): number {
        if (this.kind !== ResolvedKind.Upvalue) {
            throw new Error('It is not Upvalue');
        }

        if (this.upvalueIndex !== undefined) {
            return this.upvalueIndex;
        }

        return this.upvalueIndex = this.functionContext.findOrCreateUpvalue(
            this.identifierName, this.upvalueInstack, this.upvalueStackIndex);
    }

    public canUseIndex(): boolean {
        if (this.kind === ResolvedKind.Register) {
            return true;
        }

        if (this.kind === ResolvedKind.Upvalue) {
            this.ensureUpvalueIndex();
            return this.upvalueIndex >= 0 && this.upvalueIndex <= 255;
        }

        if (this.kind === ResolvedKind.Closure) {
            return true;
        }

        if (this.kind === ResolvedKind.Const) {
            this.ensureConstIndex();
            return this.constIndex >= -255 && this.constIndex <= -1;
        }

        throw new Error('It is not register or const index');
    }

    public getRegisterOrIndex(): number {
        if (this.kind === ResolvedKind.Register) {
            return this.register;
        }

        if (this.kind === ResolvedKind.Upvalue) {
            return this.ensureUpvalueIndex();
        }

        if (this.kind === ResolvedKind.Closure) {
            return this.protoIndex;
        }

        if (this.kind === ResolvedKind.Const) {
            return this.ensureConstIndex();
        }

        throw new Error('It is not register or const index');
    }

    public getRegister(): number {
        if (this.kind === ResolvedKind.Register) {
            if (this.register > 255) {
                throw new Error('Register is out of scope');
            }

            return this.register;
        }

        throw new Error('It is not register or const index');
    }

    public getUpvalue(): number {
        if (this.kind === ResolvedKind.Upvalue) {
            return this.ensureUpvalueIndex();
        }

        throw new Error('It is not upvalue');
    }

    public getProto(): number {
        if (this.kind === ResolvedKind.Closure) {
            return this.protoIndex;
        }

        throw new Error('It is not Closure');
    }

    public collapseConst(skip?: boolean): ResolvedInfo {
        if (skip) {
            return this;
        }

        if (this.kind !== ResolvedKind.Register) {
            return this;
        }

        if (this.functionContext.code.length === 0) {
            return this;
        }

        // we need to suppres redundant LOADK & MOVES
        const opCodes = this.functionContext.code.latest;
        if (opCodes[0] === Ops.LOADK) {
            // ASD: this code is working with big const values as well
            this.kind = ResolvedKind.Const;
            this.constIndex = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }

        return this;
    }

    public optimize(skip?: boolean): ResolvedInfo {
        // TODO: finish optimization for code
        // let x;
        // x = ~ 5;
        // console.log(x);

        // TODO: finish optimization for logic operations
        /*
        if (skip) {
            return this;
        }

        if (this.kind !== ResolvedKind.Register) {
            return this;
        }

        if (this.functionContext.code.length === 0) {
            return this;
        }

        // we need to suppres redundant LOADK & MOVES
        const opCodes = this.functionContext.code.latest;
        if (opCodes[0] === Ops.LOADK) {
            this.kind = ResolvedKind.Const;
            this.constIndex = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }

        if (opCodes[0] === Ops.MOVE && opCodes[1] === this.register) {
            this.register = opCodes[2];
            // remove optimized code
            this.functionContext.code.pop();
            return this;
        }
        */

        return this;
    }
}

export class StackResolver {
    private stack: ResolvedInfo[] = [];

    public constructor(private functionContext: FunctionContext) {
    }

    public push(item: ResolvedInfo) {
        if (!item) {
            throw new Error('Item is not defined');
        }

        this.stack.push(item);
    }

    public pop(): ResolvedInfo {
        const stackItem = this.stack.pop();
        this.functionContext.popRegister(stackItem);

        stackItem.poppedValues = 1;
        while (this.stack.length > 0 && stackItem === this.peek().chainPop) {
            this.pop();
            stackItem.poppedValues++;
        }

        return stackItem;
    }

    public peek(): ResolvedInfo {
        return this.stack[this.stack.length - 1];
    }

    public peekSkip(skip: number): ResolvedInfo {
        return this.stack[this.stack.length - 1 + skip];
    }

    public getLength(): any {
        return this.stack.length;
    }
}

export class ScopeContext {
    private scope: any[] = [];

    public push(item: any) {
        if (!item) {
            throw new Error('Item is not defined');
        }

        this.scope.push(item);
    }

    public pop(): any {
        return this.scope.pop();
    }

    public peek(index?: number): any {
        return this.scope[index ? index : this.scope.length - 1];
    }

    public getLength(): any {
        return this.scope.length;
    }

    public any(): boolean {
        return this.scope.length > 0;
    }
}

export class IdentifierResolver {

    public Scope: ScopeContext = new ScopeContext();

    public constructor(private typeChecker: ts.TypeChecker, private varAsLet: boolean) {
    }

    private unresolvedFilter = {
        'undefined': true, '__instanceof': true, '__get_call__': true, '__set_call__': true, '__get_static_call__': true,
        '__set_static_call__': true, '__type': true, '___type': true,
        '__wrapper': true, '__bind': true, '__apply': true, '__call': true,
        'getmetatable': true, 'setmetatable': true, 'debug': true, 'type': true, 'error': true, 'require': true,
        'exports': true, 'math': true, 'table': true, 'tostring': true, 'tonumber': true, 'rawset': true, 'rawget': true,
        'StringHelper': true, 'NumberHelper': true, 'string': true, 'number': true, 'coroutine': true, 'dofile': true,
        '__null_holder': true, '__get_call_undefined__': true, '__set_call_undefined__': true, '__get_undefined__': true,
        '__set_undefined__': true, '_ENV': true, '_G': true, '__decorate': true, '__tostring': true, '__hasOwnProperty': true
    };

    private skipResolvingFilter = {
        'undefined': true, '__set_call_undefined__': true
    };

    public methodCall: boolean;
    public thisMethodCall: ResolvedInfo;
    public prefixPostfix: boolean;

    public thisClassName: ts.Identifier;
    public thisClassType: ts.Node;
    public superClass: ts.Identifier;

    private methodCalls: Array<any> = [];

    public pushAndSetMethodCallInfo() {
        this.methodCalls.push({ methodCall: this.methodCall, thisMethodCall: this.thisMethodCall });
        this.methodCall = true;
        this.thisMethodCall = null;
    }

    public clearMethodCallInfo() {
        this.methodCall = false;
        this.thisMethodCall = null;
    }

    public popMethodCallInfo() {
        const state = this.methodCalls.pop();
        this.methodCall = state.methodCall;
        this.thisMethodCall = state.thisMethodCall;
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

    public resolver(identifier: ts.Identifier, functionContext: FunctionContext): ResolvedInfo {
        let resolved;
        const isFakeName = identifier.text.charAt(0) === '<';

        if (this.Scope.any()) {
            const resolveInfo = this.Scope.peek() as ResolvedInfo;
            if (resolveInfo && resolveInfo.originalInfo && resolveInfo.originalInfo.declarationInfo && !isFakeName) {
                const varDecl = resolveInfo.originalInfo.declarationInfo;
                if (varDecl.members) {
                    for (const memberDecl of varDecl.members) {
                        if (memberDecl.name && memberDecl.name.text === identifier.text) {
                            // found
                            resolved = memberDecl;
                            break;
                        }
                    }
                }

                if (!resolved) {
                    try {
                        resolved = (<any>this.typeChecker).resolveName(
                            identifier.text,
                            varDecl,
                            ((1 << 27) - 1)/*mask for all types*/);
                    } catch (e) {
                    }
                }
            }
        } else {
            try {
                if (!resolved && !(identifier.text in this.skipResolvingFilter) && functionContext.current_location_node && !isFakeName) {
                    resolved = (<any>this.typeChecker).resolveName(
                        identifier.text,
                        functionContext.current_location_node,
                        ((1 << 27) - 1)/*mask for all types*/);
                }
            } catch (e) {
            }

            try {
                if (!resolved
                    && !(identifier.text in this.skipResolvingFilter)
                    && functionContext.function_or_file_location_node
                    && !isFakeName) {
                    let originLocation = functionContext.function_or_file_location_node;
                    if ((<any>originLocation).__origin) {
                        originLocation = (<any>originLocation).__origin;
                    }

                    resolved = (<any>this.typeChecker).resolveName(
                        identifier.text,
                        originLocation,
                        ((1 << 27) - 1)/*mask for all types*/);
                }
            } catch (e) {
                console.warn('Can\'t resolve "' + identifier.text + '"');
            }

            if (!resolved
                && functionContext.current_location_node
                && functionContext.current_location_node.kind === ts.SyntaxKind.ClassDeclaration
                && !isFakeName) {
                // 1 find constructor
                const constuctorMember = (<ts.ClassDeclaration>functionContext.current_location_node)
                    .members.find(m => m.kind === ts.SyntaxKind.Constructor);
                if (constuctorMember) {
                    resolved = (<any>this.typeChecker).resolveName(
                        identifier.text,
                        constuctorMember,
                        ((1 << 27) - 1)/*mask for all types*/);
                }
            }
        }

        if (resolved) {
            let declaration = resolved.valueDeclaration
                    || (resolved.declarations && resolved.declarations.length > 0
                        ? resolved.declarations[0]
                        : undefined);
            if (!declaration) {
                if (resolved.name === 'arguments') {
                    return this.resolveMemberOfCurrentScope('arg', functionContext);
                }

                declaration = resolved;
            }

            const isDeclareVar =
                declaration && declaration.kind === ts.SyntaxKind.VariableDeclaration
                && declaration.parent && declaration.parent.kind === ts.SyntaxKind.VariableDeclarationList
                && declaration.parent.parent && declaration.parent.parent.kind === ts.SyntaxKind.VariableStatement
                && declaration.parent.parent.modifiers
                && declaration.parent.parent.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)
                && declaration.type.kind === ts.SyntaxKind.AnyKeyword;

            const kind: ts.SyntaxKind = <ts.SyntaxKind>declaration.kind;
            switch (kind) {
                case ts.SyntaxKind.VariableDeclaration:
                    const type = (resolved.valueDeclaration || resolved.exportSymbol.valueDeclaration).type;
                    // can be keyward to 'string'
                    const isAny = type && type.kind === ts.SyntaxKind.AnyKeyword;
                    // values are not the same as Node.Flags
                    let varInfo;
                    if ((resolved.flags & 1) === 1) {

                        if (this.varAsLet && !isDeclareVar) {
                            varInfo = this.returnLocalOrUpvalueNoException(identifier.text, functionContext);
                            if (varInfo) {
                                return varInfo;
                            }
                        }

                        varInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                        varInfo.isTypeReference = isAny || type && type.kind === ts.SyntaxKind.TypeReference;
                        varInfo.isDeclareVar = isDeclareVar;
                        varInfo.isGlobalReference = false;
                        return varInfo;
                    } else if ((resolved.flags & 2) === 2) {
                        varInfo = this.returnLocalOrUpvalueNoException(identifier.text, functionContext);
                        if (varInfo) {
                            return varInfo;
                        }

                        varInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                        varInfo.isTypeReference = isAny || type && type.kind === ts.SyntaxKind.TypeReference;
                        varInfo.isDeclareVar = isDeclareVar;
                        varInfo.isGlobalReference = false;
                        return varInfo;
                    } else {
                        if (this.varAsLet && !isDeclareVar) {
                            varInfo = this.returnLocalOrUpvalueNoException(identifier.text, functionContext);
                            if (varInfo) {
                                return varInfo;
                            }
                        }

                        // when variable declared in Module
                        varInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                        return varInfo;
                    }

                    break;

                case ts.SyntaxKind.Parameter:
                    return this.returnLocalOrUpvalue(identifier.text, functionContext);

                case ts.SyntaxKind.FunctionDeclaration:
                    const funcInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    funcInfo.isGlobalReference = false;
                    return funcInfo;

                case ts.SyntaxKind.EnumDeclaration:
                    const enumInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    enumInfo.isTypeReference = true;
                    enumInfo.isDeclareVar = isDeclareVar;
                    enumInfo.declarationInfo = declaration;
                    enumInfo.isGlobalReference = false;
                    return enumInfo;

                case ts.SyntaxKind.ClassDeclaration:
                    const classInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    classInfo.isTypeReference = true;
                    classInfo.isDeclareVar = isDeclareVar;
                    classInfo.declarationInfo = declaration;
                    classInfo.isGlobalReference = false;
                    return classInfo;

                case ts.SyntaxKind.ModuleDeclaration:
                    const moduleInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    moduleInfo.isTypeReference = true;
                    moduleInfo.isDeclareVar = isDeclareVar;
                    moduleInfo.declarationInfo = declaration;
                    moduleInfo.isGlobalReference = false;
                    return moduleInfo;

                case ts.SyntaxKind.MethodDeclaration:
                    const methodInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    methodInfo.declarationInfo = declaration;
                    methodInfo.isGlobalReference = false;
                    return methodInfo;

                case ts.SyntaxKind.PropertyDeclaration:
                    const propertyInfo = this.resolveMemberOfCurrentScope(identifier.text, functionContext);
                    propertyInfo.declarationInfo = declaration;
                    propertyInfo.isGlobalReference = false;
                    return propertyInfo;
            }
        }

        // default: local, upvalues
        if (this.Scope.any()) {
            return this.resolveMemberOfCurrentScope(identifier.text, functionContext);
        }

        const localObj = this.returnLocalOrUpvalueNoException(identifier.text, functionContext);
        if (localObj) {
            return localObj;
        }

        if (!(identifier.text in this.unresolvedFilter)) {
            if (/\_UP\d+/.test(identifier.text)) {
                throw new Error('Could not resolve technical variable to support function var scope');
            }

            console.warn('Could not resolve: ' + identifier.text);
        }

        // default
        return this.resolveMemberOfCurrentScope(identifier.text, functionContext);
    }

    public returnConst(value: any, functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Const;
        resolvedInfo.value = value;
        resolvedInfo.ensureConstIndex();
        return resolvedInfo;
    }

    public returnIdentifier(identifier: string, functionContext: FunctionContext): ResolvedInfo {
        const identifierInfo = new ResolvedInfo(functionContext);
        identifierInfo.kind = ResolvedKind.Const;
        identifierInfo.identifierName = identifier;
        identifierInfo.ensureConstIndex();
        return identifierInfo;
    }

    public returnLocal(text: string, functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Register;
        resolvedInfo.identifierName = text;
        resolvedInfo.register = functionContext.findLocal(resolvedInfo.identifierName);
        return resolvedInfo;
    }

    public returnThis(functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Register;
        resolvedInfo.identifierName = 'this';
        resolvedInfo.register = 0;
        resolvedInfo.isTypeReference = false; // if we set it to TRUE it will be treated as static method access
        resolvedInfo.declarationInfo = this.thisClassType;
        return resolvedInfo;
    }

    public returnThisUpvalue(functionContext: FunctionContext): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.identifierName = 'this';
        resolvedInfo.upvalueInstack = functionContext.container ? !functionContext.container.thisInUpvalue : true;
        resolvedInfo.upvalueStackIndex = 0;
        return resolvedInfo;
    }

    public createEnv(functionContext: FunctionContext) {
        const resolvedInfo = new ResolvedInfo(functionContext);
        resolvedInfo.kind = ResolvedKind.Upvalue;
        resolvedInfo.identifierName = '_ENV';
        resolvedInfo.upvalueInstack = true;
        resolvedInfo.ensureUpvalueIndex();
    }

    public returnResolvedEnv(functionContext: FunctionContext): ResolvedInfo {
        return this.returnLocalOrUpvalue('_ENV', functionContext);
    }

    public returnUpvalue(text: string, functionContext: FunctionContext): ResolvedInfo {
        if (functionContext.container) {
            const identifierResolvedInfo = this.returnLocalOrUpvalueNoException(text, functionContext.container);
            if (!identifierResolvedInfo) {
                return identifierResolvedInfo;
            }

            if (identifierResolvedInfo.kind === ResolvedKind.Register
                && identifierResolvedInfo.isLocal) {
                const resolvedInfo = new ResolvedInfo(functionContext);
                resolvedInfo.kind = ResolvedKind.Upvalue;
                resolvedInfo.identifierName = text;
                resolvedInfo.upvalueInstack = true;
                resolvedInfo.upvalueStackIndex = identifierResolvedInfo.register;
                return resolvedInfo;
            }

            if (identifierResolvedInfo.kind === ResolvedKind.Upvalue) {
                identifierResolvedInfo.ensureUpvalueIndex();
                const resolvedInfo = new ResolvedInfo(functionContext);
                resolvedInfo.kind = ResolvedKind.Upvalue;
                resolvedInfo.identifierName = text;
                resolvedInfo.upvalueInstack = false;
                resolvedInfo.upvalueStackIndex = identifierResolvedInfo.upvalueIndex;
                return resolvedInfo;
            }
        }

        return null;
    }

    public returnLocalOrUpvalueNoException(text: string, functionContext: FunctionContext): ResolvedInfo {
        const localVarIndex = functionContext.findLocal(text, true);
        if (localVarIndex !== -1) {
            const resolvedInfo = new ResolvedInfo(functionContext);
            resolvedInfo.kind = ResolvedKind.Register;
            resolvedInfo.identifierName = text;
            resolvedInfo.register = localVarIndex;
            return resolvedInfo;
        }

        const upvalueIndex = functionContext.findUpvalue(text, true);
        if (upvalueIndex !== -1) {
            const resolvedInfo = new ResolvedInfo(functionContext);
            resolvedInfo.kind = ResolvedKind.Upvalue;
            resolvedInfo.identifierName = text;
            resolvedInfo.upvalueIndex = upvalueIndex;
            resolvedInfo.upvalueStackIndex = functionContext.upvalues[upvalueIndex].index;
            resolvedInfo.upvalueInstack = functionContext.upvalues[upvalueIndex].instack;
            return resolvedInfo;
        }

        return this.returnUpvalue(text, functionContext);
    }

    public returnLocalOrUpvalue(text: string, functionContext: FunctionContext): ResolvedInfo {
        const result = this.returnLocalOrUpvalueNoException(text, functionContext);
        if (result) {
            return result;
        }

        throw new Error('Could not find variable');
    }

    private resolveMemberOfCurrentScope(identifier: string, functionContext: FunctionContext): ResolvedInfo {
        if (!this.Scope.any()) {
            const objectInfo = this.returnResolvedEnv(functionContext);
            const methodInfo = this.returnIdentifier(identifier, functionContext);

            const loadMemberInfo = new ResolvedInfo(functionContext);
            loadMemberInfo.kind = ResolvedKind.LoadGlobalMember;
            loadMemberInfo.objectInfo = objectInfo;
            loadMemberInfo.memberInfo = methodInfo;
            loadMemberInfo.isGlobalReference = true;
            return loadMemberInfo;
        }

        const identifierName = identifier;
        const finalResolvedInfo = new ResolvedInfo(functionContext);
        finalResolvedInfo.kind = ResolvedKind.Const;
        finalResolvedInfo.identifierName = identifierName;
        finalResolvedInfo.ensureConstIndex();
        return finalResolvedInfo;
    }
}

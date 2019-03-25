import * as ts from 'typescript';
import { ResolvedInfo, ResolvedKind, StackResolver } from './resolvers';
import { Ops, OpMode, OpCodes } from './opcodes';
import { SourceMapGenerator } from 'source-map';
import { Helpers } from './helpers';

class LocalVarInfo {
    public name: string;
    public register: number;
    public fake: boolean;
    public debugStartCode: number;
    public debugEndCode: number;
}

export class UpvalueInfo {
    public name: string;
    public instack: boolean;
    public index: number;
}

class BaseStorage<T> {
    private items: T[] = [];

    public constructor(private functionContext: FunctionContext) {
    }

    public push(item: T) {
        this.items.push(item);
    }

    public pop(): T {
        return this.items.pop();
    }

    public get length(): number {
        return this.items.length;
    }

    public get latest(): T {
        return this.items[this.items.length - 1];
    }

    public forEach(action: (element) => void) {
        this.items.forEach(action);
    }

    public at(index: number): T {
        return this.items[index];
    }

    public setCodeAt(index: number, item: T) {
        this.items[index] = item;
    }
}

export class CodeStorage {
    private code: number[][] = [];
    private currentDebugFileName: string;
    private currentDebugLine: number;

    public constructor(private functionContext: FunctionContext) {
        this.currentDebugLine = 0;
    }

    public push(opCode: number[]) {
        this.code.push(opCode);
        opCode[4] = this.currentDebugLine;

        // DEBUG
        const latest = opCode;
        if (latest[0] === Ops.GETTABUP || latest[0] === Ops.GETUPVAL || latest[0] === Ops.SETUPVAL) {
            if (latest[2] >= this.functionContext.upvalues.length) {
                throw new Error('Upvalue does not exist');
            }

            if (!this.functionContext.container && latest[2] > 0) {
                throw new Error('Upvalue does not exist');
            }
        }

        if (latest[0] === Ops.SETTABUP) {
            if (latest[1] >= this.functionContext.upvalues.length) {
                throw new Error('Upvalue does not exist');
            }

            if (!this.functionContext.container && latest[1] > 0) {
                throw new Error('Upvalue does not exist');
            }
        }

        if (latest[0] === Ops.LOADK) {
            if (latest[2] >= this.functionContext.constants.length) {
                throw new Error('Const does not exist');
            }
        }

        const opCodeMode: OpMode = OpCodes[latest[0]];
        const encoded = opCodeMode.encode(latest);
    }

    public pop(): number[] {
        return this.code.pop();
    }

    public get length(): number {
        return this.code.length;
    }

    public get latest(): number[] {
        return this.code[this.code.length - 1];
    }

    public forEach(action: (element) => void) {
        this.code.forEach(action);
    }

    public codeAt(index: number): number[] {
        return this.code[index];
    }

    public setCodeAt(index: number, opCode: number[]) {
        this.code[index] = opCode;
    }

    public setNodeToTrackDebugInfo(node: ts.Node, sourceMapGenerator: SourceMapGenerator) {
        if ((<any>node).__origin) {
            node = (<any>node).__origin;
        }

        if (!node) {
            throw new Error('Node is null');
        }

        if (node.pos <= 0) {
            return;
        }

        const file = node.getSourceFile();
        if (!file) {
            return;
        }

        this.currentDebugFileName = file.fileName;
        const locStart = (<any>ts).getLineAndCharacterOfPosition(file, node.getStart(node.getSourceFile()));

        if (sourceMapGenerator) {
            const debugLine = this.currentDebugLine = ++((<any>sourceMapGenerator).__lastDebugLine);
            sourceMapGenerator.addMapping({
                generated: {
                  line: debugLine,
                  column: 0
                },
                source: Helpers.getSubPath(Helpers.cleanUpPath(file.fileName), (<any>sourceMapGenerator)._sourceRoot),
                original: {
                  line: locStart.line + 1,
                  column: locStart.column ? locStart.column + 1 : 0
                },
                name: undefined
            });
        } else {
            // default line location
            this.currentDebugLine = locStart.line + 1;
        }
    }

    public getDebugLine(): string {
        return this.currentDebugFileName + ':' + this.currentDebugLine;
    }
}

export class NamespaceStorage extends BaseStorage<ts.ModuleDeclaration> {
}

class Scope {
    public isFile: boolean;
    public isModule: boolean;
    public isClass: boolean;
    public isFunction: boolean;
    public Name: string;

    constructor(name: string) {
        this.Name = name;
    }
}

export class FunctionContext {
    public function_or_file_location_node: ts.Node;
    public current_location_node: ts.Node;
    // if undefined == "_ENV"
    public container: FunctionContext;
    // to track current register(stack)
    public availableRegister = 0;
    // stack resolver
    public stack = new StackResolver(this);
    // code stack
    public code = new CodeStorage(this);
    // namespace scopes
    public namespaces = new NamespaceStorage(this);
    public environmentCreated: boolean;

    // function information
    public debug_location: string;
    public linedefined: number;
    public lastlinedefined: number;
    public numparams: number;
    public is_vararg: boolean;
    public maxstacksize = 1; // register 0/1 at least
    public constants: Array<any> = [];
    public locals: Array<LocalVarInfo> = [];
    public debug_locals: Array<LocalVarInfo> = [];
    public upvalues: Array<UpvalueInfo> = [];
    public protos: Array<FunctionContext> = [];
    public breaks: Array<number> = [];
    public continues: Array<number> = [];
    public local_scopes: Array<any> = [];
    public location_scopes: Array<any> = [];
    // to support break, continue in loops
    public breaks_scopes: Array<any> = [];
    public continues_scopes: Array<any> = [];
    public scope: Scope = new Scope('<root>');
    public scope_scopes: Array<any> = [];
    public thisInUpvalue: boolean;
    public isStatic: boolean;
    public isFinalReturnAdded: boolean;

    public has_var_declaration: boolean;
    public has_var_declaration_done: boolean;

    public newLocalScope(node: ts.Node) {
        this.location_scopes.push(this.current_location_node);
        this.current_location_node = node;

        this.local_scopes.push(this.locals);
        this.locals = [];
    }

    public restoreLocalScope() {
        this.debugInfoMarkEndOfScopeForLocals();

        if (this.locals && this.locals.length > 0) {
            const minRegister = Math.min(...this.locals.filter(l => !l.fake).map(l => l.register));
            if (minRegister >= 0 && minRegister < Infinity) {
                this.availableRegister = minRegister;
            }
        }

        this.locals = this.local_scopes.pop();
        this.current_location_node = this.location_scopes.pop();
    }

    public newBreakContinueScope() {
        this.breaks_scopes.push(this.breaks);
        this.continues_scopes.push(this.continues);
        this.breaks = [];
        this.continues = [];
    }

    public restoreBreakContinueScope() {
        if (this.breaks.length > 0) {
            throw new Error('Breaks are not resolved');
        }

        if (this.continues.length > 0) {
            throw new Error('Continues are not resolved');
        }

        this.breaks = this.breaks_scopes.pop();
        this.continues = this.continues_scopes.pop();
    }

    public newScope(name: string) {
        this.scope_scopes.push(this.scope);
        this.scope = new Scope(name);
    }

    public newFileScope(name: string) {
        this.newScope(name);
        this.scope.isFile = true;
    }

    public newModuleScope(name: string) {
        this.newScope(name);
        this.scope.isModule = true;
    }

    public newClassScope(name: string) {
        this.newScope(name);
        this.scope.isClass = true;
    }

    public newFunctionScope(name: string) {
        this.newScope(name);
        this.scope.isFunction = true;
    }

    public restoreScope() {
        this.scope = this.scope_scopes.pop();
    }

    public debugInfoMarkEndOfScopeForLocals() {
        this.locals.forEach(l => {
            if (!l.debugEndCode) {
                l.debugEndCode = this.code.length;
            }
        });

        for (const item of this.locals) {
            this.debug_locals.unshift(item);
        }
    }

    public findOrCreateUpvalue(name: string, instack: boolean, indexInStack?: number): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1) {
            this.upvalues.push({ name, instack: instack, index: indexInStack });
            return this.upvalues.length - 1;
        }

        return index;
    }

    public createUpvalue(name: string, instack: boolean): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1) {
            this.upvalues.push({ name, instack: false || instack, index: undefined });
            return this.upvalues.length - 1;
        }

        throw new Error('Upvalue:' + name + 'exists');
    }

    public findUpvalue(name: string, noerror?: boolean): number {
        // upvalues start with 0
        const index = this.upvalues.findIndex(e => e.name === name);
        if (index === -1 && !noerror) {
            throw new Error('Item can\'t be found');
        }

        return index;
    }

    public createParam(name: string): ResolvedInfo {
        return this.createLocal(name, undefined, true);
    }

    public createLocal(name: string, predefinedRegisterInfo?: ResolvedInfo, param?: boolean): ResolvedInfo {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            const registerInfo = predefinedRegisterInfo ? predefinedRegisterInfo : this.useRegister();
            this.locals.push(<LocalVarInfo>{
                name: name,
                register: registerInfo.getRegister(),
                fake: predefinedRegisterInfo ? true : false,
                debugStartCode: this.code.length - (param ? 1 : 0)
            });
            return registerInfo;
        }

        throw new Error('Local already created.');
    }

    public findScopedLocal(name: string, noerror?: boolean): number {
        // locals start with 0
        const index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {
            if (noerror) {
                return index;
            }

            throw new Error('Can\'t find local: ' + name);
        }

        return this.locals[index].register;
    }

    public findLocalInfo(name: string, noerror?: boolean): LocalVarInfo {
        // locals start with 0
        let index = this.locals.findIndex(e => e.name === name);
        if (index === -1) {

            // try to find it in other scopes
            for (let i = this.local_scopes.length - 1; i >= 0; i--) {
                index = this.local_scopes[i].findIndex(e => e.name === name);
                if (index !== -1) {
                    return this.local_scopes[i][index];
                }
            }

            if (noerror) {
                return undefined;
            }

            throw new Error('Can\'t find local: ' + name);
        }

        return this.locals[index];
    }

    public findLocal(name: string, noerror?: boolean): number {
        const localInfo = this.findLocalInfo(name, noerror);
        if (localInfo) {
            return localInfo.register;
        }

        return -1;
    }

    public isRegisterLocal(register: number): boolean {
        // locals start with 0
        let index = this.locals.findIndex(e => !e.fake && e.register === register);
        if (index === -1) {

            // try to find it in other scopes
            for (let i = this.local_scopes.length - 1; i >= 0; i--) {
                index = this.local_scopes[i].findIndex(e => !e.fake && e.register === register);
                if (index !== -1) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    public findOrCreateConst(value: any): number {
        // consts start with 1
        const index = this.constants.findIndex(e => e === value);
        if (index === -1) {
            this.constants.push(value);
            return this.constants.length;
        }

        return index + 1;
    }

    public createProto(value: FunctionContext): number {
        // consts start with 1
        this.protos.push(value);
        return this.protos.length - 1;
    }

    public useRegister(): ResolvedInfo {
        const resolvedInfo = new ResolvedInfo(this);
        resolvedInfo.kind = ResolvedKind.Register;
        const ret = resolvedInfo.register = this.availableRegister++;
        if (ret > this.maxstacksize) {
            this.maxstacksize = ret;
        }

        if (this.maxstacksize > 255) {
            throw new Error('Registers exeeded');
        }

        return resolvedInfo;
    }

    public useRegisterAndPush(): ResolvedInfo {
        const resolvedInfo = this.useRegister();
        this.stack.push(resolvedInfo);
        return resolvedInfo;
    }

    public popRegister(resolvedInfo: ResolvedInfo): void {
        if (!resolvedInfo) {
            throw new Error('resolvedInfo is null');
        }

        if (resolvedInfo.kind === ResolvedKind.Register && resolvedInfo.register !== undefined && !resolvedInfo.isLocal()) {
            if ((this.availableRegister - resolvedInfo.getRegister()) > 1) {
                throw new Error('available register and restored register are to far (> 1)');
            }

            this.availableRegister = resolvedInfo.getRegister();
        }
    }
}

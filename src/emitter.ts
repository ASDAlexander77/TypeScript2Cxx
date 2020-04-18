import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { Helpers } from './helpers';
import { Preprocessor } from './preprocessor';
import { CodeWriter } from './codewriter';

export class Emitter {
    public writer: CodeWriter;
    private resolver: IdentifierResolver;
    private preprocessor: Preprocessor;
    private sourceFileName: string;
    private scope: Array<ts.Node> = new Array<ts.Node>();
    private opsMap: Map<number, string> = new Map<number, string>();

    public constructor(
        typeChecker: ts.TypeChecker, private options: ts.CompilerOptions,
        private cmdLineOptions: any, private singleModule: boolean, private rootFolder?: string) {

        this.writer = new CodeWriter();
        this.resolver = new IdentifierResolver(typeChecker);
        this.preprocessor = new Preprocessor(this.resolver, this);

        this.opsMap[ts.SyntaxKind.EqualsToken] = '=';
        this.opsMap[ts.SyntaxKind.PlusToken] = '+';
        this.opsMap[ts.SyntaxKind.MinusToken] = '-';
        this.opsMap[ts.SyntaxKind.AsteriskToken] = '*';
        this.opsMap[ts.SyntaxKind.PercentToken] = '%';
        this.opsMap[ts.SyntaxKind.AsteriskAsteriskToken] = '__std::pow';
        this.opsMap[ts.SyntaxKind.SlashToken] = '/';
        this.opsMap[ts.SyntaxKind.AmpersandToken] = '__std::bit_and()';
        this.opsMap[ts.SyntaxKind.BarToken] = '__std::bit_or()';
        this.opsMap[ts.SyntaxKind.CaretToken] = '__std::bit_xor()';
        this.opsMap[ts.SyntaxKind.LessThanLessThanToken] = '__bitwise::lshift';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanToken] = '__bitwise::rshift';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken] = '__bitwise::rshift_nosign';
        this.opsMap[ts.SyntaxKind.EqualsEqualsToken] = '__Equals';
        this.opsMap[ts.SyntaxKind.EqualsEqualsEqualsToken] = '==';
        this.opsMap[ts.SyntaxKind.LessThanToken] = '<';
        this.opsMap[ts.SyntaxKind.LessThanEqualsToken] = '<=';
        this.opsMap[ts.SyntaxKind.ExclamationEqualsToken] = '__NotEquals';
        this.opsMap[ts.SyntaxKind.ExclamationEqualsEqualsToken] = '!=';
        this.opsMap[ts.SyntaxKind.GreaterThanToken] = '>';
        this.opsMap[ts.SyntaxKind.GreaterThanEqualsToken] = '>=';

        this.opsMap[ts.SyntaxKind.PlusEqualsToken] = '+=';
        this.opsMap[ts.SyntaxKind.MinusEqualsToken] = '-=';
        this.opsMap[ts.SyntaxKind.AsteriskEqualsToken] = '*=';
        this.opsMap[ts.SyntaxKind.PercentEqualsToken] = '%=';
        this.opsMap[ts.SyntaxKind.AsteriskAsteriskEqualsToken] = '**=';
        this.opsMap[ts.SyntaxKind.SlashEqualsToken] = '/=';
        this.opsMap[ts.SyntaxKind.AmpersandEqualsToken] = '&=';
        this.opsMap[ts.SyntaxKind.BarEqualsToken] = '|=';
        this.opsMap[ts.SyntaxKind.CaretEqualsToken] = '^=';
        this.opsMap[ts.SyntaxKind.LessThanLessThanEqualsToken] = '<<=';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanEqualsToken] = '>>=';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken] = '__StrictNotEqualsAssign';

        this.opsMap[ts.SyntaxKind.TildeToken] = '__std::bit_not()';
        this.opsMap[ts.SyntaxKind.ExclamationToken] = '!';
        this.opsMap[ts.SyntaxKind.PlusPlusToken] = '++';
        this.opsMap[ts.SyntaxKind.MinusMinusToken] = '--';
        this.opsMap[ts.SyntaxKind.InKeyword] = '__IN';

        this.opsMap[ts.SyntaxKind.AmpersandAmpersandToken] = '__AND';
        this.opsMap[ts.SyntaxKind.BarBarToken] = '__OR';

        this.opsMap[ts.SyntaxKind.CommaToken] = ',';
    }

    public HeaderMode: boolean;
    public SourceMode: boolean;

    public isHeader() {
        return this.HeaderMode;
    }

    public isSource() {
        return this.SourceMode;
    }

    public isHeaderWithSource() {
        return (this.HeaderMode && this.SourceMode) || (!this.HeaderMode && !this.SourceMode);
    }

    public get isGlobalScope() {
        return this.scope.length > 0 && this.scope[this.scope.length - 1].kind === ts.SyntaxKind.SourceFile;
    }

    public printNode(node: ts.Statement): string {
        const sourceFile = ts.createSourceFile(
            'noname', '', ts.ScriptTarget.ES2018, /*setParentNodes */ true, ts.ScriptKind.TS);

        (<any>sourceFile.statements) = [node];

        // debug output
        const emitter = ts.createPrinter({
            newLine: ts.NewLineKind.LineFeed,
        });

        const result = emitter.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile);
        return result;
    }

    public processNode(node: ts.Node): void {
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile:
                this.processFile(<ts.SourceFile>node);
                break;
            case ts.SyntaxKind.Bundle:
                this.processBundle(<ts.Bundle>node);
                break;
            case ts.SyntaxKind.UnparsedSource:
                this.processUnparsedSource(<ts.UnparsedSource>node);
                break;
            default:
                // TODO: finish it
                throw new Error('Method not implemented.');
        }
    }

    private isDeclarationStatement(f: ts.Statement | ts.Declaration): boolean {
        if (f.kind === ts.SyntaxKind.FunctionDeclaration
            || f.kind === ts.SyntaxKind.EnumDeclaration
            || f.kind === ts.SyntaxKind.ClassDeclaration
            || f.kind === ts.SyntaxKind.InterfaceDeclaration
            || f.kind === ts.SyntaxKind.ModuleDeclaration
            || f.kind === ts.SyntaxKind.NamespaceExportDeclaration
            || f.kind === ts.SyntaxKind.ImportDeclaration
            || f.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            return true;
        }

        return false;
    }

    private isVariableStatement(f: ts.Node): boolean {
        if (f.kind === ts.SyntaxKind.VariableStatement) {
            return true;
        }

        return false;
    }

    private processFile(sourceFile: ts.SourceFile): void {
        this.scope.push(sourceFile);
        this.processFileInternal(sourceFile);
        this.scope.pop();
    }

    private processFileInternal(sourceFile: ts.SourceFile): void {
        this.fixupParentReferences(sourceFile);

        this.sourceFileName = sourceFile.fileName;


        if (this.isHeader()) {
            // added header
            this.WriteHeader();

            const position = this.writer.newSection();

            sourceFile.statements.filter(s => this.isDeclarationStatement(s)).forEach(s => {
                this.processInclude(s);
            });

            sourceFile.statements.filter(s => this.isDeclarationStatement(s)).forEach(s => {
                this.processForwardDeclaration(s);
            });

            if (this.writer.hasAnyContent(position)) {
                this.writer.writeStringNewLine();
            }

            sourceFile.statements
                .map(v => this.preprocessor.preprocessStatement(v))
                .filter(s => this.isDeclarationStatement(s) && s.kind !== ts.SyntaxKind.EnumDeclaration || this.isVariableStatement(s))
                .forEach(s => {
                    if (this.isVariableStatement(s)) {
                        this.processForwardDeclaration(s);
                    } else {
                        this.processStatement(s);
                    }
                });

            sourceFile.statements.filter(s => this.isDeclarationStatement(s) || this.isVariableStatement(s)).forEach(s => {
                this.processImplementation(s, true);
            });
        }

        if (this.isSource()) {
            // added header
            this.WriteHeader();

            sourceFile.statements.filter(s => this.isDeclarationStatement(s)).forEach(s => {
                this.processImplementation(s);
            });

            const positionBeforeVars = this.writer.newSection();

            sourceFile.statements
                .map(v => this.preprocessor.preprocessStatement(v))
                .filter(s => this.isVariableStatement(s))
                .forEach(s => {
                    this.processStatement(<ts.Statement>s);
                });

            const hasVarsContent = this.writer.hasAnyContent(positionBeforeVars);

            const rollbackPosition = this.writer.newSection();

            this.writer.writeStringNewLine('');
            this.writer.writeStringNewLine('void Main(void)');
            this.writer.BeginBlock();

            const position = this.writer.newSection();

            sourceFile.statements.filter(s => !this.isDeclarationStatement(s) && !this.isVariableStatement(s)).forEach(s => {
                this.processStatement(s);
            });

            if (hasVarsContent || this.writer.hasAnyContent(position, rollbackPosition)) {
                this.writer.EndBlock();

                this.writer.writeStringNewLine('');
                this.writer.writeStringNewLine('MAIN');
            }
        }

        if (this.isHeader()) {
            // end of header
            this.writer.writeStringNewLine(`#endif`);
        }
    }

    private WriteHeader() {
        const filePath = Helpers.getSubPath(Helpers.cleanUpPath(this.sourceFileName), Helpers.cleanUpPath(this.rootFolder));
        if (this.isSource()) {
            this.writer.writeStringNewLine(`#include "${filePath.replace(/\.ts$/, '.h')}"`);
        } else {
            const headerName = filePath.replace(/\.ts$/, '_h').replace(/[\\\/\.]/g, '_').toUpperCase();
            this.writer.writeStringNewLine(`#ifndef ${headerName}`);
            this.writer.writeStringNewLine(`#define ${headerName}`);
            this.writer.writeStringNewLine(`#include "core.h"`);
        }

        this.writer.writeStringNewLine('');
        this.writer.writeStringNewLine('using namespace js;');
        this.writer.writeStringNewLine('');
    }

    private processBundle(bundle: ts.Bundle): void {
        throw new Error('Method not implemented.');
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void {
        throw new Error('Method not implemented.');
    }

    private processStatement(node: ts.Statement | ts.Declaration): void {
        this.processStatementInternal(node);
    }

    private processStatementInternal(nodeIn: ts.Statement | ts.Declaration, enableTypeAliases = false): void {
        const node = this.preprocessor.preprocessStatement(nodeIn);

        switch (node.kind) {
            case ts.SyntaxKind.EmptyStatement: return;
            case ts.SyntaxKind.VariableStatement: this.processVariableStatement(<ts.VariableStatement>node); return;
            case ts.SyntaxKind.FunctionDeclaration: this.processFunctionDeclaration(<ts.FunctionDeclaration>node); return;
            case ts.SyntaxKind.Block: this.processBlock(<ts.Block>node); return;
            case ts.SyntaxKind.ModuleBlock: this.processModuleBlock(<ts.ModuleBlock>node); return;
            case ts.SyntaxKind.ReturnStatement: this.processReturnStatement(<ts.ReturnStatement>node); return;
            case ts.SyntaxKind.IfStatement: this.processIfStatement(<ts.IfStatement>node); return;
            case ts.SyntaxKind.DoStatement: this.processDoStatement(<ts.DoStatement>node); return;
            case ts.SyntaxKind.WhileStatement: this.processWhileStatement(<ts.WhileStatement>node); return;
            case ts.SyntaxKind.ForStatement: this.processForStatement(<ts.ForStatement>node); return;
            case ts.SyntaxKind.ForInStatement: this.processForInStatement(<ts.ForInStatement>node); return;
            case ts.SyntaxKind.ForOfStatement: this.processForOfStatement(<ts.ForOfStatement>node); return;
            case ts.SyntaxKind.BreakStatement: this.processBreakStatement(<ts.BreakStatement>node); return;
            case ts.SyntaxKind.ContinueStatement: this.processContinueStatement(<ts.ContinueStatement>node); return;
            case ts.SyntaxKind.SwitchStatement: this.processSwitchStatement(<ts.SwitchStatement>node); return;
            case ts.SyntaxKind.ExpressionStatement: this.processExpressionStatement(<ts.ExpressionStatement>node); return;
            case ts.SyntaxKind.TryStatement: this.processTryStatement(<ts.TryStatement>node); return;
            case ts.SyntaxKind.ThrowStatement: this.processThrowStatement(<ts.ThrowStatement>node); return;
            case ts.SyntaxKind.DebuggerStatement: this.processDebuggerStatement(<ts.DebuggerStatement>node); return;
            case ts.SyntaxKind.EnumDeclaration: this.processEnumDeclaration(<ts.EnumDeclaration>node); return;
            case ts.SyntaxKind.ClassDeclaration: this.processClassDeclaration(<ts.ClassDeclaration>node); return;
            case ts.SyntaxKind.InterfaceDeclaration: this.processClassDeclaration(<ts.InterfaceDeclaration>node); return;
            case ts.SyntaxKind.ExportDeclaration: this.processExportDeclaration(<ts.ExportDeclaration>node); return;
            case ts.SyntaxKind.ModuleDeclaration: this.processModuleDeclaration(<ts.ModuleDeclaration>node); return;
            case ts.SyntaxKind.NamespaceExportDeclaration: this.processNamespaceDeclaration(<ts.NamespaceDeclaration>node); return;
            case ts.SyntaxKind.ImportDeclaration:
                /*done in forward declaration*/ /*this.processImportDeclaration(<ts.ImportDeclaration>node);*/ return;
            case ts.SyntaxKind.TypeAliasDeclaration:
                /*done in forward Declaration*/
                if (enableTypeAliases) {
                    this.processTypeAliasDeclaration(<ts.TypeAliasDeclaration>node);
                }

                return;
            case ts.SyntaxKind.ExportAssignment: /*nothing to do*/ return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpression(nodeIn: ts.Expression): void {
        const node = this.preprocessor.preprocessExpression(nodeIn);
        if (!node) {
            return;
        }

        // we need to process it for statements only
        //// this.functionContext.code.setNodeToTrackDebugInfo(node, this.sourceMapGenerator);

        switch (node.kind) {
            case ts.SyntaxKind.NewExpression: this.processNewExpression(<ts.NewExpression>node); return;
            case ts.SyntaxKind.CallExpression: this.processCallExpression(<ts.CallExpression>node); return;
            case ts.SyntaxKind.PropertyAccessExpression: this.processPropertyAccessExpression(<ts.PropertyAccessExpression>node); return;
            case ts.SyntaxKind.PrefixUnaryExpression: this.processPrefixUnaryExpression(<ts.PrefixUnaryExpression>node); return;
            case ts.SyntaxKind.PostfixUnaryExpression: this.processPostfixUnaryExpression(<ts.PostfixUnaryExpression>node); return;
            case ts.SyntaxKind.BinaryExpression: this.processBinaryExpression(<ts.BinaryExpression>node); return;
            case ts.SyntaxKind.ConditionalExpression: this.processConditionalExpression(<ts.ConditionalExpression>node); return;
            case ts.SyntaxKind.DeleteExpression: this.processDeleteExpression(<ts.DeleteExpression>node); return;
            case ts.SyntaxKind.TypeOfExpression: this.processTypeOfExpression(<ts.TypeOfExpression>node); return;
            case ts.SyntaxKind.FunctionExpression: this.processFunctionExpression(<ts.FunctionExpression>node); return;
            case ts.SyntaxKind.ArrowFunction: this.processArrowFunction(<ts.ArrowFunction>node); return;
            case ts.SyntaxKind.ElementAccessExpression: this.processElementAccessExpression(<ts.ElementAccessExpression>node); return;
            case ts.SyntaxKind.ParenthesizedExpression: this.processParenthesizedExpression(<ts.ParenthesizedExpression>node); return;
            case ts.SyntaxKind.TypeAssertionExpression: this.processTypeAssertionExpression(<ts.TypeAssertion>node); return;
            case ts.SyntaxKind.VariableDeclarationList: this.processVariableDeclarationList(<ts.VariableDeclarationList><any>node); return;
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword: this.processBooleanLiteral(<ts.BooleanLiteral>node); return;
            case ts.SyntaxKind.NullKeyword: this.processNullLiteral(<ts.NullLiteral>node); return;
            case ts.SyntaxKind.NumericLiteral: this.processNumericLiteral(<ts.NumericLiteral>node); return;
            case ts.SyntaxKind.StringLiteral: this.processStringLiteral(<ts.StringLiteral>node); return;
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                this.processNoSubstitutionTemplateLiteral(<ts.NoSubstitutionTemplateLiteral>node); return;
            case ts.SyntaxKind.ObjectLiteralExpression: this.processObjectLiteralExpression(<ts.ObjectLiteralExpression>node); return;
            case ts.SyntaxKind.TemplateExpression: this.processTemplateExpression(<ts.TemplateExpression>node); return;
            case ts.SyntaxKind.ArrayLiteralExpression: this.processArrayLiteralExpression(<ts.ArrayLiteralExpression>node); return;
            case ts.SyntaxKind.RegularExpressionLiteral: this.processRegularExpressionLiteral(<ts.RegularExpressionLiteral>node); return;
            case ts.SyntaxKind.ThisKeyword: this.processThisExpression(<ts.ThisExpression>node); return;
            case ts.SyntaxKind.SuperKeyword: this.processSuperExpression(<ts.SuperExpression>node); return;
            case ts.SyntaxKind.VoidExpression: this.processVoidExpression(<ts.VoidExpression>node); return;
            case ts.SyntaxKind.NonNullExpression: this.processNonNullExpression(<ts.NonNullExpression>node); return;
            case ts.SyntaxKind.AsExpression: this.processAsExpression(<ts.AsExpression>node); return;
            case ts.SyntaxKind.SpreadElement: this.processSpreadElement(<ts.SpreadElement>node); return;
            case ts.SyntaxKind.AwaitExpression: this.processAwaitExpression(<ts.AwaitExpression>node); return;
            case ts.SyntaxKind.Identifier: this.processIdentifier(<ts.Identifier>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processDeclaration(node: ts.Declaration): void {
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature: this.processPropertyDeclaration(<ts.PropertySignature>node); return;
            case ts.SyntaxKind.PropertyDeclaration: this.processPropertyDeclaration(<ts.PropertyDeclaration>node); return;
            case ts.SyntaxKind.Parameter: this.processPropertyDeclaration(<ts.ParameterDeclaration>node); return;
            case ts.SyntaxKind.MethodSignature: this.processMethodDeclaration(<ts.MethodSignature>node); return;
            case ts.SyntaxKind.MethodDeclaration: this.processMethodDeclaration(<ts.MethodDeclaration>node); return;
            case ts.SyntaxKind.ConstructSignature: this.processMethodDeclaration(<ts.ConstructorDeclaration>node); return;
            case ts.SyntaxKind.Constructor: this.processMethodDeclaration(<ts.ConstructorDeclaration>node); return;
            case ts.SyntaxKind.SetAccessor: this.processMethodDeclaration(<ts.MethodDeclaration>node); return;
            case ts.SyntaxKind.GetAccessor: this.processMethodDeclaration(<ts.MethodDeclaration>node); return;
            case ts.SyntaxKind.FunctionDeclaration: this.processFunctionDeclaration(<ts.FunctionDeclaration>node); return;
            case ts.SyntaxKind.IndexSignature: /*TODO: index*/ return;
            case ts.SyntaxKind.SemicolonClassElement: /*TODO: index*/ return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processInclude(nodeIn: ts.Declaration | ts.Statement): void {

        const node = this.preprocessor.preprocessStatement(<ts.Statement>nodeIn);

        switch (node.kind) {
            case ts.SyntaxKind.TypeAliasDeclaration: this.processTypeAliasDeclaration(<ts.TypeAliasDeclaration>node); return;
            case ts.SyntaxKind.ImportDeclaration: this.processImportDeclaration(<ts.ImportDeclaration>node); return;
            default:
                return;
        }
    }

    private processForwardDeclaration(nodeIn: ts.Declaration | ts.Statement): void {

        const node = this.preprocessor.preprocessStatement(<ts.Statement>nodeIn);

        switch (node.kind) {
            case ts.SyntaxKind.VariableStatement: this.processVariablesForwardDeclaration(<ts.VariableStatement>node); return;
            case ts.SyntaxKind.ClassDeclaration: this.processClassForwardDeclaration(<ts.ClassDeclaration>node); return;
            case ts.SyntaxKind.EnumDeclaration: this.processEnumDeclaration(<ts.EnumDeclaration>node); return;
            default:
                return;
        }
    }

    public isTemplate(declaration:
        ts.MethodDeclaration | ts.ConstructorDeclaration | ts.ClassDeclaration
        | ts.FunctionDeclaration | ts.FunctionExpression) {

        if (declaration.typeParameters && declaration.typeParameters.length > 0) {
            return true;
        }

        if (this.isMethodParamsTemplate(declaration)) {
            return true;
        }

        if (this.isClassMemberDeclaration(declaration)) {
            if (declaration.parent && declaration.parent.kind === ts.SyntaxKind.ClassDeclaration) {
                return this.isTemplate(<any>declaration.parent);
            }
        }

        return false;
    }

    private isTemplateType(effectiveType: any): boolean {
        if (!effectiveType) {
            return false;
        }

        if (effectiveType.kind === ts.SyntaxKind.UnionType) {
            return this.resolver.checkUnionType(effectiveType);
        }

        if (effectiveType.typeName && effectiveType.typeName.text === 'ArrayLike') {
            return true;
        }

        if (effectiveType.typeArguments && effectiveType.typeArguments.length > 0) {
            if (effectiveType.typeArguments.some(t => this.isTemplateType(t))) {
                return true;
            }
        }

        if (effectiveType.kind === ts.SyntaxKind.FunctionType
            && this.resolver.isTypeParameter(effectiveType.type)) {
            return true;
        }

        if (this.resolver.isTypeAliasUnionType(effectiveType.typeName)) {
            return true;
        }
    }

    private isMethodParamsTemplate(declaration: ts.MethodDeclaration | any): boolean {
        if (!declaration) {
            return false;
        }

        // if method has union type, it should be treated as generic method
        if (!this.isClassMemberDeclaration(declaration)
            && declaration.kind !== ts.SyntaxKind.FunctionDeclaration) {
            return false;
        }

        if (this.isTemplateType(declaration.type)) {
            return true;
        }

        for (const element of declaration.parameters) {
            if (element.dotDotDotToken || this.isTemplateType(element.type)) {
                return true;
            }
        }
    }

    private processImplementation(nodeIn: ts.Declaration | ts.Statement, template?: boolean): void {

        const node = this.preprocessor.preprocessStatement(nodeIn);

        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration: this.processClassImplementation(<ts.ClassDeclaration>node, template); return;
            case ts.SyntaxKind.ModuleDeclaration: this.processModuleImplementation(<ts.ModuleDeclaration>node, template); return;
            case ts.SyntaxKind.PropertyDeclaration:
                if (!template && this.isStatic(node)) {
                    this.processPropertyDeclaration(<ts.PropertyDeclaration>node, true);
                }

                return;
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
            case ts.SyntaxKind.FunctionDeclaration:
                if ((template && this.isTemplate(<ts.MethodDeclaration>node))
                    || (!template && !this.isTemplate(<ts.MethodDeclaration>node))) {
                    this.processMethodDeclaration(<ts.MethodDeclaration>node, true);
                }
                return;
            default:
                return;
        }
    }

    private processModuleImplementation(node: ts.ModuleDeclaration, template?: boolean) {
        this.scope.push(node);
        this.processModuleImplementationInternal(node, template);
        this.scope.pop();
    }

    private processModuleImplementationInternal(node: ts.ModuleDeclaration, template?: boolean) {
        this.writer.writeString('namespace ');
        this.writer.writeString(node.name.text);
        this.writer.writeString(' ');
        this.writer.BeginBlock();

        if (node.body.kind === ts.SyntaxKind.ModuleBlock) {
            const block = <ts.ModuleBlock>node.body;
            block.statements.forEach(element => {
                this.processImplementation(element, template);
            });
        } else if (node.body.kind === ts.SyntaxKind.ModuleDeclaration) {
            this.processModuleImplementation(node.body, template);
        } else {
            throw new Error('Not Implemented');
        }

        this.writer.EndBlock();
    }

    private processClassImplementation(node: ts.ClassDeclaration, template?: boolean) {
        this.scope.push(node);
        this.processClassImplementationInternal(node, template);
        this.scope.pop();
    }

    private processClassImplementationInternal(node: ts.ClassDeclaration, template?: boolean) {
        for (const member of node.members) {
            this.processImplementation(member, template);
        }
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void {
        this.processExpression(node.expression);
        this.writer.EndOfStatement();
    }

    private fixupParentReferences<T extends ts.Node>(rootNode: T, setParent?: ts.Node): T {
        let parent: ts.Node = rootNode;
        if (setParent) {
            rootNode.parent = setParent;
        }

        ts.forEachChild(rootNode, visitNode);

        return rootNode;

        function visitNode(n: ts.Node): void {
            // walk down setting parents that differ from the parent we think it should be.  This
            // allows us to quickly bail out of setting parents for sub-trees during incremental
            // parsing
            if (n.parent !== parent) {
                n.parent = parent;

                const saveParent = parent;
                parent = n;
                ts.forEachChild(n, visitNode);

                parent = saveParent;
            }
        }
    }

    private transpileTSNode(node: ts.Node, transformText?: (string) => string) {
        return this.transpileTSCode(node.getFullText(), transformText);
    }

    private transpileTSCode(code: string, transformText?: (string) => string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const result = ts.transpileModule(code, { compilerOptions: opts });

        let jsText = result.outputText;
        if (transformText) {
            jsText = transformText(jsText);
        }

        return this.parseJSCode(jsText);
    }

    private parseTSCode(jsText: string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile(
            this.sourceFileName, jsText, ts.ScriptTarget.ES5, /*setParentNodes */ true, ts.ScriptKind.TS);
        // needed to make typeChecker to work properly
        (<any>ts).bindSourceFile(sourceFile, opts);
        return sourceFile.statements;
    }

    private bind(node: ts.Statement) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile(
            this.sourceFileName, '', ts.ScriptTarget.ES5, /*setParentNodes */ true, ts.ScriptKind.TS);

        (<any>sourceFile.statements) = [node];

        (<any>ts).bindSourceFile(sourceFile, opts);

        return sourceFile.statements[0];
    }

    private parseJSCode(jsText: string) {

        const opts = {
            module: ts.ModuleKind.CommonJS,
            alwaysStrict: false,
            noImplicitUseStrict: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES5
        };

        const sourceFile = ts.createSourceFile('partial', jsText, ts.ScriptTarget.ES5, /*setParentNodes */ true);
        this.fixupParentReferences(sourceFile);
        // needed to make typeChecker to work properly
        (<any>ts).bindSourceFile(sourceFile, opts);
        return sourceFile.statements;
    }

    private processTSNode(node: ts.Node, transformText?: (string) => string) {
        const statements = this.transpileTSNode(node, transformText);

        if (statements && statements.length === 1 && (<any>statements[0]).expression) {
            this.processExpression((<any>statements[0]).expression);
            return;
        }

        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processTSCode(code: string, parse?: any) {
        const statements = (!parse) ? this.transpileTSCode(code) : this.parseTSCode(code);
        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processJSCode(code: string) {
        const statements = this.parseJSCode(code);
        statements.forEach(s => {
            this.processStatementInternal(s);
        });
    }

    private processTryStatement(node: ts.TryStatement): void {
        let anyCase = false;

        this.writer.writeStringNewLine('try');
        this.writer.BeginBlock();

        if (node.finallyBlock) {
            const finallyName = `__finally${node.finallyBlock.getFullStart()}_${node.finallyBlock.getEnd()}`;
            this.writer.writeString(`Finally ${finallyName}(`);

            const newArrowFunctions =
                ts.createArrowFunction(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    node.finallyBlock);

            (<any>newArrowFunctions).__lambda_by_reference = true;

            this.processFunctionExpression(newArrowFunctions);

            this.writer.cancelNewLine();
            this.writer.writeString(')');
            this.writer.EndOfStatement();
        }

        node.tryBlock.statements.forEach(element => this.processStatement(element));

        this.writer.EndBlock();

        if (node.catchClause) {
            this.writer.writeString('catch (const ');
            if (node.catchClause.variableDeclaration.type) {
                this.processType(node.catchClause.variableDeclaration.type);
            } else {
                this.writer.writeString('any');
            }

            this.writer.writeString('& ');

            if (node.catchClause.variableDeclaration.name.kind === ts.SyntaxKind.Identifier) {
                this.processVariableDeclarationOne(
                    <ts.Identifier>(node.catchClause.variableDeclaration.name),
                    node.catchClause.variableDeclaration.initializer,
                    node.catchClause.variableDeclaration.type);
            } else {
                throw new Error('Method not implemented.');
            }

            this.writer.writeStringNewLine(')');
            this.processStatement(node.catchClause.block);

            anyCase = true;
        }

        if (!anyCase) {
            this.writer.writeStringNewLine('catch (...)');
            this.writer.BeginBlock();
            this.writer.writeString('throw');
            this.writer.EndOfStatement();
            this.writer.EndBlock();
        }
    }

    private processThrowStatement(node: ts.ThrowStatement): void {
        this.writer.writeString('throw');
        if (node.expression) {
            this.writer.writeString(' any(');
            this.processExpression(node.expression);
            this.writer.writeString(')');
        }

        this.writer.EndOfStatement();
    }

    private processTypeOfExpression(node: ts.TypeOfExpression): void {
        this.writer.writeString('typeOf(');
        this.processExpression(node.expression);
        this.writer.writeString(')');
    }

    private processDebuggerStatement(node: ts.DebuggerStatement): void {
        this.writer.writeString('__asm { int 3 }');
    }

    private processEnumDeclaration(node: ts.EnumDeclaration): void {
        this.scope.push(node);
        this.processEnumDeclarationInternal(node);
        this.scope.pop();
    }

    private processEnumDeclarationInternal(node: ts.EnumDeclaration): void {

        if (!this.isHeader()) {
            return;
        }

        /*
        const properties = [];
        let value = 0;
        for (const member of node.members) {
            if (member.initializer) {
                switch (member.initializer.kind) {
                    case ts.SyntaxKind.NumericLiteral:
                        value = parseInt((<ts.NumericLiteral>member.initializer).text, 10);
                        break;
                    default:
                        throw new Error('Not Implemented');
                }
            } else {
                value++;
            }

            const namedProperty = ts.createPropertyAssignment(
                member.name,
                ts.createNumericLiteral(value.toString()));

            const valueProperty = ts.createPropertyAssignment(
                ts.createNumericLiteral(value.toString()),
                ts.createStringLiteral((<ts.Identifier>member.name).text));

            properties.push(namedProperty);
            properties.push(valueProperty);
        }

        const enumLiteralObject = ts.createObjectLiteral(properties);
        const varDecl = ts.createVariableDeclaration(node.name, undefined, enumLiteralObject);
        const enumDeclare = ts.createVariableStatement([], [varDecl]);

        this.processStatement(this.fixupParentReferences(enumDeclare, node));
        */

        this.writer.writeString('enum ');
        this.processIdentifier(node.name);
        this.writer.writeString(' ');
        this.writer.BeginBlock();

        let next = false;
        for (const member of node.members) {
            if (next) {
                this.writer.writeString(', ');
            }

            if (member.name.kind === ts.SyntaxKind.Identifier) {
                this.processExpression(member.name);
            } else {
                throw new Error('Not Implemented');
            }

            if (member.initializer) {
                this.writer.writeString(' = ');
                this.processExpression(member.initializer);
            }

            next = true;
        }

        this.writer.EndBlock();
        this.writer.EndOfStatement();
    }

    private hasAccessModifier(modifiers: ts.ModifiersArray) {
        if (!modifiers) {
            return false;
        }

        return modifiers
            .some(m => m.kind === ts.SyntaxKind.PrivateKeyword
                || m.kind === ts.SyntaxKind.ProtectedKeyword
                || m.kind === ts.SyntaxKind.PublicKeyword);
    }

    private processVariablesForwardDeclaration(node: ts.VariableStatement) {
        this.processVariableDeclarationList(node.declarationList, true);

        this.writer.EndOfStatement();
    }

    private processClassForwardDeclaration(node: ts.ClassDeclaration) {
        this.scope.push(node);
        this.processClassForwardDeclarationInternal(node);
        this.scope.pop();

        this.writer.EndOfStatement();
    }

    private processClassForwardDeclarationInternal(node: ts.ClassDeclaration | ts.InterfaceDeclaration) {
        let next = false;
        if (node.typeParameters) {
            this.writer.writeString('template <');
            node.typeParameters.forEach(type => {
                if (next) {
                    this.writer.writeString(', ');
                }
                this.processType(type);
                next = true;
            });
            this.writer.writeStringNewLine('>');
        }
        this.writer.writeString('class ');
        this.processIdentifier(node.name);
    }

    private isInBaseClass(baseClass: ts.TypeNode, identifier: ts.Identifier): boolean {

        const effectiveSymbol = (<any>baseClass).symbol || ((<any>baseClass).exprName).symbol;

        if (!effectiveSymbol
            || !effectiveSymbol.valueDeclaration
            || !effectiveSymbol.valueDeclaration.heritageClauses) {
            return false;
        }

        const hasInBase = effectiveSymbol.valueDeclaration
            .heritageClauses.some(hc => hc.types.some(t => t.expression.text === identifier.text));

        return hasInBase;
    }

    private processClassDeclaration(node: ts.ClassDeclaration | ts.InterfaceDeclaration) {
        this.scope.push(node);
        this.processClassDeclarationInternal(node);
        this.scope.pop();
    }

    private processClassDeclarationInternal(node: ts.ClassDeclaration | ts.InterfaceDeclaration): void {
        if (!this.isHeader()) {
            return;
        }

        this.processClassForwardDeclarationInternal(node);

        let next = false;
        if (node.heritageClauses) {
            let baseClass;
            node.heritageClauses.forEach(heritageClause => {
                heritageClause.types.forEach(type => {
                    if (type.expression.kind === ts.SyntaxKind.Identifier) {
                        const identifier = <ts.Identifier>type.expression;

                        if (baseClass && this.isInBaseClass(baseClass, identifier)) {
                            return;
                        }

                        if (!baseClass) {
                            baseClass = this.resolver.getOrResolveTypeOfAsTypeNode(identifier);
                        }

                        if (next) {
                            this.writer.writeString(', ');
                        } else {
                            this.writer.writeString(' : ');
                        }

                        this.writer.writeString('public ');
                        this.writer.writeString(identifier.text);
                        this.processTemplateArguments(type, true);

                        next = true;
                    } else {
                        /* TODO: finish xxx.yyy<zzz> */
                    }

                });
            });
        } else {
            this.writer.writeString(' : public object');
        }

        this.writer.writeString(', public std::enable_shared_from_this<');
        this.processIdentifier(node.name);
        this.processTemplateParameters(<ts.ClassDeclaration>node);
        this.writer.writeString('>');

        this.writer.writeString(' ');
        this.writer.BeginBlock();
        this.writer.DecreaseIntent();
        this.writer.writeString('public:');
        this.writer.IncreaseIntent();
        this.writer.writeStringNewLine();

        /*
        if (!node.heritageClauses) {
            // to make base class polymorphic
            this.writer.writeStringNewLine('virtual void dummy() {};');
        }
        */

        // declare all private parameters of constructors
        for (const constructor of <ts.ConstructorDeclaration[]>(<ts.ClassDeclaration>node)
                .members.filter(m => m.kind === ts.SyntaxKind.Constructor)) {
            for (const fieldAsParam of constructor.parameters.filter(p => this.hasAccessModifier(p.modifiers))) {
                this.processDeclaration(fieldAsParam);
            }
        }

        for (const member of (<any[]><any>node.members).filter(m => m.kind !== ts.SyntaxKind.PropertyDeclaration || !this.hasThis(m))) {
            this.processDeclaration(member);
        }

        for (const member of (<any[]><any>node.members).filter(m => m.kind === ts.SyntaxKind.PropertyDeclaration && this.hasThis(m))) {
            this.processDeclaration(member);
        }

        this.writer.cancelNewLine();
        this.writer.cancelNewLine();

        this.writer.EndBlock();
        this.writer.EndOfStatement();

        this.writer.writeStringNewLine();
    }

    private processPropertyDeclaration(node: ts.PropertyDeclaration | ts.PropertySignature | ts.ParameterDeclaration,
        implementationMode?: boolean): void {
        if (!implementationMode) {
            this.processModifiers(node.modifiers);
        }

        const effectiveType = node.type
            || this.resolver.getOrResolveTypeOfAsTypeNode(node.initializer);
        this.processPredefineType(effectiveType);
        this.processType(effectiveType);
        this.writer.writeString(' ');

        if (node.name.kind === ts.SyntaxKind.Identifier) {
            if (implementationMode) {
                // write class name
                const classNode = this.scope[this.scope.length - 1];
                if (classNode.kind === ts.SyntaxKind.ClassDeclaration) {
                    this.writer.writeString((<ts.ClassDeclaration>classNode).name.text);
                    this.writer.writeString('::');
                } else {
                    throw new Error('Not Implemented');
                }
            }

            this.processExpression(node.name);
        } else {
            throw new Error('Not Implemented');
        }

        if (implementationMode || (node.initializer && !this.isStatic(node))) {
            this.writer.writeString(' = ');
            this.processExpression(node.initializer);
        }

        this.writer.EndOfStatement();

        this.writer.writeStringNewLine();
    }

    private processMethodDeclaration(node: ts.MethodDeclaration | ts.MethodSignature | ts.ConstructorDeclaration,
        implementationMode?: boolean): void {
        const skip = this.processFunctionDeclaration(<ts.FunctionDeclaration><any>node, implementationMode);
        if (implementationMode) {
            if (!skip) {
                this.writer.writeStringNewLine();
            }
        } else {
            this.writer.EndOfStatement();
        }
    }

    private processModifiers(modifiers: ts.NodeArray<ts.Modifier>) {
        if (!modifiers) {
            return;
        }

        modifiers.forEach(modifier => {
            switch (modifier.kind) {
                case ts.SyntaxKind.StaticKeyword:
                    this.writer.writeString('static ');
                    break;
            }
        });
    }

    private processTypeAliasDeclaration(node: ts.TypeAliasDeclaration): void {

        if (node.type.kind === ts.SyntaxKind.ImportType) {
            const typeLiteral = <ts.ImportTypeNode>node.type;
            const argument = typeLiteral.argument;
            if (argument.kind === ts.SyntaxKind.LiteralType) {
                const literal = <ts.LiteralTypeNode>argument;
                this.writer.writeString('#include \"');
                this.writer.writeString((<any>literal.literal).text);
                this.writer.writeStringNewLine('.h\"');
            } else {
                throw new Error('Not Implemented');
            }

            return;
        }

        const name = node.name.text;
        if (name === 'float' || name === 'double' || name === 'int') {
            return;
        }

        // remove NULL from union types, do we need to remove "undefined" as well?
        let type = node.type;

        this.processPredefineType(type);

        if (node.type.kind === ts.SyntaxKind.UnionType) {
            const unionType = <ts.UnionTypeNode>type;
            const filtered = unionType.types.filter(t => t.kind !== ts.SyntaxKind.NullKeyword && t.kind !== ts.SyntaxKind.UndefinedKeyword);
            if (filtered.length === 1) {
                type = filtered[0];
            }
        } else if (node.type.kind === ts.SyntaxKind.ConditionalType) {
            const conditionType = <ts.ConditionalTypeNode>type;
            type = conditionType.checkType;
        } else if (node.type.kind === ts.SyntaxKind.MappedType) {
            const mappedType = <ts.MappedTypeNode>type;
            if (node.typeParameters && node.typeParameters[0]) {
                type = <any>{ kind: ts.SyntaxKind.TypeParameter, name: ts.createIdentifier((<any>(node.typeParameters[0])).symbol.name) };
            }
        }

        if (node.typeParameters) {
            this.processTemplateParams(node);
            this.writer.writeString('using ');
            this.processExpression(node.name);
            this.writer.writeString(' = ');
            this.processType(type, false, true, true);
        } else {
            // default typedef
            this.writer.writeString('typedef ');
            this.processType(type, false, true, true);
            this.writer.writeString(' ');
            this.processExpression(node.name);
        }

        this.writer.EndOfStatement();
        this.writer.writeStringNewLine();
    }

    private processModuleDeclaration(node: ts.ModuleDeclaration): void {
        this.writer.writeString('namespace ');
        this.processExpression(node.name);
        this.writer.writeString(' ');

        this.writer.BeginBlock();

        this.processStatement(<ts.ModuleBlock>node.body);

        this.writer.EndBlock();
    }

    private processNamespaceDeclaration(node: ts.NamespaceDeclaration): void {
        this.writer.writeString('namespace ');
        this.processExpression(node.name);
        this.writer.writeString(' ');

        this.writer.BeginBlock();

        this.processModuleDeclaration(node);

        this.writer.EndBlock();
    }

    private processExportDeclaration(node: ts.ExportDeclaration): void {
        /* TODO: */
    }

    private processImportDeclaration(node: ts.ImportDeclaration): void {

        if (node.moduleSpecifier.kind !== ts.SyntaxKind.StringLiteral) {
            return;
        }

        this.writer.writeString('#include \"');
        if (node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral) {
            const ident = <ts.StringLiteral>node.moduleSpecifier;
            this.writer.writeString(ident.text);
            this.writer.writeString('.h');
        }

        this.writer.writeStringNewLine('\"');
    }

    private processVariableDeclarationList(declarationList: ts.VariableDeclarationList, forwardDeclaration?: boolean): boolean {
        if (!((<any>declarationList).__ignore_type)) {

            if (forwardDeclaration) {
                this.writer.writeString('extern ');
            }

            const scopeItem = this.scope[this.scope.length - 1];
            const autoAllowed =
                scopeItem.kind !== ts.SyntaxKind.SourceFile
                && scopeItem.kind !== ts.SyntaxKind.ClassDeclaration
                && scopeItem.kind !== ts.SyntaxKind.ModuleDeclaration
                && scopeItem.kind !== ts.SyntaxKind.NamespaceExportDeclaration;
            const effectiveType = declarationList.declarations[0].type
                || this.resolver.getOrResolveTypeOfAsTypeNode(declarationList.declarations[0].initializer);
            this.processPredefineType(effectiveType);
            this.processType(
                effectiveType,
                autoAllowed && !!(declarationList.declarations[0].initializer));

            this.writer.writeString(' ');
        }

        const next = { next: false };
        let result = false;
        declarationList.declarations.forEach(
            d => result = this.processVariableDeclarationOne(
                <ts.Identifier>d.name, d.initializer, d.type, next, forwardDeclaration) || result);

        return result;
    }

    private processVariableDeclarationOne(
        name: ts.Identifier, initializer: ts.Expression, type: ts.TypeNode, next?: { next: boolean }, forwardDeclaration?: boolean) {
        if (next && next.next) {
            this.writer.writeString(', ');
        }

        this.writer.writeString(name.text);

        if (!forwardDeclaration) {
            if (initializer) {
                this.writer.writeString(' = ');
                this.processExpression(initializer);
            } else {
                if (type && type.kind === ts.SyntaxKind.TupleType) {
                    this.processDefaultValue(type);
                }
            }
        }

        if (next) {
            next.next = true;
        }

        return true;
    }

    private processVariableStatement(node: ts.VariableStatement): void {
        const anyVal = this.processVariableDeclarationList(node.declarationList);
        if (anyVal) {
            this.writer.EndOfStatement();
        }
    }

    private childrenVisitor(location: ts.Node, visit: (node: ts.Node) => boolean) {
        let root = true;
        function checkChild(node: ts.Node): any {
            if (root) {
                root = false;
            } else {
                if (node.kind === ts.SyntaxKind.FunctionDeclaration
                    || node.kind === ts.SyntaxKind.ArrowFunction
                    || node.kind === ts.SyntaxKind.MethodDeclaration
                    || node.kind === ts.SyntaxKind.FunctionExpression
                    || node.kind === ts.SyntaxKind.FunctionType
                    || node.kind === ts.SyntaxKind.ClassDeclaration
                    || node.kind === ts.SyntaxKind.ClassExpression) {
                    return;
                }
            }

            if (!visit(node)) {
                ts.forEachChild(node, checkChild);
            }
        }

        ts.forEachChild(location, checkChild);
    }

    private hasReturn(location: ts.Node): boolean {
        let hasReturnResult = false;
        this.childrenVisitor(location, (node: ts.Node) => {
            if (node.kind === ts.SyntaxKind.ReturnStatement) {
                const returnStatement = <ts.ReturnStatement>node;
                if (returnStatement.expression) {
                    hasReturnResult = true;
                    return true;
                }
            }

            return false;
        });

        return hasReturnResult;
    }

    private hasArguments(location: ts.Node): boolean {
        let hasArgumentsResult = false;
        this.childrenVisitor(location, (node: ts.Node) => {
            if (node.kind === ts.SyntaxKind.Identifier && node.parent.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                const identifier = <ts.Identifier>node;
                if (identifier.text === 'arguments') {
                    hasArgumentsResult = true;
                    return true;
                }
            }

            return false;
        });

        return hasArgumentsResult;
    }

    private requireCapture(location: ts.Node): boolean {
        let requireCaptureResult = false;
        this.childrenVisitor(location, (node: ts.Node) => {
            if (node.kind === ts.SyntaxKind.Identifier
                && node.parent.kind !== ts.SyntaxKind.FunctionDeclaration
                && node.parent.kind !== ts.SyntaxKind.ClassDeclaration
                && node.parent.kind !== ts.SyntaxKind.MethodDeclaration
                && node.parent.kind !== ts.SyntaxKind.EnumDeclaration) {
                const isLocal = this.resolver.isLocal(node);
                if (isLocal !== undefined && !isLocal) {
                    requireCaptureResult = true;
                    return true;
                }
            }

            return false;
        });

        return requireCaptureResult;
    }

    private hasThis(location: ts.Node): boolean {
        let createThis = false;
        this.childrenVisitor(location, (node: ts.Node) => {
            if (node.kind === ts.SyntaxKind.ThisKeyword) {
                createThis = true;
                return true;
            }

            return false;
        });

        return createThis;
    }

    private processPredefineType(typeIn: ts.TypeNode | ts.ParameterDeclaration | ts.TypeParameterDeclaration | ts.Expression,
        auto: boolean = false): void {

        if (auto) {
            return;
        }

        let type = typeIn;
        if (typeIn && typeIn.kind === ts.SyntaxKind.LiteralType) {
            type = (<ts.LiteralTypeNode>typeIn).literal;
        }

        switch (type && type.kind) {
            case ts.SyntaxKind.ArrayType:
                const arrayType = <ts.ArrayTypeNode>type;
                this.processPredefineType(arrayType.elementType, false);

                break;
            case ts.SyntaxKind.TupleType:
                const tupleType = <ts.TupleTypeNode>type;

                tupleType.elementTypes.forEach(element => {
                    this.processPredefineType(element, false);
                });

                break;
            case ts.SyntaxKind.TypeReference:
                const typeReference = <ts.TypeReferenceNode>type;

                if (typeReference.typeArguments) {
                    typeReference.typeArguments.forEach(element => {
                        this.processPredefineType(element, false);
                    });
                }

                break;
            case ts.SyntaxKind.Parameter:
                const parameter = <ts.ParameterDeclaration>type;
                if (parameter.name.kind === ts.SyntaxKind.Identifier) {
                    this.processPredefineType(parameter.type);
                } else {
                    throw new Error('Not Implemented');
                }

                break;
            case ts.SyntaxKind.FunctionType:
                const functionType = <ts.FunctionTypeNode>type;
                this.processPredefineType(functionType.type);
                if (functionType.parameters) {
                    functionType.parameters.forEach(element => {
                        this.processPredefineType(element);
                    });
                }
                break;
            case ts.SyntaxKind.UnionType:

                /*
                const unionType = <ts.UnionTypeNode>type;
                const unionTypes = unionType.types
                    .filter(f => f.kind !== ts.SyntaxKind.NullKeyword && f.kind !== ts.SyntaxKind.UndefinedKeyword);

                if (this.typesAreNotSame(unionTypes)) {
                    unionTypes.forEach((element, i) => {
                        this.processPredefineType(element);
                    });

                    this.processType(type, undefined, undefined, undefined, true);
                    this.writer.EndOfStatement();
                } else {
                    this.processPredefineType(unionTypes[0]);
                }
                */
                break;
        }
    }

    private compareTypes(t1: ts.TypeNode, t2: ts.TypeNode): boolean {
        const kind1 = t1.kind === ts.SyntaxKind.LiteralType ? (<ts.LiteralTypeNode>t1).literal.kind : t1.kind;
        const kind2 = t2.kind === ts.SyntaxKind.LiteralType ? (<ts.LiteralTypeNode>t2).literal.kind : t2.kind;
        return kind1 === kind2;
    }

    private typesAreNotSame(unionTypes: ts.TypeNode[]): boolean {
        if (unionTypes.length <= 1) {
            return false;
        }

        const firstType = unionTypes[0];
        const same = unionTypes.slice(1).every(t => this.compareTypes(t, firstType));
        return !same;
    }

    private processType(typeIn: ts.TypeNode | ts.ParameterDeclaration | ts.TypeParameterDeclaration | ts.Expression,
        auto: boolean = false, skipPointerInType: boolean = false, noTypeName: boolean = false,
        implementingUnionType: boolean = false): void {

        if (auto) {
            this.writer.writeString('auto');
            return;
        }

        let type = typeIn;
        if (typeIn && typeIn.kind === ts.SyntaxKind.LiteralType) {
            type = (<ts.LiteralTypeNode>typeIn).literal;
        }

        let next;
        switch (type && type.kind) {
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.BooleanKeyword:
                this.writer.writeString('boolean');
                break;
            case ts.SyntaxKind.NumericLiteral:
            case ts.SyntaxKind.NumberKeyword:
                this.writer.writeString('js::number');
                break;
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.StringKeyword:
                this.writer.writeString('string');
                break;
            case ts.SyntaxKind.TypeLiteral:
            case ts.SyntaxKind.ObjectLiteralExpression:
                this.writer.writeString('object');
                break;
            case ts.SyntaxKind.ArrayType:
                this.writer.writeString('array');
                break;
            case ts.SyntaxKind.TupleType:
                const tupleType = <ts.TupleTypeNode>type;

                this.writer.writeString('std::tuple<');

                next = false;
                tupleType.elementTypes.forEach(element => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    this.processType(element, false);
                    next = true;
                });

                this.writer.writeString(' >');
                break;
            case ts.SyntaxKind.TypeReference:
                const typeReference = <ts.TypeReferenceNode>type;
                const typeInfo = this.resolver.getOrResolveTypeOf(type);
                const isTypeAlias = ((typeInfo && this.resolver.checkTypeAlias(typeInfo.aliasSymbol))
                    || this.resolver.isTypeAlias((<any>type).typeName)) && !this.resolver.isThisType(typeInfo);

                // detect if pointer
                let isEnum = false;
                const entityProcessCheck = (entity: ts.EntityName) => {
                    if (entity.kind === ts.SyntaxKind.QualifiedName) {
                        entityProcessCheck(entity.left);
                        isEnum = this.resolver.isTypeFromSymbol(entity.left, ts.SyntaxKind.EnumDeclaration);
                    }
                };

                entityProcessCheck(typeReference.typeName);

                const skipPointerIf =
                    (typeInfo && (<any>typeInfo).symbol && (<any>typeInfo).symbol.name === '__type')
                    || (typeInfo && (<any>typeInfo).primitiveTypesOnly)
                    || (typeInfo && (<any>typeInfo).intrinsicName === 'number')
                    || this.resolver.isTypeFromSymbol(typeInfo, ts.SyntaxKind.TypeParameter)
                    || this.resolver.isTypeFromSymbol(typeInfo, ts.SyntaxKind.EnumMember)
                    || this.resolver.isTypeFromSymbol((<any>type).typeName, ts.SyntaxKind.EnumDeclaration)
                    || isEnum
                    || skipPointerInType
                    || isTypeAlias;

                if (!skipPointerIf) {
                    this.writer.writeString('std::shared_ptr<');
                }

                if ((<any>typeReference.typeName).symbol
                    && (<any>typeReference.typeName).symbol.parent
                    && (<any>typeReference.typeName).symbol.parent.valueDeclaration.kind !== ts.SyntaxKind.SourceFile) {
                    this.processType((<any>typeReference.typeName).symbol.parent.valueDeclaration);
                    this.writer.writeString('::');
                }

                const entityProcess = (entity: ts.EntityName) => {
                    if (entity.kind === ts.SyntaxKind.Identifier) {
                        this.writer.writeString(entity.text);
                    } else if (entity.kind === ts.SyntaxKind.QualifiedName) {
                        entityProcess(entity.left);
                        isEnum = this.resolver.isTypeFromSymbol(entity.left, ts.SyntaxKind.EnumDeclaration);
                        if (!isEnum) {
                            this.writer.writeString('::');
                            this.writer.writeString(entity.right.text);
                        }
                    } else {
                        throw new Error('Not Implemented');
                    }
                };

                entityProcess(typeReference.typeName);

                if (typeReference.typeArguments) {
                    this.writer.writeString('<');

                    let next1 = false;
                    typeReference.typeArguments.forEach(element => {
                        if (next1) {
                            this.writer.writeString(', ');
                        }

                        this.processType(element, false);
                        next1 = true;
                    });

                    this.writer.writeString(' >');
                }

                if (!skipPointerIf) {
                    this.writer.writeString('>');
                }

                break;
            case ts.SyntaxKind.TypeParameter:
                const typeParameter = <ts.TypeParameterDeclaration>type;
                if (typeParameter.name.kind === ts.SyntaxKind.Identifier) {
                    if (!noTypeName) {
                        this.writer.writeString('typename ');
                    }

                    this.writer.writeString(typeParameter.name.text);
                } else {
                    throw new Error('Not Implemented');
                }

                break;
            case ts.SyntaxKind.Parameter:
                const parameter = <ts.ParameterDeclaration>type;
                if (parameter.name.kind === ts.SyntaxKind.Identifier) {
                    this.processType(parameter.type);
                } else {
                    throw new Error('Not Implemented');
                }

                break;
            case ts.SyntaxKind.FunctionType:
                const functionType = <ts.FunctionTypeNode>type;
                this.writer.writeString('std::function<');
                this.processType(functionType.type);
                this.writer.writeString('(');
                if (functionType.parameters) {
                    next = false;
                    functionType.parameters.forEach(element => {
                        if (next) {
                            this.writer.writeString(', ');
                        }

                        this.processType(element);
                        next = true;
                    });
                } else {
                    this.writer.writeString('void');
                }

                this.writer.writeString(')>');
                break;
            case ts.SyntaxKind.VoidKeyword:
                this.writer.writeString('void');
                break;
            case ts.SyntaxKind.AnyKeyword:
                this.writer.writeString('any');
                break;
            case ts.SyntaxKind.NullKeyword:
                this.writer.writeString('std::nullptr_t');
                break;
            case ts.SyntaxKind.UndefinedKeyword:
                this.writer.writeString('undefined_t');
                break;
            case ts.SyntaxKind.UnionType:

                /*
                const unionType = <ts.UnionTypeNode>type;
                const unionTypes = unionType.types
                    .filter(f => f.kind !== ts.SyntaxKind.NullKeyword && f.kind !== ts.SyntaxKind.UndefinedKeyword);

                if (this.typesAreNotSame(unionTypes)) {
                    const pos = type.pos >= 0 ? type.pos : 0;
                    const end = type.end >= 0 ? type.end : 0;
                    const unionName = `__union${pos}_${end}`;
                    if (implementingUnionType) {
                        this.writer.writeString('union ');
                        this.writer.writeString(unionName);
                        this.writer.writeString(' ');
                        this.writer.BeginBlock();

                        this.writer.writeStringNewLine(`${unionName}(std::nullptr_t v_) {}`);

                        unionTypes.forEach((element, i) => {
                            this.processType(element);
                            this.writer.writeString(` v${i}`);
                            this.writer.EndOfStatement();
                            this.writer.cancelNewLine();
                            this.writer.writeString(` ${unionName}(`);
                            this.processType(element);
                            this.writer.writeStringNewLine(` v_) : v${i}(v_) {}`);
                        });

                        this.writer.EndBlock();
                        this.writer.cancelNewLine();
                    } else {
                        this.writer.writeString(unionName);
                    }
                } else {
                    this.processType(unionTypes[0]);
                }
                */
                this.writer.writeString(auto ? 'auto' : 'any');

                break;
            case ts.SyntaxKind.ModuleDeclaration:
                const moduleDeclaration = <ts.ModuleDeclaration><any>type;
                this.writer.writeString(moduleDeclaration.name.text);
                break;
            default:
                this.writer.writeString(auto ? 'auto' : 'any');
                break;
        }
    }

    private processDefaultValue(type: ts.TypeNode): void {
        switch (type.kind) {
            case ts.SyntaxKind.BooleanKeyword:
                this.writer.writeString('false');
                break;
            case ts.SyntaxKind.NumberKeyword:
                this.writer.writeString('0');
                break;
            case ts.SyntaxKind.StringKeyword:
                this.writer.writeString('""_S');
                break;
            case ts.SyntaxKind.ArrayType:
                this.writer.writeString('{}');
                break;
            case ts.SyntaxKind.TupleType:
                const tupleType = <ts.TupleTypeNode>type;

                this.writer.writeString('{');

                let next = false;
                tupleType.elementTypes.forEach(element => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    this.processDefaultValue(element);
                    next = true;
                });

                this.writer.writeString('}');
                break;
            case ts.SyntaxKind.TypeReference:
                this.writer.writeString('{}');
                break;
            default:
                this.writer.writeString('any');
                break;
        }
    }

    private processFunctionExpression(
        node: ts.FunctionExpression | ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration
            | ts.ConstructorDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
        implementationMode?: boolean): boolean {

        this.scope.push(node);
        const result = this.processFunctionExpressionInternal(node, implementationMode);
        this.scope.pop();

        return result;
    }

    private processFunctionExpressionInternal(
        node: ts.FunctionExpression | ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration
            | ts.ConstructorDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
        implementationMode?: boolean): boolean {

        // skip function declaration as union
        let noBody = false;
        if (!node.body
            || ((<any>node).body.statements
                && (<any>node).body.statements.length === 0
                && ((<any>node).body.statements).isMissingList)) {
            // function without body;
            if ((<any>node).nextContainer
                && node.kind === (<any>node).nextContainer.kind) {
                return true;
            }

            noBody = true;
        }

        if (implementationMode && noBody) {
            // ignore declarations
            return true;
        }

        const noReturn = !this.hasReturn(node);
        // const noParams = node.parameters.length === 0 && !this.hasArguments(node);
        // const noCapture = !this.requireCapture(node);

        // in case of nested function
        const isNestedFunction = node.parent && node.parent.kind === ts.SyntaxKind.Block;
        if (isNestedFunction) {
            implementationMode = true;
        }

        const isClassMemberDeclaration = this.isClassMemberDeclaration(node);
        const isClassMember = isClassMemberDeclaration || this.isClassMemberSignature(node);
        const isFunctionOrMethodDeclaration =
            (node.kind === ts.SyntaxKind.FunctionDeclaration || isClassMember)
            && !isNestedFunction;
        const isFunctionExpression = node.kind === ts.SyntaxKind.FunctionExpression;
        const isFunction = isFunctionOrMethodDeclaration || isFunctionExpression;
        const isArrowFunction = node.kind === ts.SyntaxKind.ArrowFunction || isNestedFunction;
        const writeAsLambdaCFunction = isArrowFunction || isFunction;

        if (implementationMode && node.parent && node.parent.kind === ts.SyntaxKind.ClassDeclaration && this.isTemplate(<any>node.parent)) {
            this.processTemplateParams(<any>node.parent);
        }

        this.processTemplateParams(node);

        if (implementationMode !== true) {
            this.processModifiers(node.modifiers);
        }

        if (writeAsLambdaCFunction) {
            if (isFunctionOrMethodDeclaration) {
                // type declaration
                if (node.kind !== ts.SyntaxKind.Constructor) {
                    const isVirtual = isClassMember
                        && !this.isStatic(node)
                        && !this.isTemplate(<ts.MethodDeclaration>node)
                        && implementationMode !== true;
                    if (isVirtual) {
                        this.writer.writeString('virtual ');
                    }

                    if (node.type) {
                        if (this.isTemplateType(node.type)) {
                            this.writer.writeString('RET');
                        } else {
                            this.processType(node.type);
                        }
                    } else {
                        if (noReturn) {
                            this.writer.writeString('void');
                        } else {
                            if (isClassMember && (<ts.Identifier>node.name).text === 'toString') {
                                this.writer.writeString('string');
                            } else {
                                this.writer.writeString('any');
                            }
                        }
                    }

                    this.writer.writeString(' ');
                }

                if (isClassMemberDeclaration && implementationMode) {
                    // in case of constructor
                    this.writeClassName();

                    if (implementationMode
                        && node.parent
                        && node.parent.kind === ts.SyntaxKind.ClassDeclaration
                        && this.isTemplate(<any>node.parent)) {
                        this.processTemplateParameters(<any>node.parent);
                    }

                    this.writer.writeString('::');
                }

                // name
                if (node.name && node.name.kind === ts.SyntaxKind.Identifier) {
                    if (node.kind === ts.SyntaxKind.GetAccessor) {
                        this.writer.writeString('get_');
                    } else if (node.kind === ts.SyntaxKind.SetAccessor) {
                        this.writer.writeString('set_');
                    }

                    if (node.name.kind === ts.SyntaxKind.Identifier) {
                        this.processExpression(node.name);
                    } else {
                        throw new Error('Not implemented');
                    }
                } else {
                    // in case of constructor
                    this.writeClassName();
                }
            } else if (isArrowFunction || isFunctionExpression) {

                if (isNestedFunction) {
                    this.writer.writeString('auto ');
                    if (node.name.kind === ts.SyntaxKind.Identifier) {
                        this.processExpression(node.name);
                    } else {
                        throw new Error('Not implemented');
                    }

                    this.writer.writeString(' = ');
                }

                // lambda or noname function
                const byReference = (<any>node).__lambda_by_reference ? '&' : '=';
                this.writer.writeString(`[${byReference}]`);
            }
        }

        this.writer.writeString('(');

        let defaultParams = false;
        let next = false;
        node.parameters.forEach((element, index) => {
            if (element.name.kind !== ts.SyntaxKind.Identifier) {
                throw new Error('Not implemented');
            }

            if (next) {
                this.writer.writeString(', ');
            }

            const effectiveType = element.type
                || this.resolver.getOrResolveTypeOfAsTypeNode(element.initializer);
            if (element.dotDotDotToken) {
                this.writer.writeString('Args...');
            } else if (this.isTemplateType(effectiveType)) {
                this.writer.writeString('P' + index);
            } else {
                this.processType(effectiveType, isArrowFunction);
            }

            this.writer.writeString(' ');
            this.processExpression(element.name);

            // extra symbol to change parameter name
            if (node.kind === ts.SyntaxKind.Constructor
                && this.hasAccessModifier(element.modifiers)
                || element.dotDotDotToken) {
                this.writer.writeString('_');
            }

            if (!implementationMode) {
                if (element.initializer) {
                    this.writer.writeString(' = ');
                    this.processExpression(element.initializer);
                    defaultParams = true;
                } else if (element.questionToken || defaultParams) {
                    switch (element.type && element.type.kind) {
                        case ts.SyntaxKind.FunctionType:
                            this.writer.writeString(' = nullptr');
                            break;
                        default:
                            this.writer.writeString(' = undefined');
                            break;
                    }
                }
            }

            next = true;
        });

        if (isArrowFunction || isFunctionExpression) {
            this.writer.writeStringNewLine(') mutable');
        } else {
            this.writer.writeStringNewLine(')');
        }

        // constructor init
        let skipped = 0;
        if (node.kind === ts.SyntaxKind.Constructor && implementationMode) {
            this.writer.cancelNewLine();

            next = false;
            node.parameters
                .filter(e => this.hasAccessModifier(e.modifiers))
                .forEach(element => {
                    if (next) {
                        this.writer.writeString(', ');
                    } else {
                        this.writer.writeString(' : ');
                    }

                    if (element.name.kind === ts.SyntaxKind.Identifier) {
                        this.processExpression(element.name);
                        this.writer.writeString('(');
                        this.processExpression(element.name);
                        this.writer.writeString('_)');
                    } else {
                        throw new Error('Not implemented');
                    }

                    next = true;
                });

            // process base constructor call
            let superCall = (<any>node.body).statements[0];
            if (superCall && superCall.kind === ts.SyntaxKind.ExpressionStatement) {
                superCall = (<ts.ExpressionStatement>superCall).expression;
            }

            if (superCall && superCall.kind === ts.SyntaxKind.CallExpression
                && (<ts.CallExpression>superCall).expression.kind === ts.SyntaxKind.SuperKeyword) {
                if (!next) {
                    this.writer.writeString(' : ');
                } else {
                    this.writer.writeString(', ');
                }

                this.processExpression(superCall);
                skipped = 1;
            }

            if (next) {
                this.writer.writeString(' ');
            }

            this.writer.writeString(' ');
        }

        if (isClassMember && !implementationMode && noBody) {
            // abstract
            this.writer.cancelNewLine();
            this.writer.writeString(' = 0');
        }

        if (isFunctionExpression || implementationMode && !isClassMemberDeclaration) {
            this.writer.BeginBlock();

            node.parameters
                .filter(e => e.dotDotDotToken)
                .forEach(element => {
                    this.writer.writeString('array ');
                    this.processExpression(<ts.Identifier>element.name);
                    this.writer.writeString(' = {');
                    this.processExpression(<ts.Identifier>element.name);
                    this.writer.writeStringNewLine('_...};');
                });

            (<any>node.body).statements.filter((item, index) => index >= skipped).forEach(element => {
                this.processStatementInternal(element, true);
            });

            this.writer.EndBlock();
        }
    }

    private writeClassName() {
        const classNode = this.scope[this.scope.length - 2];
        if (classNode && classNode.kind === ts.SyntaxKind.ClassDeclaration) {
            this.processExpression((<ts.ClassDeclaration>classNode).name);
        } else {
            throw new Error('Not Implemented');
        }
    }

    private processTemplateParams(node: ts.FunctionExpression | ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration
        | ts.MethodSignature | ts.ConstructorDeclaration | ts.TypeAliasDeclaration | ts.GetAccessorDeclaration
        | ts.SetAccessorDeclaration) {

        let types = <ts.TypeParameterDeclaration[]><any>node.typeParameters;
        if (types && node.parent && (<any>node.parent).typeParameters) {
            types = types.filter(t => (<any>node.parent).typeParameters.every(t2 => t.name.text !== t2.name.text));
        }

        const templateTypes = types && types.length > 0;
        const isParamTemplate = this.isMethodParamsTemplate(node);
        const isReturnTemplate = this.isTemplateType(node.type);

        let next = false;
        if (templateTypes || isParamTemplate || isReturnTemplate) {
            this.writer.writeString('template <');
            if (templateTypes) {
                types.forEach(type => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    this.processType(type);
                    next = true;
                });
            }

            if (isReturnTemplate) {
                if (next) {
                    this.writer.writeString(', ');
                }

                this.writer.writeString('typename RET');
                next = true;
            }

            // add params
            if (isParamTemplate) {
                (<ts.MethodDeclaration>node).parameters.forEach((element, index) => {
                    if (this.isTemplateType(element.type)) {
                        if (next) {
                            this.writer.writeString(', ');
                        }

                        this.writer.writeString('typename P' + index);
                        next = true;
                    }

                    if (element.dotDotDotToken) {
                        this.writer.writeString('typename ...Args');
                        next = true;
                    }
                });
            }

            this.writer.writeStringNewLine('>');
        }

        return next;
    }

    private processTemplateParameters(node: ts.ClassDeclaration) {
        let next = false;
        if (node.typeParameters) {
            this.writer.writeString('<');
            node.typeParameters.forEach(type => {
                if (next) {
                    this.writer.writeString(', ');
                }
                this.processType(type, undefined, undefined, true);
                next = true;
            });
            this.writer.writeString('>');
        }

        return next;
    }

    private processTemplateArguments(node: ts.ExpressionWithTypeArguments | ts.CallExpression | ts.NewExpression,
        skipPointerInType?: boolean) {
        let next = false;
        if (node.typeArguments) {
            this.writer.writeString('<');
            node.typeArguments.forEach(element => {
                if (next) {
                    this.writer.writeString(', ');
                }

                this.processType(element, undefined, skipPointerInType);
                next = true;
            });
            this.writer.writeString('>');
        } else {
            /*
            const typeInfo = this.resolver.getOrResolveTypeOf(node.expression);
            const templateParametersInfoFromType: ts.TypeParameter[] = typeInfo
                && typeInfo.symbol
                && typeInfo.symbol.valueDeclaration
                && (<any>typeInfo.symbol.valueDeclaration).typeParameters;

            if (templateParametersInfoFromType) {
                this.writer.writeString('<void>');
            }
            */
        }
    }

    private processArrowFunction(node: ts.ArrowFunction): void {
        if (node.body.kind !== ts.SyntaxKind.Block) {
            // create body
            node.body = ts.createBlock([ts.createReturn(<ts.Expression>node.body)]);
        }

        this.processFunctionExpression(<any>node);
    }

    private isClassMemberDeclaration(node: ts.Node) {
        if (!node) {
            return false;
        }

        return node.kind === ts.SyntaxKind.Constructor
            || node.kind === ts.SyntaxKind.MethodDeclaration
            || node.kind === ts.SyntaxKind.PropertyDeclaration
            || node.kind === ts.SyntaxKind.GetAccessor
            || node.kind === ts.SyntaxKind.SetAccessor;
    }

    private isClassMemberSignature(node: ts.Node) {
        if (!node) {
            return false;
        }

        return node.kind === ts.SyntaxKind.MethodSignature
            || node.kind === ts.SyntaxKind.PropertySignature;
    }

    private isStatic(node: ts.Node) {
        return node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.StaticKeyword);
    }

    private processFunctionDeclaration(node: ts.FunctionDeclaration | ts.MethodDeclaration, implementationMode?: boolean): boolean {

        if (!implementationMode) {
            this.processPredefineType(node.type);
            node.parameters.forEach((element) => {
                this.processPredefineType(element.type);
            });
        }

        const skip = this.processFunctionExpression(<ts.FunctionExpression><any>node, implementationMode);
        if (!skip && !this.isClassMemberDeclaration(node)) {
            this.writer.EndOfStatement();
            this.writer.writeStringNewLine();
        }

        if (this.isClassMemberSignature(node)) {
            this.writer.cancelNewLine();
        }

        return skip;
    }

    private processReturnStatement(node: ts.ReturnStatement): void {
        this.writer.writeString('return');
        if (node.expression) {
            this.writer.writeString(' ');

            const typeReturn = this.resolver.getOrResolveTypeOfAsTypeNode(node.expression);
            const functionDeclaration = (<ts.FunctionDeclaration>(this.scope[this.scope.length - 1]));
            let functionReturn = functionDeclaration.type || this.resolver.getOrResolveTypeOfAsTypeNode(functionDeclaration);
            if (functionReturn.kind === ts.SyntaxKind.FunctionType) {
                functionReturn = (<ts.FunctionTypeNode>functionReturn).type;
            } else if (!functionDeclaration.type) {
                // if it is not function then use "any"
                functionReturn = null;
            }

            /*
            let theSame = (typeReturn && typeReturn.kind === ts.SyntaxKind.ThisKeyword)
                || this.resolver.typesAreTheSame(typeReturn, functionReturn);

            // TODO: hack
            if (typeReturn && typeReturn.kind === ts.SyntaxKind.ArrayType) {
                theSame = false;
            }

            // cast only if we have provided type
            if (!theSame && functionReturn) {
                this.writer.writeString('cast<');

                if (this.isTemplateType(functionReturn)) {
                    this.writer.writeString('RET');
                } else {
                    this.processType(functionReturn);
                }

                this.writer.writeString('>(');
            }
            */

            if (node.expression.kind === ts.SyntaxKind.ThisKeyword) {
                this.writer.writeString('shared_from_this()');
            } else {
                this.processExpression(node.expression);
            }

            /*
            if (!theSame && functionReturn) {
                this.writer.writeString(')');
            }
            */
        }

        this.writer.EndOfStatement();
    }

    private processIfStatement(node: ts.IfStatement): void {
        this.writer.writeString('if (');
        this.processExpression(node.expression);
        this.writer.writeString(') ');

        this.processStatement(node.thenStatement);

        if (node.elseStatement) {
            this.writer.cancelNewLine();
            this.writer.writeString(' else ');
            this.processStatement(node.elseStatement);
        }
    }

    private processDoStatement(node: ts.DoStatement): void {
        this.writer.writeStringNewLine('do');
        this.processStatement(node.statement);
        this.writer.writeString('while (');
        this.processExpression(node.expression);
        this.writer.writeStringNewLine(');');
    }

    private processWhileStatement(node: ts.WhileStatement): void {
        this.writer.writeString('while (');
        this.processExpression(node.expression);
        this.writer.writeStringNewLine(')');
        this.processStatement(node.statement);
    }

    private processForStatement(node: ts.ForStatement): void {
        this.writer.writeString('for (');
        const initVar = <any>node.initializer;
        this.processExpression(initVar);
        this.writer.writeString('; ');
        this.processExpression(node.condition);
        this.writer.writeString('; ');
        this.processExpression(node.incrementor);
        this.writer.writeStringNewLine(')');
        this.processStatement(node.statement);
    }

    private processForInStatement(node: ts.ForInStatement): void {
        this.processForInStatementNoScope(node);
    }

    private processForInStatementNoScope(node: ts.ForInStatement): void {
        this.writer.writeString('for (auto& ');
        const initVar = <any>node.initializer;
        initVar.__ignore_type = true;
        this.processExpression(initVar);
        this.writer.writeString(' : keys_(');
        this.processExpression(node.expression);
        this.writer.writeStringNewLine('))');
        this.processStatement(node.statement);
    }

    private processForOfStatement(node: ts.ForOfStatement): void {
        this.writer.writeString('for (auto& ');
        const initVar = <any>node.initializer;
        initVar.__ignore_type = true;
        this.processExpression(initVar);

        this.writer.writeString(' : ');

        this.processExpression(node.expression);

        this.writer.writeStringNewLine(')');
        this.processStatement(node.statement);
    }

    private processBreakStatement(node: ts.BreakStatement) {
        this.writer.writeStringNewLine('break;');
    }

    private processContinueStatement(node: ts.ContinueStatement) {
        this.writer.writeStringNewLine('continue;');
    }

    private processSwitchStatement(node: ts.SwitchStatement) {

        const switchName = `__switch${node.getFullStart()}_${node.getEnd()}`;
        const isAllStatic = node.caseBlock.clauses
            .filter(c => c.kind === ts.SyntaxKind.CaseClause)
            .every(element => (<ts.CaseClause>element).expression.kind === ts.SyntaxKind.NumericLiteral
                || (<ts.CaseClause>element).expression.kind === ts.SyntaxKind.StringLiteral
                || (<ts.CaseClause>element).expression.kind === ts.SyntaxKind.TrueKeyword
                || (<ts.CaseClause>element).expression.kind === ts.SyntaxKind.FalseKeyword);

        if (isAllStatic) {
            this.writer.writeString('static ');
        }

        this.writer.writeString(`std::unordered_map<any, int> ${switchName} = `);
        this.writer.BeginBlock();

        let caseNumber = 0;
        node.caseBlock.clauses.filter(c => c.kind === ts.SyntaxKind.CaseClause).forEach(element => {
            if (caseNumber > 0) {
                this.writer.writeStringNewLine(',');
            }

            this.writer.BeginBlockNoIntent();
            this.writer.writeString('any(');
            this.processExpression((<ts.CaseClause>element).expression);
            this.writer.writeString('), ');
            this.writer.writeString((++caseNumber).toString());
            this.writer.EndBlockNoIntent();
        });

        this.writer.EndBlock();
        this.writer.EndOfStatement();


        this.writer.writeString(`switch (${switchName}[`);
        this.processExpression(node.expression);
        this.writer.writeStringNewLine('])');

        this.writer.BeginBlock();

        caseNumber = 0;
        node.caseBlock.clauses.forEach(element => {
            this.writer.DecreaseIntent();
            if (element.kind === ts.SyntaxKind.CaseClause) {
                this.writer.writeString(`case ${++caseNumber}`);
            } else {
                this.writer.writeString('default');
            }

            this.writer.IncreaseIntent();

            this.writer.writeStringNewLine(':');
            element.statements.forEach(elementCase => {
                this.processStatement(elementCase);
            });
        });

        this.writer.EndBlock();
    }

    private processBlock(node: ts.Block): void {
        this.writer.BeginBlock();

        node.statements.forEach(element => {
            this.processStatement(element);
        });

        this.writer.EndBlock();
    }

    private processModuleBlock(node: ts.ModuleBlock): void {
        node.statements.forEach(s => {
            this.processStatement(s);
        });
    }

    private processBooleanLiteral(node: ts.BooleanLiteral): void {
        // find if you need to box value
        let currentNode: ts.Expression = node;
        while (currentNode && currentNode.parent && currentNode.parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
            currentNode = <ts.Expression>currentNode.parent;
        }

        let boxing = false;
        if (currentNode && currentNode.parent && currentNode.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            boxing = true;
        }

        if (boxing) {
            this.writer.writeString('boolean(');
        }

        this.writer.writeString(`${node.kind === ts.SyntaxKind.TrueKeyword ? 'true' : 'false'}`);

        if (boxing) {
            this.writer.writeString(')');
        }
    }

    private processNullLiteral(node: ts.NullLiteral): void {
        this.writer.writeString('null');
    }

    private processNumericLiteral(node: ts.NumericLiteral): void {
        const val = parseInt(node.text, 10);
        const isNegative = node.parent
            && node.parent.kind === ts.SyntaxKind.PrefixUnaryExpression
            && (<ts.PrefixUnaryExpression>node.parent).operator === ts.SyntaxKind.MinusToken;
        let suffix = '';
        if (isNegative && val >= 2147483648) {
            suffix = 'll';
        }

        // find if you need to box value
        let currentNode: ts.Expression = node;
        if (isNegative) {
            currentNode = <ts.Expression>currentNode.parent;
        }

        while (currentNode && currentNode.parent && currentNode.parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
            currentNode = <ts.Expression>currentNode.parent;
        }

        let boxing = false;
        if (currentNode && currentNode.parent && currentNode.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            boxing = true;
        }

        if (boxing) {
            this.writer.writeString('number(');
        }

        this.writer.writeString(`${node.text}${suffix}`);

        if (boxing) {
            this.writer.writeString(')');
        }
    }

    private processStringLiteral(node: ts.StringLiteral | ts.LiteralLikeNode
        | ts.TemplateHead | ts.TemplateMiddle | ts.TemplateTail): void {
        this.writer.writeString(`"${node.text}"_S`);
    }

    private processNoSubstitutionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral): void {
        this.processStringLiteral(<ts.StringLiteral><any>node);
    }

    private processTemplateExpression(node: ts.TemplateExpression): void {
        this.processStringLiteral(node.head);
        node.templateSpans.forEach(element => {
            this.writer.writeString(' + ');
            if (element.expression.kind === ts.SyntaxKind.BinaryExpression) {
                this.writer.writeString('(');
            }

            this.processExpression(element.expression);

            if (element.expression.kind === ts.SyntaxKind.BinaryExpression) {
                this.writer.writeString(')');
            }

            this.writer.writeString(' + ');
            this.processStringLiteral(element.literal);
        });
    }

    private processRegularExpressionLiteral(node: ts.RegularExpressionLiteral): void {
        this.writer.writeString('(new RegExp(');
        this.processStringLiteral(<ts.LiteralLikeNode>{ text: node.text.substring(1, node.text.length - 2) });
        this.writer.writeString('))');
    }

    private processObjectLiteralExpression(node: ts.ObjectLiteralExpression): void {
        let next = false;

        const hasSpreadAssignment = node.properties.some(e => e.kind === ts.SyntaxKind.SpreadAssignment);

        if (hasSpreadAssignment) {
            this.writer.writeString('Utils::assign(');
        }

        this.writer.writeString('object');
        if (node.properties.length !== 0) {
            this.writer.BeginBlock();
            node.properties.forEach(element => {
                if (next && element.kind !== ts.SyntaxKind.SpreadAssignment) {
                    this.writer.writeStringNewLine(', ');
                }

                if (element.kind === ts.SyntaxKind.PropertyAssignment) {
                    const property = <ts.PropertyAssignment>element;

                    this.writer.writeString('object::pair{');

                    if (property.name
                        && (property.name.kind === ts.SyntaxKind.Identifier
                            || property.name.kind === ts.SyntaxKind.NumericLiteral)) {
                        this.processExpression(ts.createStringLiteral(property.name.text));
                    } else {
                        this.processExpression(<ts.Expression>property.name);
                    }

                    this.writer.writeString(', ');
                    this.processExpression(property.initializer);
                    this.writer.writeString('}');
                } else if (element.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
                    const property = <ts.ShorthandPropertyAssignment>element;

                    this.writer.writeString('object::pair{');

                    if (property.name
                        && (property.name.kind === ts.SyntaxKind.Identifier
                            || property.name.kind === ts.SyntaxKind.NumericLiteral)) {
                        this.processExpression(ts.createStringLiteral(property.name.text));
                    } else {
                        this.processExpression(<ts.Expression>property.name);
                    }

                    this.writer.writeString(', ');
                    if (property.name
                        && (property.name.kind === ts.SyntaxKind.Identifier
                            || property.name.kind === ts.SyntaxKind.NumericLiteral)) {
                        this.processExpression(ts.createStringLiteral(property.name.text));
                    } else {
                        this.processExpression(<ts.Expression>property.name);
                    }

                    this.writer.writeString('}');
                }

                next = true;
            });

            this.writer.EndBlock(true);
        } else {
            this.writer.writeString('{}');
        }

        if (hasSpreadAssignment) {
            node.properties.forEach(element => {
                if (element.kind === ts.SyntaxKind.SpreadAssignment) {
                    this.writer.writeString(', ');
                    const spreadAssignment = <ts.SpreadAssignment>element;
                    this.processExpression(spreadAssignment.expression);
                }
            });
            this.writer.writeString(')');
        }
    }

    private processArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
        let next = false;

        let isTuple = false;
        const type = this.resolver.typeToTypeNode(this.resolver.getOrResolveTypeOf(node));
        if (type.kind === ts.SyntaxKind.TupleType) {
            isTuple = true;
        }

        let elementsType = (<any>node).parent.type;
        if (!elementsType) {
            if (node.elements.length !== 0) {
                elementsType = this.resolver.typeToTypeNode(this.resolver.getTypeAtLocation(node.elements[0]));
            }
        } else {
            if (elementsType.elementType) {
                elementsType = elementsType.elementType;
            } else if (elementsType.typeArguments && elementsType.typeArguments[0]) {
                elementsType = elementsType.typeArguments[0];
            }
        }

        if (!isTuple) {
           this.writer.writeString('array');
        }

        if (node.elements.length !== 0) {
            this.writer.BeginBlockNoIntent();
            node.elements.forEach(element => {
                if (next) {
                    this.writer.writeString(', ');
                }

                this.processExpression(element);

                next = true;
            });

            this.writer.EndBlockNoIntent();
        } else {
            this.writer.writeString('()');
        }
    }

    private processElementAccessExpression(node: ts.ElementAccessExpression): void {

        const symbolInfo = this.resolver.getSymbolAtLocation(node.expression);
        const type = this.resolver.typeToTypeNode(this.resolver.getOrResolveTypeOf(node.expression));
        if (type && type.kind === ts.SyntaxKind.TupleType) {
            // tuple
            if (node.argumentExpression.kind !== ts.SyntaxKind.NumericLiteral) {
                throw new Error('Not implemented');
            }

            this.writer.writeString('std::get<');
            this.processExpression(node.argumentExpression);
            this.writer.writeString('>(');
            this.processExpression(node.expression);
            this.writer.writeString(')');
        } else {
            let isWriting = false;
            let dereference = true;
            if (node.parent.kind === ts.SyntaxKind.BinaryExpression) {
                const binaryExpression = <ts.BinaryExpression>node.parent;
                isWriting = binaryExpression.operatorToken.kind === ts.SyntaxKind.EqualsToken
                    && binaryExpression.left === node;
            }

            dereference = type
                && type.kind !== ts.SyntaxKind.TypeLiteral
                && type.kind !== ts.SyntaxKind.StringKeyword
                && type.kind !== ts.SyntaxKind.ArrayType
                && type.kind !== ts.SyntaxKind.AnyKeyword
                && symbolInfo
                && symbolInfo.valueDeclaration
                && !(<ts.ParameterDeclaration>symbolInfo.valueDeclaration).dotDotDotToken;
            if (dereference) {
                this.writer.writeString('(*');
            }

            if (!isWriting) {
                this.writer.writeString('const_(');
            }

            this.processExpression(node.expression);

            if (!isWriting) {
                this.writer.writeString(')');
            }

            if (dereference) {
                this.writer.writeString(')');
            }

            this.writer.writeString('[');
            this.processExpression(node.argumentExpression);
            this.writer.writeString(']');
        }
    }

    private processParenthesizedExpression(node: ts.ParenthesizedExpression) {
        this.writer.writeString('(');
        this.processExpression(node.expression);
        this.writer.writeString(')');
    }

    private processTypeAssertionExpression(node: ts.TypeAssertion) {
        this.processExpression(node.expression);
    }

    private processPrefixUnaryExpression(node: ts.PrefixUnaryExpression): void {

        const op = this.opsMap[node.operator];
        const isFunction = op.substr(0, 2) === '__';
        if (isFunction) {
            this.writer.writeString(op.substr(2) + '(');
        } else {
            this.writer.writeString(op);
        }

        this.processExpression(node.operand);

        if (isFunction) {
            this.writer.writeString(')');
        }
    }

    private processPostfixUnaryExpression(node: ts.PostfixUnaryExpression): void {
        this.processExpression(node.operand);
        this.writer.writeString(this.opsMap[node.operator]);
    }

    private processConditionalExpression(node: ts.ConditionalExpression): void {

        const whenTrueType = this.resolver.getOrResolveTypeOfAsTypeNode(node.whenTrue);
        const whenFalseType = this.resolver.getOrResolveTypeOfAsTypeNode(node.whenFalse);
        const equals = this.compareTypes(whenTrueType, whenFalseType);

        this.writer.writeString('(');
        this.processExpression(node.condition);
        this.writer.writeString(') ? ');
        if (!equals) {
            this.writer.writeString('any(');
        }

        this.processExpression(node.whenTrue);
        if (!equals) {
            this.writer.writeString(')');
        }

        this.writer.writeString(' : ');
        if (!equals) {
            this.writer.writeString('any(');
        }

        this.processExpression(node.whenFalse);
        if (!equals) {
            this.writer.writeString(')');
        }
    }

    private processBinaryExpression(node: ts.BinaryExpression): void {
        const opCode = node.operatorToken.kind;
        if (opCode === ts.SyntaxKind.InstanceOfKeyword) {
            this.writer.writeString('is<');

            if (node.right.kind === ts.SyntaxKind.Identifier) {
                const identifier = <ts.Identifier>node.right;
                switch (identifier.text) {
                    case 'Number':
                    case 'String':
                    case 'Boolean':
                        this.writer.writeString('js::');
                        this.writer.writeString(identifier.text.toLocaleLowerCase());
                        break;
                    default:
                        this.processExpression(node.right);
                        break;
                }
            } else {
                this.processExpression(node.right);
            }

            this.writer.writeString('>(');
            this.processExpression(node.left);
            this.writer.writeString(')');
            return;
        }

        const wrapIntoRoundBrackets =
            opCode === ts.SyntaxKind.AmpersandAmpersandToken
            || opCode === ts.SyntaxKind.BarBarToken;
        const op = this.opsMap[node.operatorToken.kind];
        const isFunction = op.substr(0, 2) === '__';
        if (isFunction) {
            this.writer.writeString(op.substr(2) + '(');
        }

        if (wrapIntoRoundBrackets) {
            this.writer.writeString('(');
        }

        this.processExpression(node.left);

        if (wrapIntoRoundBrackets) {
            this.writer.writeString(')');
        }

        if (isFunction) {
            this.writer.writeString(', ');
        } else {
            this.writer.writeString(' ' + op + ' ');
        }

        if (wrapIntoRoundBrackets) {
            this.writer.writeString('(');
        }

        this.processExpression(node.right);

        if (wrapIntoRoundBrackets) {
            this.writer.writeString(')');
        }

        if (isFunction) {
            this.writer.writeString(')');
        }
    }

    private processDeleteExpression(node: ts.DeleteExpression): void {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccess = <ts.PropertyAccessExpression>node.expression;
            this.processExpression(propertyAccess.expression);
            this.writer.writeString('.Delete("');
            this.processExpression(<ts.Identifier>propertyAccess.name);
            this.writer.writeString('")');
        } else if (node.expression.kind === ts.SyntaxKind.ElementAccessExpression) {
            const elementAccessExpression = <ts.ElementAccessExpression>node.expression;
            this.processExpression(elementAccessExpression.expression);
            this.writer.writeString('.Delete(');
            this.processExpression(elementAccessExpression.argumentExpression);
            this.writer.writeString(')');
        } else {
            throw new Error('Method not implemented.');
        }
    }

    private processNewExpression(node: ts.NewExpression): void {
        if (node.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            this.writer.writeString('(');
        }

        this.processCallExpression(node);

        if (node.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            this.writer.writeString(')');
        }
    }

    private processCallExpression(node: ts.CallExpression | ts.NewExpression): void {

        if (node.kind === ts.SyntaxKind.NewExpression) {
            this.writer.writeString('std::make_shared<');
        }

        this.processExpression(node.expression);

        this.processTemplateArguments(node);

        if (node.kind === ts.SyntaxKind.NewExpression) {
            // closing template
            this.writer.writeString('>');
        }

        this.writer.writeString('(');

        let next = false;
        if (node.arguments.length) {
            node.arguments.forEach(element => {
                if (next) {
                    this.writer.writeString(', ');
                }

                this.processExpression(element);
                next = true;
            });
        }

        this.writer.writeString(')');
    }

    private processThisExpression(node: ts.ThisExpression): void {

        const method = this.scope[this.scope.length - 1];
        if (method
            && (this.isClassMemberDeclaration(method) || this.isClassMemberSignature(method))
            && this.isStatic(method)) {
            const classNode = <ts.ClassDeclaration>this.scope[this.scope.length - 2];
            if (classNode) {
                const identifier = classNode.name;
                this.writer.writeString(identifier.text);
                return;
            }
        }

        this.writer.writeString('this');
    }

    private processSuperExpression(node: ts.SuperExpression): void {
        if (node.parent.kind === ts.SyntaxKind.CallExpression) {
            const classNode = <ts.ClassDeclaration>this.scope[this.scope.length - 2];
            if (classNode) {
                const heritageClause = classNode.heritageClauses[0];
                if (heritageClause) {
                    const firstType = heritageClause.types[0];
                    if (firstType.expression.kind === ts.SyntaxKind.Identifier) {
                        const identifier = <ts.Identifier>firstType.expression;
                        this.writer.writeString(identifier.text);
                        return;
                    }
                }
            }
        }

        this.writer.writeString('__super');
    }

    private processVoidExpression(node: ts.VoidExpression): void {
        this.writer.writeString('Void(');
        this.processExpression(node.expression);
        this.writer.writeString(')');
    }

    private processNonNullExpression(node: ts.NonNullExpression): void {
        this.processExpression(node.expression);
    }

    private processAsExpression(node: ts.AsExpression): void {
        this.writer.writeString('(');
        this.processType(node.type);
        this.writer.writeString(')');
        this.processExpression(node.expression);
    }

    private processSpreadElement(node: ts.SpreadElement): void {
        if (node.parent && node.parent.kind === ts.SyntaxKind.CallExpression) {
            const info = this.resolver.getSymbolAtLocation((<ts.CallExpression>node.parent).expression);
            const parameters = (<ts.FunctionDeclaration>info.valueDeclaration).parameters;
            if (parameters) {
                let next = false;
                parameters.forEach((item, index) => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    const elementAccess = ts.createElementAccess(node.expression, index);
                    this.processExpression(this.fixupParentReferences(elementAccess, node.parent));
                    next = true;
                });
            }
        } else {
            this.processExpression(node.expression);
        }
    }

    private processAwaitExpression(node: ts.AwaitExpression): void {
        /* TODO: finish it */
    }

    private processIdentifier(node: ts.Identifier): void {
        // fix issue with 'continue'
        if (node.text === 'continue'
            || node.text === 'catch') {
            this.writer.writeString('_');
        }

        this.writer.writeString(node.text);
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {

        const typeInfo = this.resolver.getOrResolveTypeOf(node.expression);
        const symbolInfo = this.resolver.getSymbolAtLocation(node.name);
        const methodAccess = symbolInfo
            && symbolInfo.valueDeclaration.kind === ts.SyntaxKind.MethodDeclaration
            && node.parent.kind !== ts.SyntaxKind.CallExpression;
        const getAccess = symbolInfo
            && symbolInfo.declarations
            && symbolInfo.declarations.length > 0
            && (symbolInfo.declarations[0].kind === ts.SyntaxKind.GetAccessor
                || symbolInfo.declarations[0].kind === ts.SyntaxKind.SetAccessor)
            || node.name.text === 'length' && this.resolver.isArrayOrStringType(typeInfo);

        if (methodAccess) {
            this.writer.writeString('std::bind(&');
            if (node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
                const valueDeclaration = <ts.ClassDeclaration>symbolInfo.valueDeclaration.parent;
                this.processExpression(<ts.Identifier>valueDeclaration.name);
            }

            this.writer.writeString('::');
            this.processExpression(<ts.Identifier>node.name);
            this.writer.writeString(', ');
            this.processExpression(node.expression);
            this.writer.writeString(')');
        } else {
            if (node.expression.kind === ts.SyntaxKind.NewExpression
                || node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                this.writer.writeString('(');
            }

            // field access
            this.processExpression(node.expression);

            if (node.expression.kind === ts.SyntaxKind.NewExpression
                || node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                this.writer.writeString(')');
            }

            if (this.resolver.isAnyLikeType(typeInfo)) {
                this.writer.writeString('["');
                this.processExpression(<ts.Identifier>node.name);
                this.writer.writeString('"]');
                return;
            } else if (this.resolver.isStaticAccess(typeInfo)
                || node.expression.kind === ts.SyntaxKind.SuperKeyword
                || typeInfo && typeInfo.symbol && typeInfo.symbol.valueDeclaration
                    && typeInfo.symbol.valueDeclaration.kind === ts.SyntaxKind.ModuleDeclaration) {
                this.writer.writeString('::');
            } else {
                this.writer.writeString('->');
            }

            if (getAccess) {
                if ((<any>node).__set === true) {
                    this.writer.writeString('set_');
                } else {
                    this.writer.writeString('get_');
                }
            }

            this.processExpression(<ts.Identifier>node.name);

            if (getAccess && (<any>node).__set !== true) {
                this.writer.writeString('()');
            }
        }
    }
}


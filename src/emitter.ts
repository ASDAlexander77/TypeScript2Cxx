import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { Helpers } from './helpers';
import { Preprocessor } from './preprocessor';
import { TypeInfo } from './typeInfo';
import { CodeWriter } from './codewriter';

export class Emitter {
    public writer: CodeWriter;
    private resolver: IdentifierResolver;
    private preprocessor: Preprocessor;
    private typeInfo: TypeInfo;
    private sourceFileName: string;
    private filePathCpp: string;
    private jsLib: boolean;

    public constructor(
        typeChecker: ts.TypeChecker, private options: ts.CompilerOptions,
        private cmdLineOptions: any, private singleModule: boolean, private rootFolder?: string) {

        this.resolver = new IdentifierResolver(typeChecker);
        this.typeInfo = new TypeInfo(this.resolver);
        this.preprocessor = new Preprocessor(this.resolver, this.typeInfo);

        this.jsLib = (
            options
            && options.lib
            && options.lib.some(l => /lib.es\d+.d.ts/.test(l))
            && !options.lib.some(l => /lib.es5.d.ts/.test(l))
            || cmdLineOptions.jslib)
            ? true
            : false;
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
            case ts.SyntaxKind.SourceFile: this.processFile(<ts.SourceFile>node);
                break;
            case ts.SyntaxKind.Bundle: this.processBundle(<ts.Bundle>node);
                break;
            case ts.SyntaxKind.UnparsedSource: this.processUnparsedSource(<ts.UnparsedSource>node);
                break;
            default:
                // TODO: finish it
                throw new Error('Method not implemented.');
        }
    }

    public save() {
        throw new Error('Method not implemented.');
    }

    private processFunction(
        location: ts.Node,
        statements: ts.NodeArray<ts.Statement>,
        parameters: ts.NodeArray<ts.ParameterDeclaration>): void {

        this.processFunctionWithinContext(location, statements, parameters);
    }

    private processFunctionWithinContext(
        location: ts.Node,
        statements: ts.NodeArray<ts.Statement>,
        parameters: ts.NodeArray<ts.ParameterDeclaration>) {

        statements.forEach(s => {
            this.processStatement(s);
        });
    }

    private processFile(sourceFile: ts.SourceFile): void {
        this.sourceFileName = sourceFile.fileName;
        this.processFunctionWithinContext(sourceFile, sourceFile.statements, <any>[]);
    }

    private processBundle(bundle: ts.Bundle): void {
        throw new Error('Method not implemented.');
    }

    private processUnparsedSource(unparsedSource: ts.UnparsedSource): void {
        throw new Error('Method not implemented.');
    }

    private processStatement(node: ts.Statement): void {
        this.processStatementInternal(node);
    }

    private processStatementInternal(nodeIn: ts.Statement): void {
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
            case ts.SyntaxKind.ExportDeclaration: this.processExportDeclaration(<ts.ExportDeclaration>node); return;
            case ts.SyntaxKind.ImportDeclaration: this.processImportDeclaration(<ts.ImportDeclaration>node); return;
            case ts.SyntaxKind.ModuleDeclaration: this.processModuleDeclaration(<ts.ModuleDeclaration>node); return;
            case ts.SyntaxKind.NamespaceExportDeclaration: this.processNamespaceDeclaration(<ts.NamespaceDeclaration>node); return;
            case ts.SyntaxKind.InterfaceDeclaration: /*nothing to do*/ return;
            case ts.SyntaxKind.TypeAliasDeclaration: /*nothing to do*/ return;
            case ts.SyntaxKind.ExportAssignment: /*nothing to do*/ return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpression(nodeIn: ts.Expression): void {
        const node = this.preprocessor.preprocessExpression(nodeIn);

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
            case ts.SyntaxKind.Identifier: this.processIndentifier(<ts.Identifier>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
    }

    private processExpressionStatement(node: ts.ExpressionStatement): void {
        this.processExpression(node.expression);
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
            // allows us to quickly bail out of setting parents for subtrees during incremental
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
        // nneded to make typeChecker to work properly
        (<any>ts).bindSourceFile(sourceFile, opts);
        return sourceFile.statements;
    }

    private processTSNode(node: ts.Node, transformText?: (string) => string) {
        const statements = this.transpileTSNode(node, transformText);
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
        throw new Error('Method not implemented.');
    }

    private processThrowStatement(node: ts.ThrowStatement): void {
        throw new Error('Method not implemented.');
    }

    private processTypeOfExpression(node: ts.TypeOfExpression): void {
        throw new Error('Method not implemented.');
    }

    private processDebuggerStatement(node: ts.DebuggerStatement): void {
        throw new Error('Method not implemented.');
    }

    private processEnumDeclaration(node: ts.EnumDeclaration): void {
        throw new Error('Method not implemented.');
    }

    private processClassDeclaration(node: ts.ClassDeclaration): void {
        throw new Error('Method not implemented.');
    }

    private processModuleDeclaration(node: ts.ModuleDeclaration): void {
        this.processStatement(<ts.ModuleBlock>node.body);
    }

    private processNamespaceDeclaration(node: ts.NamespaceDeclaration): void {
        this.processModuleDeclaration(node);
    }

    private processExportDeclaration(node: ts.ExportDeclaration): void {
        this.processTSNode(node);
    }

    private processImportDeclaration(node: ts.ImportDeclaration): void {
        throw new Error('Method not implemented.');
    }

    private processVariableDeclarationList(declarationList: ts.VariableDeclarationList, isExport?: boolean): void {
        declarationList.declarations.forEach(
            d => this.processVariableDeclarationOne(
                <ts.Identifier>d.name, d.initializer, Helpers.isConstOrLet(declarationList), isExport));
    }

    private processVariableDeclarationOne(name: ts.Identifier, initializer: ts.Expression, isLetOrConst: boolean, isExport?: boolean) {
        const nameText: string = name.text;
        throw new Error('Method not implemented.');
    }

    private processVariableStatement(node: ts.VariableStatement): void {
        const isExport = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        this.processVariableDeclarationList(node.declarationList, isExport);
    }

    private processFunctionExpression(node: ts.FunctionExpression): void {
        throw new Error('Method not implemented.');
    }

    private processArrowFunction(node: ts.ArrowFunction): void {
        if (node.body.kind !== ts.SyntaxKind.Block) {
            // create body
            node.body = ts.createBlock([ts.createReturn(<ts.Expression>node.body)]);
        }

        this.processFunctionExpression(<any>node);
    }

    private processFunctionDeclaration(node: ts.FunctionDeclaration): void {
        if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) {
            // skip it, as it is only declaration
            return;
        }

        this.processFunctionExpression(<ts.FunctionExpression><any>node);
    }

    private processReturnStatement(node: ts.ReturnStatement): void {
        throw new Error('Method not implemented.');
    }

    private processIfStatement(node: ts.IfStatement): void {
        this.processExpression(node.expression);

        this.processStatement(node.thenStatement);

        if (node.elseStatement) {
            this.processStatement(node.elseStatement);
        }
    }

    private processDoStatement(node: ts.DoStatement): void {
        throw new Error('Method not implemented.');
    }

    private processWhileStatement(node: ts.WhileStatement): void {
        throw new Error('Method not implemented.');
    }

    private processForStatement(node: ts.ForStatement): void {
        throw new Error('Method not implemented.');
    }

    private processForInStatement(node: ts.ForInStatement): void {
        this.processForInStatementNoScope(node);
    }

    private processForInStatementNoScope(node: ts.ForInStatement): void {
        throw new Error('Method not implemented.');
    }

    private processForOfStatement(node: ts.ForOfStatement): void {
        throw new Error('Method not implemented.');
    }

    private processBreakStatement(node: ts.BreakStatement) {
        throw new Error('Method not implemented.');
    }

    private processContinueStatement(node: ts.ContinueStatement) {
        throw new Error('Method not implemented.');
    }

    private processSwitchStatement(node: ts.SwitchStatement) {
        throw new Error('Method not implemented.');
    }

    private processBlock(node: ts.Block): void {
        throw new Error('Method not implemented.');
    }

    private processModuleBlock(node: ts.ModuleBlock): void {
        node.statements.forEach(s => {
            this.processStatement(s);
        });
    }

    private processBooleanLiteral(node: ts.BooleanLiteral): void {
        throw new Error('Method not implemented.');
    }

    private processNullLiteral(node: ts.NullLiteral): void {
        throw new Error('Method not implemented.');
    }

    private processNumericLiteral(node: ts.NumericLiteral): void {
        throw new Error('Method not implemented.');
    }

    private processStringLiteral(node: ts.StringLiteral): void {
        throw new Error('Method not implemented.');
    }

    private processNoSubstitutionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral): void {
        this.processStringLiteral(<ts.StringLiteral><any>node);
    }

    private processTemplateExpression(node: ts.TemplateExpression): void {
        this.processTSNode(node);
    }

    private processRegularExpressionLiteral(node: ts.RegularExpressionLiteral): void {
        throw new Error('Method not implemented.');
    }

    private processObjectLiteralExpression(node: ts.ObjectLiteralExpression): void {
        throw new Error('Method not implemented.');
    }

    private processArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
        throw new Error('Method not implemented.');
    }

    private processElementAccessExpression(node: ts.ElementAccessExpression): void {
        throw new Error('Method not implemented.');
    }

    private processParenthesizedExpression(node: ts.ParenthesizedExpression) {
        this.processExpression(node.expression);
    }

    private processTypeAssertionExpression(node: ts.TypeAssertion) {
        this.processExpression(node.expression);
    }

    private processPrefixUnaryExpression(node: ts.PrefixUnaryExpression): void {
        throw new Error('Method not implemented.');
    }

    private processPostfixUnaryExpression(node: ts.PostfixUnaryExpression): void {
        throw new Error('Method not implemented.');
    }

    private processConditionalExpression(node: ts.ConditionalExpression): void {
        throw new Error('Method not implemented.');
    }

    private processBinaryExpression(node: ts.BinaryExpression): void {
        throw new Error('Not Implemented');
    }

    private processDeleteExpression(node: ts.DeleteExpression): void {
        throw new Error('Method not implemented.');
    }

    private processNewExpression(node: ts.NewExpression): void {
        throw new Error('Method not implemented.');
    }

    private processCallExpression(node: ts.CallExpression): void {
        throw new Error('Method not implemented.');
    }

    private processThisExpression(node: ts.ThisExpression): void {
        throw new Error('Method not implemented.');
    }

    private processSuperExpression(node: ts.SuperExpression): void {
        throw new Error('Method not implemented.');
    }

    private processVoidExpression(node: ts.VoidExpression): void {
        throw new Error('Method not implemented.');
    }

    private processNonNullExpression(node: ts.NonNullExpression): void {
        this.processExpression(node.expression);
    }

    private processAsExpression(node: ts.AsExpression): void {
        this.processExpression(node.expression);
    }

    private processSpreadElement(node: ts.SpreadElement): void {
        throw new Error('Method not implemented.');
    }

    private processAwaitExpression(node: ts.AwaitExpression): void {
        throw new Error('Method not implemented.');
    }

    private processIndentifier(node: ts.Identifier): void {
        throw new Error('Method not implemented.');
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        throw new Error('Method not implemented.');
    }
}

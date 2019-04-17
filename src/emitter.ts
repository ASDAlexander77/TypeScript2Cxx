import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { Helpers } from './helpers';
import { Preprocessor } from './preprocessor';
import { CodeWriter } from './codewriter';
import { Interface } from 'readline';

export class Emitter {
    public writer: CodeWriter;
    private resolver: IdentifierResolver;
    private preprocessor: Preprocessor;
    private sourceFileName: string;
    private jsLib: boolean;
    private scope: Array<ts.Node> = new Array<ts.Node>();
    private opsMap: Map<number, string> = new Map<number, string>();

    public constructor(
        typeChecker: ts.TypeChecker, private options: ts.CompilerOptions,
        private cmdLineOptions: any, private singleModule: boolean, private rootFolder?: string) {

        this.writer = new CodeWriter();
        this.resolver = new IdentifierResolver(typeChecker);
        this.preprocessor = new Preprocessor(this.resolver);

        this.opsMap[ts.SyntaxKind.EqualsToken] = '=';
        this.opsMap[ts.SyntaxKind.PlusToken] = '+';
        this.opsMap[ts.SyntaxKind.MinusToken] = '-';
        this.opsMap[ts.SyntaxKind.AsteriskToken] = '*';
        this.opsMap[ts.SyntaxKind.PercentToken] = '%';
        this.opsMap[ts.SyntaxKind.AsteriskAsteriskToken] = '__POW';
        this.opsMap[ts.SyntaxKind.SlashToken] = '/';
        this.opsMap[ts.SyntaxKind.AmpersandToken] = '&';
        this.opsMap[ts.SyntaxKind.BarToken] = '|';
        this.opsMap[ts.SyntaxKind.CaretToken] = '^';
        this.opsMap[ts.SyntaxKind.LessThanLessThanToken] = '<<';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanToken] = '>>';
        this.opsMap[ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken] = '__ShiftRightInt';
        this.opsMap[ts.SyntaxKind.EqualsEqualsToken] = '__EQUALS';
        this.opsMap[ts.SyntaxKind.EqualsEqualsEqualsToken] = '==';
        this.opsMap[ts.SyntaxKind.LessThanToken] = '<';
        this.opsMap[ts.SyntaxKind.LessThanEqualsToken] = '<=';
        this.opsMap[ts.SyntaxKind.ExclamationEqualsToken] = '__NOT_EQUALS';
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

        this.opsMap[ts.SyntaxKind.TildeToken] = '~';
        this.opsMap[ts.SyntaxKind.ExclamationToken] = '!';
        this.opsMap[ts.SyntaxKind.PlusPlusToken] = '++';
        this.opsMap[ts.SyntaxKind.MinusMinusToken] = '--';
        this.opsMap[ts.SyntaxKind.InKeyword] = '__IN';

        this.opsMap[ts.SyntaxKind.AmpersandAmpersandToken] = '__AND';
        this.opsMap[ts.SyntaxKind.BarBarToken] = '__OR';

        //this.opsMap[ts.SyntaxKind.InstanceOfKeyword] = '__InstanceOf';

        this.opsMap[ts.SyntaxKind.CommaToken] = ',';
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

    public save() {
        // TODO: ...
    }

    private declare(node: ts.Statement) {
        switch (node.kind) {
            case ts.SyntaxKind.EmptyStatement: return;
            case ts.SyntaxKind.VariableStatement:
                const declarationList = (<ts.VariableStatement>node).declarationList;
                this.writer.writeString('any');
                let next = false;
                declarationList.declarations.forEach(
                    d => {
                        if (d.name.kind === ts.SyntaxKind.Identifier) {
                            if (next) {
                                this.writer.writeString(',');
                            }

                            this.writer.writeString(' ');
                            this.processIndentifier(d.name);
                            next = true;
                        }
                    });

                this.writer.EndOfStatement();

                return;
            case ts.SyntaxKind.FunctionDeclaration:
                const functionDeclaration = <ts.FunctionDeclaration>node;
                this.writer.writeString('any ');
                this.processIndentifier(functionDeclaration.name);
                this.writer.EndOfStatement();
                return;
            case ts.SyntaxKind.ModuleBlock: /*implement*/ return;
            case ts.SyntaxKind.EnumDeclaration:
                const enumDeclaration = <ts.EnumDeclaration>node;
                this.writer.writeString('any ');
                this.processIndentifier(enumDeclaration.name);
                this.writer.EndOfStatement();
                return;
            case ts.SyntaxKind.ClassDeclaration:
                const classDeclaration = <ts.ClassDeclaration>node;
                this.writer.writeString('any ');
                this.processIndentifier(classDeclaration.name);
                this.writer.EndOfStatement();
                return;
            case ts.SyntaxKind.ExportDeclaration: /*implement*/ return;
            case ts.SyntaxKind.ImportDeclaration: /*implement*/ return;
            case ts.SyntaxKind.ModuleDeclaration: /*implement*/ return;
            case ts.SyntaxKind.NamespaceExportDeclaration: /*implement*/ return;
            case ts.SyntaxKind.InterfaceDeclaration: /*implement*/ return;
            case ts.SyntaxKind.TypeAliasDeclaration: /*implement*/ return;
            case ts.SyntaxKind.ExportAssignment: /*implement*/ return;
        }
    }

    private isDeclarationStatement(f: ts.Statement): boolean {
        if (f.kind === ts.SyntaxKind.FunctionDeclaration
            || f.kind === ts.SyntaxKind.EnumDeclaration
            || f.kind === ts.SyntaxKind.ClassDeclaration
            || f.kind === ts.SyntaxKind.VariableStatement) {
            return true;
        }

        return false;
    }

    private isLocalVarDeclaration(f: ts.Statement): boolean {
        if (f.kind === ts.SyntaxKind.VariableStatement) {
            const variableStatement = <ts.VariableStatement>f;
            return Helpers.isConstOrLet(variableStatement.declarationList);
        }

        return false;
    }

    private processFile(sourceFile: ts.SourceFile): void {
        this.sourceFileName = sourceFile.fileName;

        this.scope.push(sourceFile);

        // added header
        this.writer.writeStringNewLine(`#include "core.h"`);
        this.writer.writeStringNewLine('');
        this.writer.writeStringNewLine('using namespace js;');
        this.writer.writeStringNewLine('');

        sourceFile.statements.filter(s => this.isDeclarationStatement(s)).forEach(s => {
            this.processStatement(s);
        });

        this.writer.writeStringNewLine('');
        this.writer.writeStringNewLine('void Main(void)');
        this.writer.BeginBlock();

        sourceFile.statements.filter(s => !this.isDeclarationStatement(s)).forEach(s => {
            this.processStatement(s);
        });

        this.writer.EndBlock();

        this.writer.writeStringNewLine('');
        this.writer.writeStringNewLine('int main(int argc, char** argv)');
        this.writer.BeginBlock();
        this.writer.writeStringNewLine('Main();');
        this.writer.writeStringNewLine('return 0;');
        this.writer.EndBlock();

        this.scope.pop();
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

    private processDeclaration(node: ts.Declaration): void {
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration: this.processPropertyDeclaration(<ts.PropertyDeclaration>node); return;
            case ts.SyntaxKind.Parameter: this.processPropertyDeclaration(<ts.ParameterDeclaration>node); return;
            case ts.SyntaxKind.MethodDeclaration: this.processMethodDeclaration(<ts.MethodDeclaration>node); return;
            case ts.SyntaxKind.Constructor: this.processConstructorDeclaration(<ts.ConstructorDeclaration>node); return;
        }

        // TODO: finish it
        throw new Error('Method not implemented.');
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
        this.fixupParentReferences(sourceFile);
        // nneded to make typeChecker to work properly
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
            this.writer.writeStringNewLine('catch (const any& ');
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
            this.writer.writeString(' ');
            this.processExpression(node.expression);
        }

        this.writer.EndOfStatement();
    }

    private processTypeOfExpression(node: ts.TypeOfExpression): void {
        this.writer.writeString('TypeOf(');
        this.processExpression(node.expression);
        this.writer.writeString(')');
    }

    private processDebuggerStatement(node: ts.DebuggerStatement): void {
        this.writer.writeString('__asm { int 3 }');
    }

    private processEnumDeclaration(node: ts.EnumDeclaration): void {

        this.scope.push(node);

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
        this.processIndentifier(node.name);
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

        this.scope.pop();
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

    private processClassDeclaration(node: ts.ClassDeclaration): void {
        this.scope.push(node);

        this.writer.writeString('class ');
        this.processIndentifier(node.name);

        if (node.heritageClauses) {
            this.writer.writeString(' : ');
            let next = false;
            node.heritageClauses.forEach(heritageClause => {
                heritageClause.types.forEach(type => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    if (type.expression.kind === ts.SyntaxKind.Identifier) {
                        const identifier = <ts.Identifier>type.expression;
                        this.writer.writeString('public ');
                        this.writer.writeString(identifier.text);
                    } else {
                        throw new Error('Not implemented');
                    }

                    next = true;
                });
            });
        }

        this.writer.writeString(' ');
        this.writer.BeginBlock();
        this.writer.DecreaseIntent();
        this.writer.writeString('public:');
        this.writer.IncreaseIntent();
        this.writer.writeStringNewLine();

        if (!node.heritageClauses) {
            // to make base class polymorphic
            this.writer.writeStringNewLine('virtual void dummy() {};');
        }

        // declare all private parameters of constructors
        for (const item of node.members.filter(m => m.kind === ts.SyntaxKind.Constructor)) {
            const constructor = <ts.ConstructorDeclaration>item;
            for (const fieldAsParam of constructor.parameters
                        .filter(p => this.hasAccessModifier(p.modifiers))) {
                this.processDeclaration(fieldAsParam);
            }
        }

        for (const member of node.members) {
            this.processDeclaration(member);
        }

        this.writer.cancelNewLine();
        this.writer.cancelNewLine();

        this.writer.EndBlock();
        this.writer.EndOfStatement();

        this.scope.pop();
    }

    private processPropertyDeclaration(node: ts.PropertyDeclaration | ts.ParameterDeclaration): void {
        this.processModifiers(node.modifiers);
        this.processType(node.type);
        this.writer.writeString(' ');

        if (node.name.kind === ts.SyntaxKind.Identifier) {
            this.processExpression(node.name);
        } else {
            throw new Error('Not Implemented');
        }

        if (node.initializer) {
            this.writer.writeString(' = ');
            this.processExpression(node.initializer);
        }

        this.writer.EndOfStatement();
    }

    private processMethodDeclaration(node: ts.MethodDeclaration): void {
        this.processModifiers(node.modifiers);
        this.processFunctionDeclaration(<ts.FunctionDeclaration><any>node);
        this.writer.writeStringNewLine();
    }

    private processConstructorDeclaration(node: ts.ConstructorDeclaration): void {
        this.processModifiers(node.modifiers);
        this.processFunctionDeclaration(<ts.FunctionDeclaration><any>node);
        this.writer.writeStringNewLine();
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

    private isAlreadyDeclaredInGlobalScope(name: string) {
        return (<any>this.scope).declaredVars && (<any>this.scope).declaredVars.indexOf(name) >= 0;
    }

    private addToDeclaredInGlobalScope(name: string) {
        if (!(<any>this.scope).declaredVars) {
            (<any>this.scope).declaredVars = [];
        }

        return (<any>this.scope).declaredVars.push(name);
    }

    private isAlreadyDeclared(name: string) {
        const currentScope = (<any>this.scope[this.scope.length - 1]);
        return currentScope.declaredVars
            && currentScope.declaredVars.indexOf(name) >= 0;
    }

    private addToDeclared(name: string) {
        const currentScope = (<any>this.scope[this.scope.length - 1]);
        if (!(currentScope).declaredVars) {
            (currentScope).declaredVars = [];
        }

        return currentScope.declaredVars.push(name);
    }

    private processVariableDeclarationList(declarationList: ts.VariableDeclarationList): boolean {
        if (!((<any>declarationList).__ignore_type)) {
            if (Helpers.isConst(declarationList)) {
                this.writer.writeString('const ');
            }

            this.processType(declarationList.declarations[0].type, (declarationList.declarations[0].initializer) ? true : false);
            this.writer.writeString(' ');
        }

        const next = { next: false };
        let result = false;
        declarationList.declarations.forEach(
            d => result = this.processVariableDeclarationOne(
                <ts.Identifier>d.name, d.initializer, d.type, next) || result);

        return result;
    }

    private processVariableDeclarationOne(
        name: ts.Identifier, initializer: ts.Expression, type: ts.TypeNode, next?: { next: boolean }) {
        if (next && next.next) {
            this.writer.writeString(', ');
        }

        this.writer.writeString(name.text);
        this.addToDeclaredInGlobalScope(name.text);

        if (initializer) {
            this.writer.writeString(' = ');
            this.processExpression(initializer);
        } else {
            if (type && type.kind === ts.SyntaxKind.TupleType) {
                this.processDefaultValue(type);
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

    private processType(type: ts.TypeNode, auto: boolean = false): void {
        switch (type && type.kind) {
            case ts.SyntaxKind.BooleanKeyword:
                this.writer.writeString('boolean');
                break;
            case ts.SyntaxKind.NumberKeyword:
                this.writer.writeString('number');
                break;
            case ts.SyntaxKind.StringKeyword:
                this.writer.writeString('string');
                break;
            case ts.SyntaxKind.ArrayType:
                const arrayType = <ts.ArrayTypeNode>type;
                this.writer.writeString('ReadOnlyArray<');
                this.processType(arrayType.elementType, false);
                this.writer.writeString('>');
                break;
            case ts.SyntaxKind.TupleType:
                const tupleType = <ts.TupleTypeNode>type;

                this.writer.writeString('std::tuple<');

                let next = false;
                tupleType.elementTypes.forEach(element => {
                    if (next) {
                        this.writer.writeString(', ');
                    }

                    this.processType(element, false);
                    next = true;
                });

                this.writer.writeString('>');
                break;
            case ts.SyntaxKind.TypeReference:
                const typeReference = <ts.TypeReferenceNode>type;
                if (typeReference.typeName.kind === ts.SyntaxKind.Identifier) {
                    this.writer.writeString(typeReference.typeName.text);
                } else {
                    throw new Error('Not Implemented');
                }

                this.writer.writeString('<');

                let next1 = false;
                typeReference.typeArguments.forEach(element => {
                    if (next1) {
                        this.writer.writeString(', ');
                    }

                    this.processType(element, false);
                    next1 = true;
                });

                this.writer.writeString('>');
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
        node: ts.FunctionExpression | ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration | ts.ConstructorDeclaration): void {
        if (!node.body
            || ((<any>node).body.statements
                && (<any>node).body.statements.length === 0
                && ((<any>node).body.statements).isMissingList)) {
            // function without body;
            return;
        }

        const noReturn = !this.hasReturn(node);
        const noParams = node.parameters.length === 0 && !this.hasArguments(node);
        const noCapture = !this.requireCapture(node);

        const isFunctionOrMethodDeclaration = node.kind === ts.SyntaxKind.FunctionDeclaration
            || this.isClassMemberDeclaration(node);
        const isFunctionExpression = node.kind === ts.SyntaxKind.FunctionExpression;
        const isFunction = isFunctionOrMethodDeclaration || isFunctionExpression;
        const isArrowFunction = node.kind === ts.SyntaxKind.ArrowFunction;
        const writeAsLambdaCFunction = isArrowFunction || isFunction;

        if (writeAsLambdaCFunction) {
            if (isFunctionOrMethodDeclaration) {
                // type declaration
                if (node.kind !== ts.SyntaxKind.Constructor) {
                    this.writer.writeString('auto ');
                }

                // name
                if (node.name && node.name.kind === ts.SyntaxKind.Identifier) {
                    this.processExpression(node.name);
                } else {
                    // in case of constructor
                    const classNode = this.scope[this.scope.length - 2];
                    if (classNode && classNode.kind === ts.SyntaxKind.ClassDeclaration) {
                        this.processExpression((<ts.ClassDeclaration>classNode).name);
                    } else {
                        throw new Error('Not Implemeneted');
                    }
                }
            } else if (isArrowFunction || isFunctionExpression) {
                // lambda or noname function
                this.writer.writeString('[]');
            }

            // lambda
            if (isArrowFunction) {
                const byReference = (<any>node).__lambda_by_reference ? '&' : '=';
                // ...
            } else {
                // ...
            }
        }

        this.writer.writeString('(');

        let next = false;
        node.parameters.forEach(element => {
            if (element.name.kind !== ts.SyntaxKind.Identifier) {
                throw new Error('Not implemented');
            }

            if (next) {
                this.writer.writeString(', ');
            }

            if (element.dotDotDotToken) {
                // ...
            } else {
                this.processType(element.type);
                this.writer.writeString(' ');
                this.processExpression(element.name);

                // extra symbol to change parameter name
                if (node.kind === ts.SyntaxKind.Constructor
                    && this.hasAccessModifier(element.modifiers)) {
                    this.writer.writeString('_');
                }

                if (element.initializer) {
                    this.writer.writeString(' = ');
                    this.processExpression(element.initializer);
                } else if (element.questionToken) {
                    this.writer.writeString(' = undefined');
                }
            }

            next = true;
        });

        this.writer.writeString(')');

        if (writeAsLambdaCFunction && !noReturn) {
            this.writer.writeStringNewLine(' -> auto');
        } else {
            this.writer.writeStringNewLine();
        }

        // constructor init
        if (node.kind === ts.SyntaxKind.Constructor) {
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

            if (next) {
                this.writer.writeString(' ');
            }
        }

        this.writer.BeginBlock();

        (<any>node.body).statements.forEach(element => {
            this.processStatement(element);
        });

        this.writer.EndBlock();
    }

    private processArrowFunction(node: ts.ArrowFunction): void {
        if (node.body.kind !== ts.SyntaxKind.Block) {
            // create body
            node.body = ts.createBlock([ts.createReturn(<ts.Expression>node.body)]);
        }

        this.processFunctionExpression(<any>node);
    }

    private isClassMemberDeclaration(node: ts.Node) {
        return node.kind === ts.SyntaxKind.ClassDeclaration
            || node.kind === ts.SyntaxKind.Constructor
            || node.kind === ts.SyntaxKind.MethodDeclaration
            || node.kind === ts.SyntaxKind.PropertyDeclaration
            || node.kind === ts.SyntaxKind.GetAccessor
            || node.kind === ts.SyntaxKind.SetAccessor;
    }

    private processFunctionDeclaration(node: ts.FunctionDeclaration | ts.MethodDeclaration): void {
        if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DeclareKeyword)) {
            // skip it, as it is only declaration
            return;
        }

        this.scope.push(node);
        this.processFunctionExpression(<ts.FunctionExpression><any>node);
        this.scope.pop();

        if (!this.isClassMemberDeclaration(node)) {
            this.writer.EndOfStatement();
            this.writer.writeStringNewLine();
        }
    }

    private processReturnStatement(node: ts.ReturnStatement): void {
        this.writer.writeString('return');
        if (node.expression) {
            this.writer.writeString(' ');
            this.processExpression(node.expression);
        }

        this.writer.EndOfStatement();
    }

    private processIfStatement(node: ts.IfStatement): void {
        this.writer.writeString('if ');

        this.writer.writeString('(');
        this.processExpression(node.expression);
        this.writer.writeString(') ');

        this.processStatement(node.thenStatement);

        if (node.elseStatement) {
            this.writer.writeString('else ');
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
        this.writer.writeString(' : ');
        this.processExpression(node.expression);
        this.writer.writeStringNewLine('.keys())');
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
            this.processExpression((<ts.CaseClause>element).expression);
            this.writer.writeString(', ');
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
        this.writer.writeString(`${node.kind === ts.SyntaxKind.TrueKeyword ? 'true' : 'false'}`);
    }

    private processNullLiteral(node: ts.NullLiteral): void {
        this.writer.writeString('nullptr');
    }

    private processNumericLiteral(node: ts.NumericLiteral): void {
        this.writer.writeString(`${node.text}`);
    }

    private processStringLiteral(node: ts.StringLiteral): void {
        this.writer.writeString(`"${node.text}"_S`);
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
        let next = false;

        this.writer.writeString('object');
        if (node.properties.length !== 0) {
            this.writer.BeginBlock();
            node.properties.forEach(element => {
                if (next) {
                    this.writer.writeStringNewLine(', ');
                }

                if (element.kind === ts.SyntaxKind.SpreadAssignment) {
                    const spreadAssignment = <ts.SpreadAssignment>element;
                    this.processExpression(spreadAssignment.expression);
                } else if (element.kind === ts.SyntaxKind.PropertyAssignment) {
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
                }

                next = true;
            });

            this.writer.EndBlock(true);
        }
    }

    private processArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
        let next = false;

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
        }
    }

    private processElementAccessExpression(node: ts.ElementAccessExpression): void {

        const type = this.resolver.getOrResolveTypeOf(node.expression);
        if ((<any>type).typeArguments && !(<any>type).symbol) {
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
            this.processExpression(node.expression);
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
        this.writer.writeString(this.opsMap[node.operator]);
        this.processExpression(node.operand);
    }

    private processPostfixUnaryExpression(node: ts.PostfixUnaryExpression): void {
        this.processExpression(node.operand);
        this.writer.writeString(this.opsMap[node.operator]);
    }

    private processConditionalExpression(node: ts.ConditionalExpression): void {
        this.writer.writeString('(');
        this.processExpression(node.condition);
        this.writer.writeString(') ? ');
        this.processExpression(node.whenTrue);
        this.writer.writeString(' : ');
        this.processExpression(node.whenFalse);
    }

    private processBinaryExpression(node: ts.BinaryExpression): void {
        if (node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) {
            this.writer.writeString('is<');
            this.processExpression(node.right);
            this.writer.writeString('>(');
            this.processExpression(node.left);
            this.writer.writeString(')');
            return;
        }


        const op = this.opsMap[node.operatorToken.kind];
        const isFunction = op.substr(0, 2) === '__';
        if (isFunction) {
            this.writer.writeString(op.substr(2) + '(');
        }

        this.processExpression(node.left);

        if (isFunction) {
            this.writer.writeString(', ');
        } else {
            this.writer.writeString(' ' + op + ' ');
        }

        this.processExpression(node.right);

        if (isFunction) {
            this.writer.writeString(')');
        }
    }

    private processDeleteExpression(node: ts.DeleteExpression): void {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccess = <ts.PropertyAccessExpression>node.expression;
            this.processExpression(propertyAccess.expression);
            this.writer.writeString('.Delete("');
            this.processExpression(propertyAccess.name);
            this.writer.writeString('")');
        } else {
            throw new Error('Method not implemented.');
        }
    }

    private processNewExpression(node: ts.NewExpression): void {
        if (node.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            this.writer.writeString('(');
        }

        this.writer.writeString('new ');
        this.processCallExpression(node);

        if (node.parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
            this.writer.writeString(')');
        }
    }

    private processCallExpression(node: ts.CallExpression | ts.NewExpression): void {
        this.processExpression(node.expression);
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
        this.writer.writeString('this');
    }

    private processSuperExpression(node: ts.SuperExpression): void {
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
        this.processExpression(node.expression);
    }

    private processSpreadElement(node: ts.SpreadElement): void {
        this.writer.writeString('(paramsType) ');
        this.processExpression(node.expression);
    }

    private processAwaitExpression(node: ts.AwaitExpression): void {
        throw new Error('Method not implemented.');
    }

    private processIndentifier(node: ts.Identifier): void {
        this.writer.writeString(node.text);
    }

    private processPropertyAccessExpression(node: ts.PropertyAccessExpression): void {

        const typeInfo = this.resolver.getOrResolveTypeOf(node.expression);

        this.processExpression(node.expression);

        if (this.resolver.isAnyLikeType(typeInfo)) {
            this.writer.writeString('["');
            this.processExpression(node.name);
            this.writer.writeString('"]');
        } else if (this.resolver.isStaticAccess(typeInfo)) {
            this.writer.writeString('::');
            this.processExpression(node.name);
        } else if (this.resolver.isThisType(typeInfo)) {
            this.writer.writeString('->');
            this.processExpression(node.name);
        } else {
            // member access when type is known
            this.writer.writeString('.');
            this.processExpression(node.name);
        }
    }
}


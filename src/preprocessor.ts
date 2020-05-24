import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { toASCII } from 'punycode';
import { Emitter } from './emitter';

export class Preprocessor {

    public constructor(private resolver: IdentifierResolver, private emitter: Emitter) {
    }

    public preprocessStatement(node: ts.Declaration | ts.Statement): ts.Declaration | ts.Statement {
        if (!node) {
            return node;
        }

        switch (node.kind) {
            case ts.SyntaxKind.VariableStatement:
                return this.preprocessVariableStatement(<ts.VariableStatement>node);
            case ts.SyntaxKind.ClassDeclaration:
                return this.preprocessClassDeclaration(<ts.ClassDeclaration>node);
        }

        return node;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
        if (!node) {
            return node;
        }

        switch (node.kind) {
            case ts.SyntaxKind.BinaryExpression:
                return this.preprocessBinaryExpression(<ts.BinaryExpression>node);
            case ts.SyntaxKind.PropertyAccessExpression:
                return this.preprocessPropertyAccessExpression(<ts.PropertyAccessExpression>node);
        }

        return node;
    }

    private compareTypesOfParameters(p0: ts.ParameterDeclaration, p1: ts.ParameterDeclaration): boolean {
        if (p0 && !p1 || !p0 && p1) {
            return false;
        }

        if (p0.type && p1.type && p0.type.kind === p1.type.kind) {
            return true;
        }

        if (p0.initializer && p1.initializer && p0.initializer.kind === p1.initializer.kind) {
            return true;
        }

        return false;
    }

    private preprocessClassDeclaration(node: ts.ClassDeclaration): ts.Declaration | ts.Statement {

        const inheritance = node.heritageClauses && node.heritageClauses.filter(i => i.token === ts.SyntaxKind.ExtendsKeyword);
        if (!inheritance || inheritance.length === 0) {
            return node;
        }

        const firstType = inheritance[0].types[0];
        const type = this.resolver.getOrResolveTypeOf(firstType.expression);
        const baseClassDeclaration = <ts.ClassDeclaration>type.symbol.valueDeclaration;

        const constructors = <ts.ConstructorDeclaration[]>node.members
            .filter(m => m.kind === ts.SyntaxKind.Constructor);
        const baseConstructors = <ts.ConstructorDeclaration[]>baseClassDeclaration
            .members.filter(m => m.kind === ts.SyntaxKind.Constructor);

        baseConstructors
            .filter(e => constructors.findIndex(c => c.parameters.every((p, index) =>
                this.compareTypesOfParameters(e.parameters[index], p))) === -1)
            .forEach(element => {
            const c = ts.createConstructor(
                null,
                null,
                element.parameters.map(p => ts.createParameter(
                    p.decorators,
                    p.modifiers && p.modifiers.filter(m => m.kind !== ts.SyntaxKind.PrivateKeyword
                        && m.kind !== ts.SyntaxKind.ProtectedKeyword && m.kind !== ts.SyntaxKind.PublicKeyword),
                    p.dotDotDotToken,
                    p.name,
                    p.questionToken,
                    p.type,
                    p.initializer)),
                ts.createBlock(
                    [ts.createStatement(
                        ts.createCall(
                            ts.createSuper(),
                            null,
                            element.parameters.map(p => <ts.Identifier>p.name)))]));
            this.fixupParentReferences(c, node);
            (<any>node.members).push(c);
        });

        return node;
    }

    private preprocessVariableStatement(variableStatement: ts.VariableStatement): ts.Statement {
        const declaration0 = variableStatement.declarationList.declarations[0];
        const init = declaration0.initializer;
        if (init && init.kind === ts.SyntaxKind.FunctionExpression) {
            const funcExpr = <ts.FunctionExpression>init;
            if (this.emitter.isTemplate(funcExpr)) {
                const funcNode = ts.createFunctionDeclaration(
                    funcExpr.decorators,
                    funcExpr.modifiers,
                    undefined,
                    <ts.Identifier>declaration0.name,
                    funcExpr.typeParameters,
                    funcExpr.parameters,
                    funcExpr.type,
                    funcExpr.body);

                return funcNode;
            }
        }

        return variableStatement;
    }

    private preprocessBinaryExpression(node: ts.BinaryExpression) {

        switch (node.operatorToken.kind) {
            case ts.SyntaxKind.EqualsToken:

                if (node.left.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    const propertyAccess = <ts.PropertyAccessExpression>node.left;

                    const symbolInfo = this.resolver.getSymbolAtLocation(propertyAccess.name);
                    const getAccess = symbolInfo
                        && symbolInfo.declarations
                        && (symbolInfo.declarations.length > 0 && symbolInfo.declarations[0].kind === ts.SyntaxKind.SetAccessor
                            || symbolInfo.declarations.length > 1 && symbolInfo.declarations[1].kind === ts.SyntaxKind.SetAccessor)
                        || propertyAccess.name.text === 'length' && this.resolver.isArrayOrStringTypeFromSymbol(symbolInfo);

                    if (getAccess) {
                        const newCall = ts.createCall(node.left, null, [node.right]);
                        (<any>newCall.expression).__set = true;
                        return this.fixupParentReferences(newCall, node.parent);
                    }
                }

                break;
        }

        return node;
    }

    private preprocessPropertyAccessExpression(node: ts.PropertyAccessExpression): ts.Expression {
        let expression = <ts.Expression>node.expression;
        while (expression.kind === ts.SyntaxKind.ParenthesizedExpression) {
            expression = (<ts.ParenthesizedExpression>expression).expression;
        }

        const isConstValue = expression.kind ===
            ts.SyntaxKind.NumericLiteral
            || expression.kind === ts.SyntaxKind.StringLiteral
            || expression.kind === ts.SyntaxKind.TrueKeyword
            || expression.kind === ts.SyntaxKind.FalseKeyword;

        if (isConstValue) {
            (<any>expression).__boxing = true;
        }

        return node;
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
}

import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';
import { toASCII } from 'punycode';
import { Emitter } from './emitter';

export class Preprocessor {

    public constructor(private resolver: IdentifierResolver, private emitter: Emitter) {
    }

    public preprocessStatement(node: ts.Declaration | ts.Statement): ts.Declaration | ts.Statement {
        switch (node.kind) {
            case ts.SyntaxKind.VariableStatement:
                return this.preprocessVariableStatement(<ts.VariableStatement>node);
            case ts.SyntaxKind.ClassDeclaration:
                return this.preprocessClassDeclaration(<ts.ClassDeclaration>node);
        }

        return node;
    }

    private preprocessClassDeclaration(node: ts.ClassDeclaration): ts.Declaration | ts.Statement {

        const inheritance = node.heritageClauses && node.heritageClauses.filter(i => i.token === ts.SyntaxKind.ExtendsKeyword);
        if (!inheritance) {
            return node;
        }

        const firstType = inheritance[0].types[0];
        const type = this.resolver.getOrResolveTypeOf(firstType.expression);
        const baseClassDeclaration = <ts.ClassDeclaration>type.symbol.valueDeclaration;

        const constructors = <ts.ConstructorDeclaration[]>node.members.filter(m => m.kind === ts.SyntaxKind.Constructor);
        const baseConstructors = <ts.ConstructorDeclaration[]>baseClassDeclaration.members.filter(m => m.kind === ts.SyntaxKind.Constructor);

        baseConstructors
            .filter(e => constructors.findIndex(c => c.parameters.every((p, index) => e.parameters[index].name == p.name)) == -1)
            .forEach(element => {
            const c = ts.createConstructor(
                null,
                null,
                element.parameters,
                ts.createBlock(
                    [ts.createStatement(
                        ts.createCall(
                            ts.createSuper(),
                            null,
                            []))]));
            this.fixupParentReferences(c, node);
            (<any>node.members).push(c);
        });

        return node;
    }

    private preprocessVariableStatement(variableStatement: ts.VariableStatement): ts.Statement {
        const declr0 = variableStatement.declarationList.declarations[0];
        const init = declr0.initializer;
        if (init && init.kind === ts.SyntaxKind.FunctionExpression) {
            const funcExpr = <ts.FunctionExpression>init;
            if (this.emitter.isTemplate(funcExpr)) {
                const funcNode = ts.createFunctionDeclaration(
                    funcExpr.decorators,
                    funcExpr.modifiers,
                    undefined,
                    <ts.Identifier>declr0.name,
                    funcExpr.typeParameters,
                    funcExpr.parameters,
                    funcExpr.type,
                    funcExpr.body);

                return funcNode;
            }
        }

        return variableStatement;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
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
}

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
        }

        return node;
    }

    public preprocessVariableStatement(variableStatement: ts.VariableStatement): ts.Statement {
        const declr0 = variableStatement.declarationList.declarations[0];
        const init = declr0.initializer;
        if (init.kind === ts.SyntaxKind.FunctionExpression) {
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

}

import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';

export class Preprocessor {

    public constructor(private resolver: IdentifierResolver) {
    }

    public preprocessStatement(node: ts.Statement): ts.Statement {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        return node;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
        if (!node) {
            throw new Error('node is null or undefined');
        }

        return node;
    }

}

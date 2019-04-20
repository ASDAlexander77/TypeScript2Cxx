import * as ts from 'typescript';
import { IdentifierResolver } from './resolvers';

export class Preprocessor {

    public constructor(private resolver: IdentifierResolver) {
    }

    public preprocessStatement(node: ts.Statement): ts.Statement {
        return node;
    }

    public preprocessExpression(node: ts.Expression): ts.Expression {
        return node;
    }

}

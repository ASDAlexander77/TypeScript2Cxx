import * as ts from 'typescript';

export class Helpers {
    public static isConstOrLet(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.Let) === ts.NodeFlags.Let || (node.flags & ts.NodeFlags.Const) === ts.NodeFlags.Const;
    }

    public static isConst(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.Const) === ts.NodeFlags.Const;
    }

    public static isLet(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.Let) === ts.NodeFlags.Let;
    }

    public static correctFileNameForCxx(filePath: string): string {
        // fix filename
        let fileNameIndex = filePath.lastIndexOf('\\');
        if (fileNameIndex === -1) {
            fileNameIndex = filePath.lastIndexOf('/');
        }

        const fileName = fileNameIndex >= 0 ? filePath.substr(fileNameIndex + 1) : filePath;

        const extIndex = fileName.lastIndexOf('.');
        const fileNameNoExt = extIndex >= 0 ? fileName.substr(0, extIndex) : fileName;

        const fileNameFixed = fileNameNoExt;

        // rebuild filePath
        const beginPath = fileNameIndex >= 0 ? filePath.substr(0, fileNameIndex + 1) : '';
        const endExt = extIndex >= 0 ? fileName.substr(extIndex) : '';

        return beginPath + fileNameFixed + endExt;
    }

    public static cleanUpPath(path: string) {
        if (!path) {
            return;
        }

        if (path.charAt(1) === ':' && path.charAt(0).match('[A-Z]')) {
            path = path.charAt(0).toLowerCase() + path.substr(1);
        }

        return path.replace(/\\/g, '/');
    }

    public static getSubPath(filePath: string, rootPath: string) {
        if (!rootPath) {
            return filePath;
        }

        if (rootPath[rootPath.length - 1] === '/' || rootPath[rootPath.length - 1] === '\\') {
            rootPath = rootPath.substr(0, rootPath.length - 1);
        }

        const positionFrom = rootPath.length + (rootPath.length > 0 && (rootPath[0] === '/' || rootPath[0] === '\\') ? 0 : 1);
        const fileSubPath = rootPath.length > 0 && filePath.startsWith(rootPath)
            ? filePath.substring(positionFrom)
            : filePath;

        return fileSubPath;
    }
}

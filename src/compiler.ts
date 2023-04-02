import * as ts from 'typescript';
import * as fs from 'fs-extra';
import { spawn } from 'cross-spawn';
import { Emitter } from './emitter';
import { Helpers } from './helpers';

export enum ForegroundColorEscapeSequences {
    Grey = '\u001b[90m',
    Red = '\u001b[91m',
    Green = '\u001b[92m',
    Yellow = '\u001b[93m',
    Blue = '\u001b[94m',
    Pink = '\u001b[95m',
    Cyan = '\u001b[96m',
    White = '\u001b[97m'
}
export enum BackgroundColorEscapeSequences {
    Grey = '\u001b[100m',
    Red = '\u001b[101m',
    Green = '\u001b[102m',
    Yellow = '\u001b[103m',
    Blue = '\u001b[104m',
    Pink = '\u001b[105m',
    Cyan = '\u001b[106m',
    White = '\u001b[107m'
}
export enum BoldForegroundColorEscapeSequences {
    Grey = '\u001b[90;1m',
    Red = '\u001b[91;1m',
    Green = '\u001b[92;1m',
    Yellow = '\u001b[93;1m',
    Blue = '\u001b[94;1m',
    Pink = '\u001b[95;1m',
    Cyan = '\u001b[96;1m',
    White = '\u001b[97;1m'
}
export enum BoldBackgroundColorEscapeSequences {
    Grey = '\u001b[100;1m',
    Red = '\u001b[101;1m',
    Green = '\u001b[102;1m',
    Yellow = '\u001b[103;1m',
    Blue = '\u001b[104;1m',
    Pink = '\u001b[105;1m',
    Cyan = '\u001b[106;1m',
    White = '\u001b[107;1m'
}
const underlineStyleSequence = '\u001b[4m';
const gutterStyleSequence = '\u001b[7m';
const resetEscapeSequence = '\u001b[0m';

export class Run {

    private formatHost: ts.FormatDiagnosticsHost;
    private versions: Map<string, number> = new Map<string, number>();

    public constructor() {
        this.formatHost = <ts.FormatDiagnosticsHost>{
            getCanonicalFileName: path => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine
        };
    }

    public static processOptions(cmdLineArgs: string[]): any {
        const options = {};
        for (let i = 2; i < cmdLineArgs.length; i++) {
            const item = cmdLineArgs[i];
            if (!item || item[0] !== '-') {
                continue;
            }

            const option = item.substring(1);
            options[option] = true;
            if (option  === 'run_on_compile') {
                options[option] = cmdLineArgs[++i];
            }
        }

        return options;
    }

    public static processFiles(cmdLineArgs: string[]): any {
        const files = [];
        for (let i = 2; i < cmdLineArgs.length; i++) {
            const item = cmdLineArgs[i];
            if (!item || item[0] === '-') {
                if (item === '-run_on_compile') {
                    ++i;
                }

                continue;
            }

            files.push(item);
        }

        if (files.length === 0) {
            return 'tsconfig.json';
        }

        return files.length === 1 ? files[0] : files;
    }

    public run(sourcesOrConfigFile: string[] | string, cmdLineOptions: any): void {

        if (typeof (sourcesOrConfigFile) === 'string') {
            if (sourcesOrConfigFile.endsWith('.json')) {
                const configPath = ts.findConfigFile('./', ts.sys.fileExists, sourcesOrConfigFile);
                if (configPath) {
                    this.compileWithConfig(configPath, cmdLineOptions);
                    return;
                } else {
                    throw new Error('Could not find a valid \'tsconfig.json\'.');
                }
            }

            this.compileSources([sourcesOrConfigFile], cmdLineOptions);
            return;
        }

        this.compileSources(sourcesOrConfigFile, cmdLineOptions);
    }

    public compileSources(sources: string[], cmdLineOptions: any): void {
        this.generateBinary(ts.createProgram(sources, {}), sources, undefined, cmdLineOptions);
    }

    public compileWithConfig(configPath: string, cmdLineOptions: any): void {
        const configFile = ts.readJsonConfigFile(configPath, ts.sys.readFile);

        const parseConfigHost: ts.ParseConfigHost = {
            useCaseSensitiveFileNames: true,
            readDirectory: ts.sys.readDirectory,
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile
        };

        const parsedCommandLine = ts.parseJsonSourceFileConfigFileContent(configFile, parseConfigHost, './');

        const watch = cmdLineOptions && 'watch' in cmdLineOptions;
        cmdLineOptions.outDir = parsedCommandLine.options && parsedCommandLine.options.outDir;

        if (!watch) {
            // simple case, just compile
            const program = ts.createProgram({
                rootNames: parsedCommandLine.fileNames,
                options: parsedCommandLine.options
            });
            this.generateBinary(program, parsedCommandLine.fileNames, parsedCommandLine.options, cmdLineOptions);
        } else {
            const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

            const watchCompilingHost = ts.createWatchCompilerHost(
                configPath,
                {},
                ts.sys,
                createProgram,
                (d) => this.reportDiagnostic(d),
                (d) => this.reportWatchStatusChanged(d)
            );

            watchCompilingHost.afterProgramCreate = program => {
              this.generateBinary(
                  program.getProgram(),
                  parsedCommandLine.fileNames,
                  parsedCommandLine.options,
                  cmdLineOptions);
            };

            console.log(ForegroundColorEscapeSequences.Cyan + 'Watching...' + resetEscapeSequence);
            ts.createWatchProgram(watchCompilingHost);
        }
    }

    private reportDiagnostic(diagnostic: ts.Diagnostic) {

        const category = ts.DiagnosticCategory[diagnostic.category];

        let action;
        let color;
        switch (<ts.DiagnosticCategory>diagnostic.category) {
            case ts.DiagnosticCategory.Warning:
                action = console.warn;
                color = ForegroundColorEscapeSequences.Yellow;
                break;
            case ts.DiagnosticCategory.Error:
                action = console.error;
                color = ForegroundColorEscapeSequences.Red;
                break;
            case ts.DiagnosticCategory.Suggestion:
                action = console.warn;
                color = ForegroundColorEscapeSequences.White;
                break;
            case ts.DiagnosticCategory.Message:
                action = console.log;
                color = resetEscapeSequence;
                break;
        }

        action(category, this.formatHost.getNewLine());
        action(
            category,
            diagnostic.code,
            ':',
            ts.flattenDiagnosticMessageText(color + diagnostic.messageText + resetEscapeSequence, this.formatHost.getNewLine()));
    }

    private reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
        console.log(ts.formatDiagnostic(diagnostic, this.formatHost));
    }

    private generateBinary(
        program: ts.Program, sources: string[], options: ts.CompilerOptions, cmdLineOptions: any) {

        if (!cmdLineOptions.suppressOutput) {
            console.log(ForegroundColorEscapeSequences.Pink + 'Generating binary files...' + resetEscapeSequence);
        }

        const sourceFiles = program.getSourceFiles();

        let outDir = cmdLineOptions.outDir || '';
        if (outDir) {
            const lastChar  = outDir[outDir.length - 1];
            if (lastChar !== '/' && lastChar !== '\\') {
                outDir += '/';
            }

            if (!fs.pathExistsSync(outDir)) {
                fs.mkdirSync(outDir, {recursive: true});
            }
        }

        let rootFolder = process.cwd().replace(/\\/g, '/');
        const lastChar2  = rootFolder[rootFolder.length - 1];
        if (lastChar2 !== '/' && lastChar2 !== '\\') {
            rootFolder += '/';
        }

        sourceFiles.filter(s => !s.fileName.endsWith('.d.ts') && sources.some(sf => s.fileName.endsWith(sf))).forEach(s => {
            // track version
            const paths = sources.filter(sf => s.fileName.endsWith(sf));
            (<any>s).__path = paths[0];
            const fileVersion = (<any>s).version;
            if (fileVersion) {
                const latestVersion = this.versions[s.fileName];
                if (latestVersion && latestVersion === fileVersion) {
                    if (!cmdLineOptions.suppressOutput) {
                        console.log(
                            'File: '
                            + ForegroundColorEscapeSequences.White
                            + s.fileName
                            + resetEscapeSequence
                            + ' current version:'
                            + fileVersion
                            + ', last version:'
                            + latestVersion
                            + '. '
                            + ForegroundColorEscapeSequences.Red
                            + 'Skipped.'
                            + resetEscapeSequence);
                    }
                    return;
                }

                this.versions[s.fileName] = fileVersion;
            }

            if (!cmdLineOptions.suppressOutput) {
                console.log(
                    ForegroundColorEscapeSequences.Cyan
                    + 'Processing File: '
                    + resetEscapeSequence
                    + ForegroundColorEscapeSequences.White
                    + s.fileName
                    + resetEscapeSequence);
            }

            const emitterHeader = new Emitter(program.getTypeChecker(), options, cmdLineOptions, false, program.getCurrentDirectory());
            emitterHeader.HeaderMode = true;
            emitterHeader.processNode(s);
            const emitterSource = new Emitter(program.getTypeChecker(), options, cmdLineOptions, false, program.getCurrentDirectory());
            emitterSource.SourceMode = true;
            emitterSource.processNode(s);

            let fileNameNoExt = s.fileName.endsWith('.ts') ? s.fileName.substr(0, s.fileName.length - 3) : s.fileName;
            if (fileNameNoExt.startsWith(rootFolder)) {
                fileNameNoExt = fileNameNoExt.substring(rootFolder.length);
            }

            const fileNameHeader = Helpers.correctFileNameForCxx(fileNameNoExt.concat('.', 'h'));
            const fileNameCpp = Helpers.correctFileNameForCxx(fileNameNoExt.concat('.', 'cpp'));

            if (!cmdLineOptions.suppressOutput) {
                console.log(
                    ForegroundColorEscapeSequences.Cyan
                    + 'Writing to file: '
                    + resetEscapeSequence
                    + ForegroundColorEscapeSequences.White
                    + outDir + fileNameCpp
                    + resetEscapeSequence);
            }

            fs.writeFileSync(outDir + fileNameHeader, emitterHeader.writer.getText());
            fs.writeFileSync(outDir + fileNameCpp, emitterSource.writer.getText());
        });

        if (!cmdLineOptions.suppressOutput) {
            console.log(ForegroundColorEscapeSequences.Pink + 'Binary files have been generated...' + resetEscapeSequence);
        }

        if (cmdLineOptions.run_on_compile) {
            const result_compile: any = spawn.sync(cmdLineOptions.run_on_compile);

            if (result_compile.error) {
                console.log(ForegroundColorEscapeSequences.Red + 'Error: ');
                console.log(result_compile.error);
                console.log(ForegroundColorEscapeSequences.White + '');
            }

            if (result_compile.stdout.length) {
                console.log(ForegroundColorEscapeSequences.Yellow + 'Result: ');
                console.log(result_compile.stdout.toString());
                console.log(ForegroundColorEscapeSequences.White + '');
            }

            if (result_compile.stderr.length) {
                console.log(ForegroundColorEscapeSequences.Red + 'Error output: ');
                console.log(result_compile.stderr.toString());
                console.log(ForegroundColorEscapeSequences.White + '');
            }
        }
    }

    public test(sources: string[], cmdLineOptions?: any, header?: string, footer?: string): string {
        let actualOutput = '';

        // change folder
        process.chdir('test');

        const fileName = 'test_';

        const tempSourceFiles = sources.map((s: string, index: number) => fileName + index + '.ts');
        const tempCxxFiles = sources.map((s: string, index: number) => fileName + index + '.cpp');
        const tempHFiles = sources.map((s: string, index: number) => fileName + index + '.h');

        // clean up
        tempSourceFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempCxxFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempHFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });

        try {
            sources.forEach((s: string, index: number) => {
                if (fs.existsSync(s)) {
                    s = fs.readFileSync(s).toString();
                    if (header) {
                        if (fs.existsSync(header)) {
                            s = fs.readFileSync(header).toString() + s;
                        } else {
                            s = header + s;
                        }
                    }
                    if (footer) {
                        if (fs.existsSync(footer)) {
                            s = s + fs.readFileSync(footer).toString();
                        } else {
                            s = s + footer;
                        }
                    }
                }

                fs.writeFileSync(fileName + index + '.ts', s);
            });

            // to use tsconfig to compile
            this.run('tsconfig.test.json', { suppressOutput: true });

            // compiling
            const result_compile: any = spawn.sync('test.bat', tempCxxFiles);
            if (result_compile.error) {
                actualOutput = result_compile.error.stack;
            } else if (result_compile.stdout.length) {
                actualOutput = result_compile.stdout.toString();
                if (actualOutput.indexOf(': error') === -1) {
                    actualOutput = '';
                }
            }

            if (!actualOutput && result_compile.stderr.length) {
                actualOutput = result_compile.stderr.toString();
                if (actualOutput.indexOf(': error') === -1) {
                    actualOutput = '';
                }
            }

            if (!actualOutput) {
                // start program and test it to
                const result: any = spawn.sync('testapp1', []);
                if (result.error) {
                    actualOutput = result.error.stack;
                } else {
                    actualOutput = (<Uint8Array>result.stdout).toString();
                }
            }
        } catch (e) {
            // clean up
            tempSourceFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });
            tempCxxFiles.forEach(f => {
                if (fs.existsSync(f)) { fs.unlinkSync(f); }
            });

            process.chdir('..');

            throw e;
        }

        // clean up
        tempSourceFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempCxxFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });
        tempHFiles.forEach(f => {
            if (fs.existsSync(f)) { fs.unlinkSync(f); }
        });

        process.chdir('..');

        return actualOutput;
    }
}

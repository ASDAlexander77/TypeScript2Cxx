import { Run } from './compiler';

declare var process: any;

try {
    new Run().run(Run.processFiles(process.argv), Run.processOptions(process.argv));
} catch (e) {
    if (e.message.indexOf(`Could not find a valid 'tsconfig.json'`) !== -1) {
        print();
    } else {
        console.error(e.stack);
    }
}

function print() {
    console.log(`Version 1.0.1
    Syntax:   tsc-cxx [options] [file...]

    Examples: tsc-cxx hello.ts
              tsc-cxx tsconfig.json
              tsc-cxx
              tsc-cxx -watch

    Options:
     -watch                                          Watch mode
     -run_after_compile <app.bat|exe>                Run extra application or batch file after compilation
     `);
}

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
    console.log(`Version 1.0.11
    Syntax:   tsc-cxx [options] [file...]

    Examples: tsc-cxx hello.ts
              tsc-cxx --jslib file.ts
              tsc-cxx tsconfig.json
              tsc-cxx

    Options:
     -jslib                                             Use JS library.
     -singleModule                                      Output single file.
     -varAsLet                                          Use all 'var' variables as 'let'.
     `);
}

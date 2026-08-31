import { Run } from './src/compiler';
process.chdir('test');
new Run().run('tsconfig.test.json', { suppressOutput: true } as any);
console.log('DONE');

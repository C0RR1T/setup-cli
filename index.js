#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const exec = require('child_process');
const fs = require('fs').promises;

const parser = new ArgumentParser({
    description: 'Prettier settings'
});
parser.add_argument('-d', '--dir', {
    help: 'Directory of package.json',
    default: '.'
});
parser.add_argument('-t', '--template', {
    help: 'Location of the Template settings'
});
parser.add_argument('--typescript', {
    help: 'Create tsconfig with default template',
    action: 'store_true'
});
parser.add_argument('--typescript-template', {
    help: 'Create tsconfig with custom template'
});

parser.add_argument('--yarn', {
    help: 'Use yarn when installing typescript',
    action: 'store_true'
});

const { dir, template, typescript, typescriptTemplate, yarn } =
    parser.parse_args();
const path = `${dir}/package.json`;

const readFile = async () => {
    console.log('Reading package.json...');
    const packageJsonPromise = fs
        .readFile(path)
        .then(val => {
            console.log('Successfully read package.json');
            return JSON.parse(val);
        })
        .catch(err => {
            console.log(
                'An error occurred while reading the package.json',
                err
            );
            process.abort();
        });
    console.log('Reading template file...');
    const templatePromise = fs
        .readFile(template)
        .then(val => {
            console.log('Finished reading template file...');
            return JSON.parse(val);
        })
        .catch(() => console.log('No template file could be read'));
    const [packageJSON, templateJSON] = await Promise.all([
        packageJsonPromise,
        templatePromise
    ]);

    return [packageJSON, templateJSON];
};

const writeFile = async data => {
    console.log('Writing to package.json...');
    await fs.writeFile(path, data);
};

const typescriptConfig = async packageJSON => {
    if(typescript) {
        if (
            !Object.keys(packageJSON?.dependencies || {}).includes('typescript') &&
            !Object.keys(packageJSON?.devDependencies || {}).includes('typescript')
        ) {
            console.log('No Typescript dependency, installing typescript...');
            const cmd = `cd ${dir} && ${
                yarn ? 'yarn add -D' : 'npm i --save-dev '
            } typescript@latest`;
            const install = await exec.exec(cmd);
            install.stdout.on('data', console.log);
            install.on('exit', () =>
                console.log('Successfully installed typescript')
            );
            if (typescriptTemplate) {
                console.log('Copying Template tsconfig file...');
                await fs.copyFile(typescriptTemplate, `${dir}/tsconfig.json`);
                console.log('Copied Tsconfig file');
            } else {
                console.log('Writing tsconfig file...');
                await fs.writeFile(
                    `${dir}/tsconfig.json`,
                    JSON.stringify({
                        compilerOptions: {
                            target: 'es5',
                            lib: ['dom', 'dom.iterable', 'esnext'],
                            allowJs: true,
                            skipLibCheck: true,
                            esModuleInterop: true,
                            allowSyntheticDefaultImports: true,
                            strict: true,
                            forceConsistentCasingInFileNames: true,
                            noFallthroughCasesInSwitch: true,
                            module: 'esnext',
                            moduleResolution: 'node',
                            resolveJsonModule: true,
                            isolatedModules: true,
                            noEmit: true,
                            noImplicitAny: true,
                            noImplicitReturns: true,
                            jsx: 'react-jsx'
                        },
                        include: ['./src/']
                    })
                );
                console.log('Finished Writing tsconfig file');
            }
            await exec.exec(`prettier --write ${dir}/tsconfig.json`);
        }
    }
};

const writePrettierSettings = async () => {
    let [packageJSON, templateJSON] = await readFile();
    await typescriptConfig();

    await writeFile(
        JSON.stringify({
            ...packageJSON,
            prettier: templateJSON || {
                tabWidth: 4,
                printWidth: 80,
                semi: true,
                quoteProps: 'consistent',
                bracketSpacing: true,
                bracketSameLine: true,
                singleQuote: true,
                jsxSingleQuote: true,
                jsxBracketSameLine: true,
                arrowParens: 'avoid'
            }
        })
    );
    console.log('Finished writing to package.json \nFormatting...');
    await exec.exec(`prettier --write ${dir}/package.json`);
    console.log('Finished formatting.');
};

writePrettierSettings().then(() => console.log('Done.'));

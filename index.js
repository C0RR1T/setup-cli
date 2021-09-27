#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const exec = require('child_process');
const fs = require('fs').promises;

const parser = new ArgumentParser({
    description: 'Prettier settings',
});
parser.add_argument('-d', '--dir', {
    help: 'Directory of package.json',
    default: '.',
});
parser.add_argument('-t', '--template', {
    help: 'Location of the Template settings',
});
parser.add_argument('--typescript', {
    help: 'Create tsconfig with default template',
    action: 'store_true',
});
parser.add_argument('--typescript-template', {
    help: 'Create tsconfig with custom template',
});

parser.add_argument('--yarn', {
    help: 'Use yarn when installing typescript',
    action: 'store_true',
});

const { dir, template, typescript, typescript_template, yarn } =
    parser.parse_args();
const path = `${dir}/package.json`;

async function readFile() {
    console.log('Reading package.json & prettier template...');
    const packageJsonPromise = fs
        .readFile(path)
        .then(val => val.toString('utf-8'))
        .then(val => JSON.parse(val))
        .catch(err => {
            console.log(
                'An error occurred while reading the package.json',
                err
            );
            process.exit(1);
        });
    const templatePromise = fs
        .readFile(template)
        .then(val => val.toString('utf-8'))
        .then(JSON.parse)
        .catch(() => console.log('No prettier template file could be read'));
    const [packageJSON, templateJSON] = await Promise.all([
        packageJsonPromise,
        templatePromise,
    ]);

    return [packageJSON, templateJSON];
}

async function writeFile(data) {
    console.log('Writing to package.json...');
    await fs.writeFile(path, data);
}

async function typescriptConfig(packageJSON) {
    if (typescript || typescript_template) {
        if (
            !Object.keys(packageJSON?.dependencies || {}).includes(
                'typescript'
            ) &&
            !Object.keys(packageJSON?.devDependencies || {}).includes(
                'typescript'
            )
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
        }
        if (typescript_template) {
            console.log('Copying Template tsconfig file...');
            await fs
                .copyFile(typescript_template, `${dir}/tsconfig.json`)
                .catch(err => {
                    console.error("Couldn't copy tsconfig.json file", err);
                    process.exit(1);
                });
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
                        jsx: 'react-jsx',
                    },
                    include: ['./src/'],
                })
            );
        }
        console.log('Finished Writing tsconfig file');
        await exec.exec(`prettier --write ${dir}/tsconfig.json`);
    }
}

async function writePrettierSettings() {
    await fs.access(`${dir}/package.json`).catch(() => {
        console.error('Cannot access package.json');
        process.exit(1);
    });
    let [packageJSON, templateJSON] = await readFile();
    console.log(
        'Successfully read the package.json file',
        templateJSON ? 'Successfully read the prettier template file' : ''
    );
    await typescriptConfig(packageJSON);
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
                arrowParens: 'avoid',
            },
        })
    );
    console.log('Finished writing to package.json \nFormatting...');
    await exec.exec(`prettier --write ${dir}/package.json`);
    console.log('Finished formatting.');
}

writePrettierSettings().then(() => console.log('Done.'));

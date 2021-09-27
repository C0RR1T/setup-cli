#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const fs = require('fs').promises;

const parser = new ArgumentParser({
    description: 'Prettier settings',
});

parser.add_argument('-f', '--file', { help: 'Location of package.json' });
parser.add_argument('-t', '--template', {
    help: 'Location of the Template settings',
});

const { file, template } = parser.parse_args();

const exec = require('child_process');

const writePrettierSettings = async () => {
    console.log('Reading package.json...');
    const packageJsonPromise = fs
        .readFile(`${file}/package.json`)
        .then(JSON.parse)
        .then(() => console.log('Successfully read package.json'))
        .catch(err =>
            console.log('An error occurred while reading the package.json', err)
        );
    console.log('Reading template file...');
    const templatePromise = fs.readFile(template).then(JSON.parse).then(() => console.log('Finished reading template file...')).catch((err) => console.log('No template file could be read'));
    const [packageJSON, templateJSON] = await Promise.all([packageJsonPromise, templatePromise]);


};

# Setup CLI

The setup CLI automatically sets up a [prettier](https://www.npmjs.com/package/prettier) and [typescript](https://www.npmjs.com/package/typescript) config.

## API

<table>
    <thead>
    <th>Short flag</th>
    <th>Long flag</th>
    <th>Default</th>
    <th>Description</th>
    </thead>
<tbody>
    <tr>
        <td>-d</td>
        <td>--dir</td>
        <td><i>Current Directory</i></td>
        <td>Where the directory and package.json is located</td>
    </tr>
    <tr>
        <td>-t</td>
        <td>--template</td>
        <td><i>See below</i></td>
        <td>Prettier config template located on your system</td>
    </tr>
    <tr>
        <td><i>None</i></td>
        <td>--typescript</td>
        <td><i>None</i></td>
        <td>If you want to use Typescript, it installs typescript if you didn't before and adds the default config</td>
    </tr>
    <tr>
        <td><i>None</i></td>
        <td>--typescript-template</td>
        <td><i>None</i></td>
        <td>Location of your tsconfig.json template, same as <code>--typescript</code> flag, just uses your custom template</td>
    </tr>
</tbody>
</table>

## Default Values

Prettier config:
```json
{
  "prettier": {
    "tabWidth": 4,
    "printWidth": 80,
    "semi": true,
    "quoteProps": "consistent",
    "bracketSpacing": true,
    "bracketSameLine": true,
    "singleQuote": true,
    "jsxSingleQuote": true,
    "jsxBracketSameLine": true,
    "arrowParens": "avoid"
  }
}
```

tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "jsx": "react-jsx"
  },
  "include": [
    "./src/"
  ]
}
```

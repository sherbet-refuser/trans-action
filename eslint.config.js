import babelEslintParser from '@babel/eslint-parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelEslintParser, // now an object with parse() method
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react']
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        React: 'readonly',
        ReactDOM: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];

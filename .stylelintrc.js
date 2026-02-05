module.exports = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-recess-order',
    'stylelint-config-recommended-scss',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    'selector-pseudo-element-colon-notation': 'double',
    'scss/no-duplicate-dollar-variables': null,
    'no-descending-specificity': null,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-redundant-nesting-selector': null,
    'scss/dollar-variable-pattern': '^[a-z]+[a-zA-Z0-9_-]*$',
    'scss/no-global-function-names': null,
    'scss/selector-no-union-class-name': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        // 'global'という名前の疑似クラスをエラーとして扱わないようにする
        ignorePseudoClasses: ['global'],
      },
    ],
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes'],
      },
    ],
  },
  ignoreFiles: ['**/node_modules/**'],
};

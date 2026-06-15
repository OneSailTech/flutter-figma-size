const { readSkill } = require('./utils');

function convert() {
  const { body } = readSkill();
  return `---
description: Flutter Figma 750px sizing rules for Flutter UI development
globs: "**/*.dart"
alwaysApply: false
---
${body.trim()}
`;
}

module.exports = { convert };

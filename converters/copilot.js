const { readSkill } = require('./utils');

function convert() {
  const { body } = readSkill();
  return `
<!-- flutter-figma-size:start -->
## Flutter Figma Size

Use when working with Flutter UI dimensions from Figma 750px design drafts.

${body.trim()}
<!-- flutter-figma-size:end -->
`;
}

module.exports = { convert };

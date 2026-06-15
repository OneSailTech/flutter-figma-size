const { readSkill } = require('./utils');

function convert() {
  const { body } = readSkill();
  return `# Flutter Figma Size Rules\n${body.trim()}\n`;
}

module.exports = { convert };

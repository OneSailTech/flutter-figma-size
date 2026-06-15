const { readSkill } = require('./utils');

function convert() {
  const { body } = readSkill();
  return body.trim();
}

module.exports = { convert };

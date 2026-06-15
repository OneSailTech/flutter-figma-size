const fs = require('fs');
const path = require('path');

function readSkill() {
  const skillPath = path.join(__dirname, '..', 'SKILL.md');
  let content = fs.readFileSync(skillPath, 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    frontmatter[key] = val;
  }

  return { frontmatter, body: match[2] };
}

module.exports = { readSkill };

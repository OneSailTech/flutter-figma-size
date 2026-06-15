#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const PKG_DIR = path.join(__dirname, '..');

const PLATFORMS = [
  { id: 'opencode',    label: 'opencode',        native: true,  conv: null,
    proj: p => path.join(p, '.opencode', 'skills', 'flutter-figma-size'),
    global: path.join(os.homedir(), '.config', 'opencode', 'skills', 'flutter-figma-size') },
  { id: 'claude',      label: 'Claude Code',      native: true,  conv: null,
    proj: p => path.join(p, '.claude', 'skills', 'flutter-figma-size'),
    global: path.join(os.homedir(), '.claude', 'skills', 'flutter-figma-size') },
  { id: 'codex',       label: 'Codex CLI',         native: true,  conv: null,
    proj: p => path.join(p, '.codex', 'skills', 'flutter-figma-size'),
    global: path.join(os.homedir(), '.codex', 'skills', 'flutter-figma-size') },
  { id: 'antigravity', label: 'Antigravity',       native: true,  conv: null,
    proj: p => path.join(p, '.antigravity', 'skills', 'flutter-figma-size'),
    global: null },
  { id: 'cursor',      label: 'Cursor',            native: false, conv: 'cursor',
    file: 'flutter-figma-size.mdc',  append: false,
    proj: p => path.join(p, '.cursor', 'rules'),     global: null },
  { id: 'trae',        label: 'Trae',              native: false, conv: 'trae',
    file: 'flutter-figma-size-rules.md', append: false,
    proj: p => path.join(p, '.trae', 'rules'),       global: null },
  { id: 'windsurf',    label: 'Windsurf',          native: false, conv: 'windsurf',
    file: 'flutter-figma-size.md',    append: false,
    proj: p => path.join(p, '.windsurf', 'rules'),    global: null },
  { id: 'copilot',     label: 'GitHub Copilot',    native: false, conv: 'copilot',
    file: 'copilot-instructions.md',  append: true,
    proj: p => path.join(p, '.github'),              global: null },
];

const DETECT_MARKERS = {
  opencode:    ['.opencode', 'opencode.json'],
  claude:      ['.claude', 'CLAUDE.md'],
  codex:       ['.codex', 'AGENTS.md'],
  antigravity: ['.antigravity'],
  cursor:      ['.cursor'],
  trae:        ['.trae'],
  windsurf:    ['.windsurf'],
  copilot:     ['.github'],
};

// ── util ──

function findProjectRoot(cwd) {
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    if (['.git', 'pubspec.yaml', 'opencode.json'].some(f => fs.existsSync(path.join(dir, f))))
      return dir;
    if (path.dirname(dir) === dir) return cwd;
  }
}

function detectPlatforms(root) {
  return PLATFORMS.filter(p =>
    (DETECT_MARKERS[p.id] || []).some(m => fs.existsSync(path.join(root, m)))
  ).map(p => p.id);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e), d = path.join(dest, e);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    if (fs.statSync(p).isDirectory()) removeDir(p); else fs.unlinkSync(p);
  }
  try { fs.rmdirSync(dir); } catch {}
}

function genContent(convId) {
  const map = {
    cursor: '../converters/cursor',
    trae: '../converters/trae',
    windsurf: '../converters/windsurf',
    copilot: '../converters/copilot',
  };
  return map[convId] ? require(map[convId]).convert() : null;
}

function nativeSources() {
  const items = [];
  for (const name of ['SKILL.md', 'LICENSE', 'README.md']) {
    const p = path.join(PKG_DIR, name);
    if (fs.existsSync(p)) items.push(p);
  }
  const ref = path.join(PKG_DIR, 'references');
  if (fs.existsSync(ref)) items.push(ref);
  return items;
}

// ── ask (one-shot readline, works with both TTY and pipe) ──

async function ask(question) {
  process.stdout.write(question);
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', line => { rl.close(); resolve(line); });
  });
}

// ── install / uninstall ──

function installPlatform(p, scope) {
  if (p.native) {
    const dest = scope === 'global' && p.global ? p.global : p.proj(process.cwd());
    if (!dest) return { path: null, ok: false, reason: 'no global path' };
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const src of nativeSources()) {
      const name = path.basename(src);
      const d = path.join(dest, name);
      if (fs.statSync(src).isDirectory()) copyDir(src, d); else fs.copyFileSync(src, d);
    }
    return { path: dest, ok: true };
  }

  const dir = scope === 'global' && p.global ? p.global : p.proj(process.cwd());
  if (!dir) return { path: null, ok: false, reason: 'global not supported' };
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, p.file);
  const content = genContent(p.conv);
  if (!content) return { path: null, ok: false, reason: 'converter error' };

  if (p.append && fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    const ts = '<!-- flutter-figma-size:start -->', te = '<!-- flutter-figma-size:end -->';
    const si = existing.indexOf(ts), ei = existing.indexOf(te);
    if (si !== -1 && ei !== -1) {
      fs.writeFileSync(filePath, existing.slice(0, si) + content.trim() + '\n' + existing.slice(ei + te.length), 'utf-8');
    } else {
      fs.appendFileSync(filePath, '\n' + content, 'utf-8');
    }
  } else {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  return { path: filePath, ok: true };
}

function uninstallPlatform(p, scope) {
  if (p.native) {
    const dir = scope === 'global' && p.global ? p.global : p.proj(process.cwd());
    if (fs.existsSync(dir)) { removeDir(dir); return { path: dir, ok: true }; }
    return { path: dir, ok: false, reason: 'not found' };
  }

  const dir = scope === 'global' && p.global ? p.global : p.proj(process.cwd());
  const filePath = path.join(dir, p.file);
  if (!fs.existsSync(filePath)) return { path: filePath, ok: false, reason: 'not found' };

  if (p.append) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const ts = '<!-- flutter-figma-size:start -->', te = '<!-- flutter-figma-size:end -->';
    const si = content.indexOf(ts), ei = content.indexOf(te);
    if (si === -1 || ei === -1) return { path: filePath, ok: false, reason: 'tag not found' };
    content = (content.slice(0, si) + content.slice(ei + te.length)).replace(/\n{3,}/g, '\n\n').trim() + '\n';
    fs.writeFileSync(filePath, content, 'utf-8');
    return { path: filePath, ok: true };
  }

  fs.unlinkSync(filePath);
  return { path: filePath, ok: true };
}

function printSummary(results, isUninstall) {
  console.log(`\n  ${isUninstall ? 'Uninstall' : 'Install'} summary:\n`);
  for (const { p, r } of results) {
    const icon = r.ok ? '  \u2705' : '  \u23ED';
    const rel = r.path ? path.relative(process.cwd(), r.path) : '-';
    const extra = r.ok ? '' : `  (${r.reason})`;
    console.log(`  ${icon} ${p.label.padEnd(18)} ${rel}${extra}`);
  }
  if (!isUninstall && results.some(r => r.ok))
    console.log('\n  \uD83D\uDD04  Restart your AI coding assistant to activate.\n');
}

function parseScope(val) {
  if (val === 'global' || val === 'g') return 'global';
  if (val === 'project' || val === 'p') return 'project';
  return null;
}

function parsePlatforms(val) {
  if (!val) return null;
  const parts = val.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.includes('all')) return PLATFORMS.map(p => p.id);
  const valid = PLATFORMS.map(p => p.id);
  const ids = parts.filter(id => valid.includes(id));
  return ids.length > 0 ? ids : null;
}

// ── main ──

async function main() {
  const args = process.argv.slice(2);
  const isUninstall = args.includes('uninstall');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx flutter-figma-size [command] [options]

Commands:
  install               Install skill (default)
  uninstall             Remove skill

Options (non-interactive):
  --scope <scope>       project | global
  --platform <ids>      Comma-separated: opencode,claude,codex,antigravity,cursor,trae,windsurf,copilot | all

Examples:
  npx flutter-figma-size                          # interactive
  npx flutter-figma-size --scope project --platform all
  npx flutter-figma-size --scope global --platform opencode,claude
  npx flutter-figma-size uninstall --scope project --platform cursor
`);
    return;
  }

  const root = findProjectRoot(process.cwd());
  const detected = detectPlatforms(root);

  // ── resolve scope ──
  let scope = parseScope(
    args.indexOf('--scope') !== -1 ? args[args.indexOf('--scope') + 1] : null
  );

  if (!scope) {
    console.log('\n  flutter-figma-size installer\n');
    console.log('  Install scope:');
    console.log('    1. Project-level  (install in current project)');
    const hasNativeGlobal = detected.some(id => PLATFORMS.find(p => p.id === id)?.native);
    if (hasNativeGlobal) console.log('    2. Global  (~/.config/opencode/skills/ etc.)');
    console.log('    q. Cancel\n');

    while (!scope) {
      const ans = (await ask('  Select [1/2/q]: ')).trim().toLowerCase();
      if (ans === 'q') { console.log('Cancelled.'); return; }
      if (ans === '2') scope = 'global';
      else if (ans === '1' || ans === '') scope = 'project';
    }
  }

  // ── resolve platforms ──
  let platformArg = null;
  const pi = args.indexOf('--platform');
  if (pi !== -1 && pi + 1 < args.length) platformArg = args[pi + 1];

  let selected = platformArg ? parsePlatforms(platformArg) : null;

  if (!selected) {
    console.log('\n  Available platforms:');
    PLATFORMS.forEach((p, i) => {
      const tag = p.native ? 'SKILL.md' : p.file;
      const mark = detected.includes(p.id) ? ' \u2713' : '';
      console.log(`    ${i + 1}. ${p.label.padEnd(18)} [${tag}]${mark}`);
    });
    console.log('    a. All');
    console.log('    q. Cancel\n');

    while (!selected) {
      const ans = (await ask('  Enter numbers (comma-separated) or "a" for all: ')).trim().toLowerCase();
      if (ans === 'q') { console.log('Cancelled.'); return; }
      if (ans === 'a' || ans === 'all') { selected = PLATFORMS.map(p => p.id); break; }
      const ids = [...new Set(
        ans.split(',').map(s => { const n = parseInt(s.trim(), 10) - 1; return n >= 0 && n < PLATFORMS.length ? PLATFORMS[n].id : null; }).filter(Boolean)
      )];
      if (ids.length > 0) selected = ids;
    }
  }

  // ── execute ──
  const results = [];
  for (const id of selected) {
    const p = PLATFORMS.find(x => x.id === id);
    if (!p) continue;
    const r = isUninstall ? uninstallPlatform(p, scope) : installPlatform(p, scope);
    results.push({ p, r });
  }

  printSummary(results, isUninstall);
}

main().catch(e => { console.error(e); process.exit(1); });

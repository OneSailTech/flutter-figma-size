# flutter-figma-size

Flutter UI sizing skill for Figma 750px design drafts. Compatible with any agent that supports SKILL.md (opencode, Claude Code, Codex CLI, Antigravity, etc.).

## 安装

### 一键安装（推荐）

```bash
npx github:OneSailTech/flutter-figma-size
```

### 手动克隆

```bash
git clone https://github.com/OneSailTech/flutter-figma-size.git .opencode/skills/flutter-figma-size
```

安装后重启 agent 即可生效，无需改配置文件。

## Rules

1. Figma 750px → Flutter 375dp
2. All Figma sizes copied directly, never divide by 2
3. Layout values use `.ui(context)`
4. Font values use `.font(context)`
5. No `flutter_screenutil`
6. No raw dp values

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill instructions |
| `references/appSize.dart` | Template for `lib/utils/app_size.dart` |
| `LICENSE` | MIT License |

## License

MIT

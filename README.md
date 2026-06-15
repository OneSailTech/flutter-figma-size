# flutter-figma-size

Flutter UI sizing rules for Figma 750px design drafts.

Layout → `.ui(context)`, font → `.font(context)`, with clamping to prevent over-scaling on tablets and landscape mode.

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

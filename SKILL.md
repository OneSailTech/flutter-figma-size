---
name: flutter-figma-size
description: "Use when working with Figma 750px design drafts for Flutter UI development. When Flutter UI 尺寸适配时需要用到 Figma 750px 设计稿。Provides .ui and .font extensions for dp scaling, with clamping ranges to prevent over-scaling on tablets or landscape modes."
license: MIT
metadata:
  author: OneSailTech
---

# Flutter AppSize Skill

## Path Note
Files referenced in this skill (e.g., `references/appSize.dart`) are relative to this skill's root directory (where `SKILL.md` lives).

## Auto Setup

Before applying rules, check if `lib/utils/app_size.dart` exists in the project:

- **If missing**: Create it using the template at `references/appSize.dart` (auto-create `lib/utils/` if needed)
- **If exists**: Skip setup

## Design Source

- Figma width: 750px
- Flutter width: 375dp

## Rules

1. All Figma sizes are copied directly.
2. Layout values must use `.ui`.
3. Font values must use `.font`.
4. Never manually divide by 2.
5. Never use flutter_screenutil.
6. Never write raw dp values for UI dimensions.

## Usage Examples

Figma: 24px → Flutter: `24.ui(context)`
Figma: 28px font → Flutter: `28.font(context)`
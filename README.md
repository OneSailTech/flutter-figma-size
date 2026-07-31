# flutter-figma-size

一个面向 Flutter 项目的 Figma 尺寸适配方案与 AI Agent Skill。

它允许开发者直接使用设计稿中的尺寸值，不需要手动除以 2，也不需要在每个组件中反复传入 `BuildContext`。

```dart
Container(
  width: 320.ui,
  height: 88.ui,
  padding: EdgeInsets.symmetric(horizontal: 32.ui),
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(16.ui),
  ),
  child: Text(
    '开始使用',
    style: TextStyle(fontSize: 28.font),
  ),
)
```

这里的 `320`、`88`、`32`、`16` 和 `28` 都可以直接复制自 Figma 设计稿。

## 特性

- 直接使用 Figma 标注值，无需手动换算
- 支持 750px、720px、1080px 等任意设计稿宽度
- 根据当前设备可用宽度自动缩放
- UI 尺寸和字体尺寸使用独立缩放范围
- 支持 GetX，通过 `Get.context` 省略 `BuildContext`
- 防止平板、横屏和折叠屏将界面无限放大
- 不依赖 `flutter_screenutil`
- 可作为支持 `SKILL.md` 的 AI 编程工具规则使用
- 适用于手机端 Flutter 应用

## 核心原理

假设：

- Figma 设计稿像素宽度为 `designWidth`
- 设计稿对应的 Flutter 基准逻辑宽度为 `designLogicalWidth`
- 设计稿中某个元素尺寸为 `designValue`
- 当前设备可用逻辑宽度为 `screenWidth`

先将设计稿像素转换为基准逻辑尺寸：

```text
baseValue = designValue × designLogicalWidth / designWidth
```

再根据当前设备宽度计算设备缩放比例：

```text
deviceScale = screenWidth / designLogicalWidth
```

最终显示尺寸为：

```text
displayValue = baseValue × deviceScale
```

在没有触发缩放限制时，上式可化简为：

```text
displayValue = designValue × screenWidth / designWidth
```

例如，设计稿宽度为 `750px`，按钮宽度为 `320px`：

```text
375dp 手机：320 × 375 / 750 = 160dp
390dp 手机：320 × 390 / 750 = 166.4dp
430dp 手机：320 × 430 / 750 ≈ 183.47dp
```

因此，`750` 不是固定规则，而是当前项目设计稿的基准宽度。设计稿是 `720px`，就配置为 `720`；设计稿是 `1080px`，就配置为 `1080`。

## 与固定除以 2 的区别

在 750px 设计稿对应 375dp 设备时：

```text
designValue / 2
```

确实可以得到基准设备上的尺寸。

但固定除以 2 只能完成一次静态换算，不能反映不同手机的实际宽度变化。

本方案使用：

```text
designValue × screenWidth / designWidth
```

因此同一个设计值会根据手机宽度得到对应的逻辑尺寸。

## 安装 Skill

### 一键安装

```bash
npx github:OneSailTech/flutter-figma-size
```

### 手动克隆

OpenCode：

```bash
git clone https://github.com/OneSailTech/flutter-figma-size.git \
  .opencode/skills/flutter-figma-size
```

其他支持 `SKILL.md` 的 Agent，请克隆到对应的 Skills 目录。

安装完成后，重启 Agent。

## 项目中配置 AppSize

将以下文件保存为：

```text
lib/utils/app_size.dart
```

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppSize {
  AppSize._();

  /// 当前项目的 Figma 设计稿像素宽度。
  ///
  /// 请按照实际设计稿修改，例如 750、720 或 1080。
  static const double designWidth = 750;

  /// 这份设计稿对应的 Flutter 基准逻辑宽度。
  ///
  /// 常见对应关系：
  /// - 750px 设计稿通常对应 375dp
  /// - 720px 设计稿通常对应 360dp
  /// - 1080px 设计稿可能对应 360dp
  ///
  /// 不要只根据设计稿宽度猜测，应以设计团队的基准设备为准。
  static const double designLogicalWidth = 375;

  /// UI 缩放限制。
  ///
  /// 防止平板、横屏和折叠屏把按钮、间距、圆角等尺寸放得过大。
  static const double minUiScale = 0.90;
  static const double maxUiScale = 1.20;

  /// 字体缩放限制。
  ///
  /// 字体通常不应与屏幕宽度完全等比例无限放大。
  static const double minFontScale = 0.95;
  static const double maxFontScale = 1.08;

  /// 获取当前可用的 BuildContext。
  ///
  /// 尺寸扩展通常应在 Widget 构建阶段使用。
  static BuildContext get context {
    final value = Get.context;

    assert(
      value != null,
      'AppSize 无法获取 Get.context。'
      '请确保应用使用 GetMaterialApp，且尺寸计算发生在页面构建阶段。',
    );

    if (value == null) {
      throw StateError(
        'AppSize 无法获取 Get.context。'
        '请确保应用使用 GetMaterialApp，且尺寸计算发生在页面构建阶段。',
      );
    }

    return value;
  }

  /// 当前设备可用逻辑宽度。
  static double get screenWidth {
    return MediaQuery.sizeOf(context).width;
  }

  /// 当前设备可用逻辑高度。
  static double get screenHeight {
    return MediaQuery.sizeOf(context).height;
  }

  /// 当前设备相对设计基准设备的缩放比例。
  ///
  /// 例如设计基准为 375dp，当前设备为 390dp：
  /// 390 / 375 = 1.04。
  static double get rawScale {
    return screenWidth / designLogicalWidth;
  }

  /// 将 Figma 像素值转换为基准设备上的 Flutter 逻辑尺寸。
  static double toLogicalSize(double designValue) {
    return designValue * designLogicalWidth / designWidth;
  }

  /// 普通 UI 尺寸缩放比例。
  static double get uiScale {
    return rawScale.clamp(minUiScale, maxUiScale).toDouble();
  }

  /// 字体尺寸缩放比例。
  static double get fontScale {
    return rawScale.clamp(minFontScale, maxFontScale).toDouble();
  }

  /// 转换普通 UI 尺寸。
  ///
  /// 适用于：
  /// width、height、padding、margin、radius、iconSize 等。
  static double ui(double designValue) {
    return toLogicalSize(designValue) * uiScale;
  }

  /// 转换字体尺寸。
  ///
  /// 适用于 TextStyle.fontSize。
  static double font(double designValue) {
    return toLogicalSize(designValue) * fontScale;
  }
}

extension AppSizeExtension on num {
  /// 将 Figma 中的布局尺寸转换为当前设备尺寸。
  double get ui => AppSize.ui(toDouble());

  /// 将 Figma 中的字体尺寸转换为当前设备字体尺寸。
  double get font => AppSize.font(toDouble());
}
```

## 初始化 GetX

由于新版扩展通过 `Get.context` 获取上下文，应用根节点需要使用 `GetMaterialApp`：

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      home: const HomePage(),
    );
  }
}
```

## 基础用法

先导入：

```dart
import 'package:your_app/utils/app_size.dart';
```

### 宽高

```dart
SizedBox(
  width: 320.ui,
  height: 88.ui,
)
```

### 内边距与外边距

```dart
Padding(
  padding: EdgeInsets.symmetric(
    horizontal: 32.ui,
    vertical: 24.ui,
  ),
  child: const Text('内容'),
)
```

### 圆角

```dart
Container(
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(20.ui),
  ),
)
```

### 字体

```dart
Text(
  '标题',
  style: TextStyle(
    fontSize: 32.font,
    fontWeight: FontWeight.w600,
  ),
)
```

### 图标

```dart
Icon(
  Icons.settings,
  size: 48.ui,
)
```

### 完整组件

```dart
Container(
  width: 686.ui,
  height: 96.ui,
  padding: EdgeInsets.symmetric(horizontal: 32.ui),
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(20.ui),
  ),
  alignment: Alignment.center,
  child: Text(
    '确认',
    style: TextStyle(
      fontSize: 30.font,
      fontWeight: FontWeight.w600,
    ),
  ),
)
```

## 修改设计稿宽度

### 750px 设计稿

```dart
static const double designWidth = 750;
static const double designLogicalWidth = 375;
```

### 720px 设计稿

```dart
static const double designWidth = 720;
static const double designLogicalWidth = 360;
```

### 1080px 设计稿

```dart
static const double designWidth = 1080;
static const double designLogicalWidth = 360;
```

代码中的尺寸仍然直接复制设计稿标注：

```dart
// 720px 设计稿中的 200px
width: 200.ui,

// 1080px 设计稿中的 300px
height: 300.ui,
```

不需要修改调用方式，也不要手动除以任何数值。

## 为什么要限制缩放范围

如果完全按照宽度等比例缩放，在平板、桌面窗口、横屏或展开后的折叠屏中，界面可能被异常放大。

例如，750px 设计稿在 800dp 宽的平板窗口中：

```text
800 / 750 ≈ 1.067
```

如果设计稿中的按钮高度是 96px，则会显示为：

```text
96 × 1.067 ≈ 102.4dp
```

这通常过大。

因此默认限制 UI 缩放比例：

```dart
static const double minUiScale = 0.90;
static const double maxUiScale = 1.20;
```

字体使用更保守的范围：

```dart
static const double minFontScale = 0.95;
static const double maxFontScale = 1.08;
```

这些值不是绝对标准，应根据产品的目标设备调整。

## 关于字体适配

`.font` 只负责将 Figma 字号转换为应用字号，并限制尺寸适配造成的放大范围。

它不会自动忽略用户在系统中设置的字体缩放。Flutter 的文本仍可能受到系统辅助功能设置影响，这是正常的可访问性行为。

不建议为了保持视觉稿完全一致而全局禁止系统字体缩放。

## 安全区域

`AppSize` 负责尺寸缩放，不负责状态栏、刘海、灵动岛、导航栏等安全区域。

页面仍应根据需要使用：

```dart
SafeArea(
  child: YourPage(),
)
```

或者：

```dart
final padding = MediaQuery.paddingOf(context);
```

不要把顶部安全区域高度写成固定设计稿数值。

## 横屏和平板建议

本方案主要用于手机端、以宽度为基准的设计稿。

对于平板、桌面端和复杂横屏页面，建议在尺寸缩放之外增加响应式布局：

```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth >= 600) {
      return const TabletLayout();
    }

    return const MobileLayout();
  },
)
```

尺寸适配不能替代响应式布局。

## 使用规范

1. Figma 中的布局值直接使用 `.ui`
2. Figma 中的字号直接使用 `.font`
3. 不手动除以 2
4. 不在同一个项目中混用多套尺寸适配方案
5. 不为适配后的值重复乘缩放比例
6. 安全区域和键盘区域使用 Flutter 原生能力处理
7. 平板与桌面端使用断点布局，而不是只依赖缩放
8. 设计基准变化时，必须同时检查 `designWidth` 和 `designLogicalWidth`

## 推荐写法与错误写法

### 推荐

```dart
width: 320.ui,
height: 88.ui,
fontSize: 28.font,
padding: EdgeInsets.all(24.ui),
```

### 不推荐：手动除以 2

```dart
width: (320 / 2).ui,
```

### 不推荐：使用原始值

```dart
width: 320,
```

### 不推荐：重复缩放

```dart
width: 320.ui * AppSize.uiScale,
```

### 不推荐：UI 尺寸使用字体缩放

```dart
width: 320.font,
```

## Get.context 的使用限制

`Get.context` 依赖当前导航树中的上下文。

适合在以下位置使用：

- `build` 方法
- Widget 构建过程中
- 页面已挂载时触发的 UI 回调
- GetX 管理的正常页面生命周期中

不适合在以下位置使用：

- `main()` 调用 `runApp()` 之前
- 顶层变量初始化
- 静态常量初始化
- 页面销毁后的延迟回调
- 没有创建 `GetMaterialApp` 的项目
- 后台 Isolate

错误示例：

```dart
final double cardWidth = 320.ui;
```

如果该代码在应用启动、页面上下文建立之前执行，`Get.context` 可能为空。

推荐在 Widget 构建阶段计算：

```dart
@override
Widget build(BuildContext context) {
  final cardWidth = 320.ui;

  return SizedBox(width: cardWidth);
}
```

## 不使用 GetX 的版本

如果项目没有使用 GetX，建议保留显式 `BuildContext`：

```dart
extension AppSizeExtension on num {
  double ui(BuildContext context) {
    return AppSize.ui(context, toDouble());
  }

  double font(BuildContext context) {
    return AppSize.font(context, toDouble());
  }
}
```

GetX 不是尺寸适配本身的必要条件，它只用于简化上下文获取。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `SKILL.md` | AI Agent 使用规则 |
| `references/app_size.dart` | Flutter 尺寸工具模板 |
| `README.md` | 安装、原理和使用说明 |
| `LICENSE` | MIT License |

## License

MIT

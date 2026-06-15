import 'package:flutter/material.dart';

class AppSize {
  AppSize._();

  /// Figma 设计稿宽度：750px
  static const double designPxWidth = 750;

  /// Figma 设计稿对应的 Flutter 逻辑宽度：375dp
  static const double designDpWidth = 375;

  /// UI 尺寸缩放范围
  ///
  /// 防止平板、横屏、折叠屏把 UI 放得过大。
  static const double minUiScale = 0.9;
  static const double maxUiScale = 1.2;

  /// 字体缩放范围
  ///
  /// 字体一般不建议跟着屏幕无限放大。
  static const double minFontScale = 0.95;
  static const double maxFontScale = 1.08;

  static Size size(BuildContext context) {
    return MediaQuery.sizeOf(context);
  }

  static double screenWidth(BuildContext context) {
    return MediaQuery.sizeOf(context).width;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.sizeOf(context).height;
  }

  /// 当前屏幕相对于 375dp 设计宽度的缩放比例
  static double scale(BuildContext context) {
    final width = screenWidth(context);
    return width / designDpWidth;
  }

  /// Figma px 转 Flutter dp
  ///
  /// 750px 设计稿下：
  /// 2px = 1dp
  static double pxToDp(double designPx) {
    return designPx / 2;
  }

  /// 普通 UI 尺寸
  ///
  /// 用于 width、height、padding、margin、radius、iconSize、buttonHeight 等。
  static double ui(BuildContext context, double designPx) {
    final value = pxToDp(designPx);
    final factor = scale(context).clamp(minUiScale, maxUiScale);
    return value * factor;
  }

  /// 字体尺寸
  ///
  /// 用于 TextStyle(fontSize: ...)
  static double font(BuildContext context, double designPx) {
    final value = pxToDp(designPx);
    final factor = scale(context).clamp(minFontScale, maxFontScale);
    return value * factor;
  }
}

extension AppSizeExtension on num {
  double ui(BuildContext context) => AppSize.ui(context, toDouble());
  double font(BuildContext context) => AppSize.font(context, toDouble());
}
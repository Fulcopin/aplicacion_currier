import 'package:flutter/material.dart';

class AppTheme {
  static const turquoiseColor = Color(0xFF40E0D0);
  
  static ThemeData theme = ThemeData(
    primaryColor: turquoiseColor,
    scaffoldBackgroundColor: turquoiseColor,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
    ),
  );
}
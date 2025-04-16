import 'package:flutter/material.dart';
import 'theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/shipment_screen.dart';
import 'screens/tracking_screen.dart';
import 'screens/warehouse_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/billing_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  runApp(const CourierApp());
}

class CourierApp extends StatelessWidget {
  const CourierApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vacabox Courier',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/dashboard/envios': (context) => const ShipmentScreen(),
        '/dashboard/seguimiento': (context) => const TrackingScreen(),
        '/dashboard/almacen': (context) => const WarehouseScreen(),
        '/dashboard/clientes': (context) => const CustomersScreen(),
        '/dashboard/facturacion': (context) => const BillingScreen(),
        
        '/dashboard/configuracion': (context) => const SettingsScreen(),
      },
    );
  }
}


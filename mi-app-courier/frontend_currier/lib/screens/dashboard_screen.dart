import 'package:flutter/material.dart';
import '../widgets/stats_card.dart';
import '../widgets/recent_shipments.dart';
import '../widgets/quick_actions.dart';
import '../widgets/shipment_chart.dart';
import '../theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text(
          'Vacabox',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            _scaffoldKey.currentState?.openDrawer();
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          const CircleAvatar(
            radius: 16,
            backgroundColor: AppTheme.secondaryColor,
            child: Icon(
              Icons.person_outline,
              color: AppTheme.textColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      drawer: _buildDrawer(),
      body: Row(
        children: [
          // Navegación lateral para pantallas grandes
          if (MediaQuery.of(context).size.width >= 1100)
            SizedBox(
              width: 250,
              child: _buildDrawerContents(),
            ),
          // Contenido principal
          Expanded(
            child: _selectedIndex == 0 
                ? _buildDashboardContent() 
                : const Center(child: Text('Por favor, selecciona una opción del menú')),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: _buildDrawerContents(),
    );
  }

  Widget _buildDrawerContents() {
    return Column(
      children: [
        DrawerHeader(
          decoration: const BoxDecoration(
            color: Colors.white,
          ),
          child: Center(
            child: Text(
              'Vacabox',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
        ),
        _buildNavItem(0, 'Dashboard', Icons.home_outlined, '/dashboard'),
        _buildNavItem(1, 'Envíos', Icons.inventory_2_outlined, '/dashboard/envios'),
        _buildNavItem(2, 'Seguimiento', Icons.local_shipping_outlined, '/dashboard/seguimiento'),
        _buildNavItem(3, 'Almacén', Icons.inventory_outlined, '/dashboard/almacen'),
        _buildNavItem(4, 'Clientes', Icons.people_outline, '/dashboard/clientes'),
        _buildNavItem(5, 'Facturación', Icons.receipt_long_outlined, '/dashboard/facturacion'),
        _buildNavItem(6, 'Reportes', Icons.bar_chart_outlined, '/dashboard/reportes'),
        _buildNavItem(7, 'Configuración', Icons.settings_outlined, '/dashboard/configuracion'),
      ],
    );
  }

  Widget _buildNavItem(int index, String title, IconData icon, String route) {
    final isSelected = _selectedIndex == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppTheme.primaryColor : AppTheme.mutedTextColor,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppTheme.primaryColor : AppTheme.textColor,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        
        // Cerrar el drawer si está abierto en pantallas pequeñas
        if (MediaQuery.of(context).size.width < 1100) {
          Navigator.pop(context);
        }
        
        // Navegar a la ruta correspondiente
        if (index > 0) {
          Navigator.pushNamed(context, route);
        }
      },
    );
  }

  Widget _buildDashboardContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Trae tus productos a menos precio',
            style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Bienvenido Inicia Sección',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.mutedTextColor,
                ),
          ),
          const SizedBox(height: 24),
          _buildStatsGrid(),
          const SizedBox(height: 24),
          _buildShipmentsAndActions(),
          const SizedBox(height: 24),
          const ShipmentChart(),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Determinar cuántas tarjetas por fila según el ancho
        int crossAxisCount = 1;
        if (constraints.maxWidth > 600) crossAxisCount = 2;
        if (constraints.maxWidth > 900) crossAxisCount = 4;

        return GridView.count(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: const [
            StatsCard(
              title: 'Total Envíos',
              value: '1,234',
              description: 'Último mes',
              icon: Icons.inventory_2_outlined,
              trend: '+12.5%',
              isPositive: true,
            ),
            StatsCard(
              title: 'En Tránsito',
              value: '256',
              description: 'Actualmente',
              icon: Icons.local_shipping_outlined,
              trend: '+3.2%',
              isPositive: true,
            ),
            StatsCard(
              title: 'Ingresos',
              value: '\$45,231',
              description: 'Último mes',
              icon: Icons.attach_money,
              trend: '+8.1%',
              isPositive: true,
            ),
            StatsCard(
              title: 'Clientes',
              value: '892',
              description: 'Total activos',
              icon: Icons.people_outline,
              trend: '+5.4%',
              isPositive: true,
            ),
          ],
        );
      },
    );
  }

  Widget _buildShipmentsAndActions() {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 900) {
          // Diseño de escritorio
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                flex: 3,
                child: RecentShipments(),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: QuickActions(),
              ),
            ],
          );
        } else {
          // Diseño móvil
          return Column(
            children: const [
              RecentShipments(),
              SizedBox(height: 16),
              QuickActions(),
            ],
          );
        }
      },
    );
  }
}


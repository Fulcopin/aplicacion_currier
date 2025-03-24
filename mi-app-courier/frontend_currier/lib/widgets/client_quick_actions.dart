import 'package:flutter/material.dart';
import '../theme.dart';

class ClientQuickActions extends StatelessWidget {
  const ClientQuickActions({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Acciones Rápidas',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _buildActionButton(
              context,
              'Nuevo Envío',
              Icons.local_shipping_outlined,
              () => Navigator.pushNamed(context, '/new-shipment'),
            ),
            const SizedBox(height: 8),
            _buildActionButton(
              context,
              'Mis Envíos',
              Icons.inventory_2_outlined,
              () => Navigator.pushNamed(context, '/shipments'),
            ),
            const SizedBox(height: 8),
            _buildActionButton(
              context,
              'Mi Perfil',
              Icons.person_outline,
              () => Navigator.pushNamed(context, '/profile'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    String title,
    IconData icon,
    VoidCallback onPressed,
  ) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(title),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 44),
        alignment: Alignment.centerLeft,
        foregroundColor: Theme.of(context).primaryColor,
      ),
    );
  }
}
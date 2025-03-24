import 'package:flutter/material.dart';
import '../theme.dart';
import 'new_shipment_screen.dart';

class ShipmentScreen extends StatefulWidget {
  const ShipmentScreen({Key? key}) : super(key: key);

  @override
  State<ShipmentScreen> createState() => _ShipmentScreenState();
}

class _ShipmentScreenState extends State<ShipmentScreen> {
  final _searchController = TextEditingController();
  String _filterValue = 'Todos';
  final List<String> _filterOptions = ['Todos', 'En tránsito', 'Entregados', 'Procesando', 'Retrasados'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Envíos'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              _showFilterDialog();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Buscar envío por tracking, cliente...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {});
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  'Filtro: $_filterValue',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () {
                    _showFilterDialog();
                  },
                  child: const Text('Cambiar'),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const NewShipmentScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Nuevo Envío'),
                ),
              ],
            ),
          ),
          Expanded(
            child: _buildShipmentsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildShipmentsList() {
    // Datos de ejemplo para la lista de envíos
    final shipments = [
      {
        'id': '1',
        'tracking': 'VB-12345678',
        'customer': 'Juan Pérez',
        'origin': 'Miami, FL',
        'destination': 'Ciudad de México, MX',
        'status': 'En tránsito',
        'date': '2025-03-14',
      },
      {
        'id': '2',
        'tracking': 'VB-87654321',
        'customer': 'María González',
        'origin': 'Los Angeles, CA',
        'destination': 'Guadalajara, MX',
        'status': 'Procesando',
        'date': '2025-03-13',
      },
      {
        'id': '3',
        'tracking': 'VB-23456789',
        'customer': 'Carlos Rodríguez',
        'origin': 'New York, NY',
        'destination': 'Monterrey, MX',
        'status': 'Entregado',
        'date': '2025-03-12',
      },
      {
        'id': '4',
        'tracking': 'VB-98765432',
        'customer': 'Ana Martínez',
        'origin': 'Chicago, IL',
        'destination': 'Cancún, MX',
        'status': 'Retrasado',
        'date': '2025-03-11',
      },
      {
        'id': '5',
        'tracking': 'VB-34567890',
        'customer': 'Roberto Sánchez',
        'origin': 'Houston, TX',
        'destination': 'Tijuana, MX',
        'status': 'En tránsito',
        'date': '2025-03-10',
      },
    ];

    // Filtrar por búsqueda y estado
    final searchQuery = _searchController.text.toLowerCase();
    final filteredShipments = shipments.where((shipment) {
      final matchesSearch = shipment['tracking']!.toLowerCase().contains(searchQuery) ||
          shipment['customer']!.toLowerCase().contains(searchQuery);
      
      final matchesFilter = _filterValue == 'Todos' || shipment['status'] == _filterValue;
      
      return matchesSearch && matchesFilter;
    }).toList();

    if (filteredShipments.isEmpty) {
      return const Center(
        child: Text('No se encontraron envíos'),
      );
    }

    return ListView.builder(
      itemCount: filteredShipments.length,
      itemBuilder: (context, index) {
        final shipment = filteredShipments[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text(
              '${shipment['tracking']} - ${shipment['customer']}',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text(
              'De: ${shipment['origin']} A: ${shipment['destination']}',
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildStatusBadge(shipment['status']!),
                IconButton(
                  icon: const Icon(Icons.visibility_outlined),
                  onPressed: () {
                    // Ver detalles del envío
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: () {
                    // Editar envío
                  },
                ),
              ],
            ),
            onTap: () {
              // Ver detalles del envío
            },
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'Entregado':
        color = AppTheme.successColor;
        break;
      case 'En tránsito':
        color = AppTheme.primaryColor;
        break;
      case 'Procesando':
        color = AppTheme.warningColor;
        break;
      case 'Retrasado':
        color = AppTheme.errorColor;
        break;
      default:
        color = AppTheme.mutedTextColor;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Filtrar envíos'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: _filterOptions.map((option) {
              return RadioListTile<String>(
                title: Text(option),
                value: option,
                groupValue: _filterValue,
                onChanged: (value) {
                  setState(() {
                    _filterValue = value!;
                  });
                  Navigator.pop(context);
                },
              );
            }).toList(),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancelar'),
            ),
          ],
        );
      },
    );
  }
}


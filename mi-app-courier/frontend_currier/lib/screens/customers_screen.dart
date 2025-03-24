import 'package:flutter/material.dart';
import '../theme.dart';

class Customer {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String address;
  final int shipments;
  final double totalSpent;

  Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.address,
    required this.shipments,
    required this.totalSpent,
  });
}

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({Key? key}) : super(key: key);

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final _searchController = TextEditingController();
  String _filterValue = 'Todos';
  final List<String> _filterOptions = ['Todos', 'Activos', 'Inactivos', 'VIP'];

  final List<Customer> _customers = [
    Customer(
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Reforma 123, Col. Juárez, CDMX, 06600, México',
      shipments: 12,
      totalSpent: 1250.50,
    ),
    Customer(
      id: '2',
      name: 'María González',
      email: 'maria.gonzalez@example.com',
      phone: '+52 55 8765 4321',
      address: 'Calle Durango 45, Col. Roma, CDMX, 06700, México',
      shipments: 8,
      totalSpent: 850.75,
    ),
    Customer(
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      phone: '+52 55 2345 6789',
      address: 'Av. Insurgentes 789, Col. Condesa, CDMX, 06140, México',
      shipments: 5,
      totalSpent: 520.30,
    ),
    Customer(
      id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      phone: '+52 55 9876 5432',
      address: 'Calle Sonora 67, Col. Hipódromo, CDMX, 06100, México',
      shipments: 15,
      totalSpent: 1800.25,
    ),
    Customer(
      id: '5',
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@example.com',
      phone: '+52 55 3456 7890',
      address: 'Av. Chapultepec 234, Col. Juárez, CDMX, 06600, México',
      shipments: 3,
      totalSpent: 320.15,
    ),
  ];

  List<Customer> get _filteredCustomers {
    if (_filterValue == 'Todos') {
      return _customers;
    } else if (_filterValue == 'Activos') {
      return _customers.where((customer) => customer.shipments > 0).toList();
    } else if (_filterValue == 'Inactivos') {
      return _customers.where((customer) => customer.shipments == 0).toList();
    } else if (_filterValue == 'VIP') {
      return _customers.where((customer) => customer.totalSpent > 1000).toList();
    }
    return _customers;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clientes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              _showFilterDialog();
            },
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navegar a la pantalla de agregar cliente
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
                hintText: 'Buscar cliente...',
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
                Text(
                  '${_filteredCustomers.length} clientes',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Expanded(
            child: _buildCustomersList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navegar a la pantalla de agregar cliente
        },
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildCustomersList() {
    final searchQuery = _searchController.text.toLowerCase();
    final displayedCustomers = _filteredCustomers.where((customer) {
      return customer.name.toLowerCase().contains(searchQuery) ||
          customer.email.toLowerCase().contains(searchQuery) ||
          customer.phone.contains(searchQuery);
    }).toList();

    if (displayedCustomers.isEmpty) {
      return const Center(
        child: Text('No se encontraron clientes'),
      );
    }

    return ListView.builder(
      itemCount: displayedCustomers.length,
      itemBuilder: (context, index) {
        final customer = displayedCustomers[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text(
              customer.name,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(customer.email),
                Text(customer.phone),
              ],
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${customer.shipments} envíos',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                Text(
                  '\$${customer.totalSpent.toStringAsFixed(2)} USD',
                  style: TextStyle(
                    color: customer.totalSpent > 1000 ? AppTheme.primaryColor : null,
                    fontWeight: customer.totalSpent > 1000 ? FontWeight.bold : null,
                  ),
                ),
              ],
            ),
            onTap: () {
              // Navegar a la pantalla de detalle del cliente
            },
          ),
        );
      },
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Filtrar clientes'),
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


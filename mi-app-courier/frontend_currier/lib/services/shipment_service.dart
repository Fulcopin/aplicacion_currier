import 'dart:async';

class ShipmentService {
  // Datos simulados para envíos
  final List<Map<String, dynamic>> _mockShipments = [
    {
      'id': '1',
      'trackingNumber': 'VB-12345678',
      'date': '2025-03-14',
      'status': 'En tránsito',
      'origin': 'Miami, FL',
      'destination': 'Ciudad de México, MX',
      'products': 3,
      'customer': 'Juan Pérez',
      'estimatedDelivery': '2025-03-17',
      'events': [
        {
          'date': '2025-03-14 09:15',
          'location': 'Miami, FL',
          'description': 'Paquete recibido en centro de distribución',
        },
        {
          'date': '2025-03-14 14:30',
          'location': 'Miami, FL',
          'description': 'Paquete procesado',
        },
        {
          'date': '2025-03-15 08:45',
          'location': 'Miami International Airport',
          'description': 'Paquete en tránsito',
        },
      ],
      'productsList': [
        {
          'name': 'Smartphone XYZ',
          'quantity': 1,
          'price': 899.99,
        },
        {
          'name': 'Auriculares Bluetooth',
          'quantity': 2,
          'price': 149.99,
        },
      ],
    },
    {
      'id': '2',
      'trackingNumber': 'VB-87654321',
      'date': '2025-03-10',
      'status': 'Entregado',
      'origin': 'Los Angeles, CA',
      'destination': 'Guadalajara, MX',
      'products': 1,
      'customer': 'María González',
      'estimatedDelivery': '2025-03-13',
      'events': [
        {
          'date': '2025-03-10 10:30',
          'location': 'Los Angeles, CA',
          'description': 'Paquete recibido en centro de distribución',
        },
        {
          'date': '2025-03-11 08:15',
          'location': 'Los Angeles International Airport',
          'description': 'Paquete en tránsito',
        },
        {
          'date': '2025-03-12 14:45',
          'location': 'Aeropuerto Internacional de Guadalajara',
          'description': 'Paquete llegó a destino',
        },
        {
          'date': '2025-03-13 09:30',
          'location': 'Guadalajara, MX',
          'description': 'Paquete entregado',
        },
      ],
      'productsList': [
        {
          'name': 'Laptop ABC',
          'quantity': 1,
          'price': 1299.99,
        },
      ],
    },
    {
      'id': '3',
      'trackingNumber': 'VB-23456789',
      'date': '2025-03-05',
      'status': 'Procesando',
      'origin': 'New York, NY',
      'destination': 'Monterrey, MX',
      'products': 2,
      'customer': 'Carlos Rodríguez',
      'estimatedDelivery': '2025-03-10',
      'events': [
        {
          'date': '2025-03-05 11:45',
          'location': 'New York, NY',
          'description': 'Paquete recibido en centro de distribución',
        },
        {
          'date': '2025-03-05 16:30',
          'location': 'New York, NY',
          'description': 'Paquete en proceso de verificación',
        },
      ],
      'productsList': [
        {
          'name': 'Tablet Pro',
          'quantity': 1,
          'price': 599.99,
        },
        {
          'name': 'Funda protectora',
          'quantity': 1,
          'price': 49.99,
        },
      ],
    },
  ];

  // Método para obtener todos los envíos
  Future<List<Map<String, dynamic>>> getShipments() async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    return List.from(_mockShipments);
  }

  // Método para obtener un envío por ID
  Future<Map<String, dynamic>?> getShipmentById(String id) async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    
    try {
      return _mockShipments.firstWhere((shipment) => shipment['id'] == id);
    } catch (e) {
      return null;
    }
  }

  // Método para crear un nuevo envío
  Future<Map<String, dynamic>> createShipment(Map<String, dynamic> shipment) async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    
    final newShipment = {
      ...shipment,
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'trackingNumber': 'VB-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
      'date': DateTime.now().toString().substring(0, 10),
      'status': 'Procesando',
      'events': [
        {
          'date': DateTime.now().toString().substring(0, 16).replaceAll('T', ' '),
          'location': shipment['origin'],
          'description': 'Paquete registrado en el sistema',
        },
      ],
    };
    
    _mockShipments.add(newShipment);
    return newShipment;
  }
}


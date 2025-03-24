import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';
import 'shipment_detail_screen.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({Key? key}) : super(key: key);

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  final _trackingController = TextEditingController();
  bool _isSearching = false;
  bool _hasResults = false;

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Seguimiento de envíos'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTrackingForm(),
            const SizedBox(height: 24),
            if (_isSearching) ...[
              const Center(
                child: CircularProgressIndicator(),
              ),
            ] else if (_hasResults) ...[
              _buildTrackingResult(),
            ] else ...[
              _buildRecentTrackings(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Rastrear paquete',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Ingresa el número de seguimiento para rastrear tu envío',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _trackingController,
                    decoration: const InputDecoration(
                      hintText: 'Ej. VB-12345678',
                      prefixIcon: Icon(Icons.search),
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9\-]')),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () {
                    _searchTracking();
                  },
                  child: const Text('Rastrear'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(
                  Icons.qr_code_scanner,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () {
                    // Aquí iría la lógica para escanear un código QR
                  },
                  child: const Text('Escanear código QR'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingResult() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Resultado de búsqueda',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    setState(() {
                      _hasResults = false;
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.primaryColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tracking: ${_trackingController.text}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text(
                          'En tránsito',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Origen: Miami, FL',
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Destino: Ciudad de México, MX',
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Última actualización: 15 Mar 2025, 10:30 AM',
                  ),
                  const SizedBox(height: 8),
                  const LinearProgressIndicator(
                    value: 0.65,
                    backgroundColor: Colors.white,
                    color: AppTheme.primaryColor,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ShipmentDetailScreen(
                            trackingNumber: _trackingController.text,
                          ),
                        ),
                      );
                    },
                    child: const Text('Ver detalles'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTrackings() {
    final recentTrackings = [
      {
        'tracking': 'VB-12345678',
        'status': 'En tránsito',
        'date': '15 Mar 2025',
      },
      {
        'tracking': 'VB-87654321',
        'status': 'Entregado',
        'date': '10 Mar 2025',
      },
      {
        'tracking': 'VB-23456789',
        'status': 'Procesando',
        'date': '05 Mar 2025',
      },
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Búsquedas recientes',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: recentTrackings.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                final tracking = recentTrackings[index];
                return ListTile(
                  title: Text(
                    tracking['tracking']!,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    '${tracking['status']} - ${tracking['date']}',
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.arrow_forward_ios, size: 16),
                    onPressed: () {
                      _trackingController.text = tracking['tracking']!;
                      _searchTracking();
                    },
                  ),
                  onTap: () {
                    _trackingController.text = tracking['tracking']!;
                    _searchTracking();
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _searchTracking() {
    if (_trackingController.text.isNotEmpty) {
      setState(() {
        _isSearching = true;
      });

      // Simulamos una búsqueda con un delay
      Future.delayed(const Duration(seconds: 1), () {
        setState(() {
          _isSearching = false;
          _hasResults = true;
        });
      });
    }
  }
}


import 'package:flutter/material.dart';
import 'package:timeline_tile/timeline_tile.dart';
import '../theme.dart';
import '../widgets/shipment_info_card.dart';

class ShipmentDetailScreen extends StatelessWidget {
  final String trackingNumber;

  const ShipmentDetailScreen({
    Key? key,
    required this.trackingNumber,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Envío $trackingNumber'),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_outlined),
            onPressed: () {},
            tooltip: 'Imprimir',
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
            tooltip: 'Compartir',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusBanner(context),
            const SizedBox(height: 24),
            _buildShipmentDetails(context),
            const SizedBox(height: 24),
            _buildTrackingTimeline(context),
            const SizedBox(height: 24),
            _buildPackageDetails(context),
            const SizedBox(height: 24),
            _buildActionButtons(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner(BuildContext context) {
    return Container(
      width: double.infinity,
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
            children: [
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
              const Spacer(),
              Text(
                'Actualizado: 15 Mar 2025, 10:30 AM',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Su paquete está en tránsito y llegará en aproximadamente 2 días',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 8),
          const LinearProgressIndicator(
            value: 0.65,
            backgroundColor: Colors.white,
            color: AppTheme.primaryColor,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Enviado',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(
                'En tránsito',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
              ),
              Text(
                'Entregado',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShipmentDetails(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: ShipmentInfoCard(
            title: 'Origen',
            icon: Icons.flight_takeoff,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Miami, FL',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Estados Unidos',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'Fecha de envío: 12 Mar 2025',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ShipmentInfoCard(
            title: 'Destino',
            icon: Icons.flight_land,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ciudad de México',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'México',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'Entrega estimada: 17 Mar 2025',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTrackingTimeline(BuildContext context) {
    final events = [
      {
        'title': 'Paquete entregado en centro de distribución',
        'location': 'Miami, FL',
        'date': '12 Mar 2025, 09:15 AM',
        'isCompleted': true,
      },
      {
        'title': 'Paquete procesado',
        'location': 'Miami, FL',
        'date': '12 Mar 2025, 02:30 PM',
        'isCompleted': true,
      },
      {
        'title': 'Paquete en tránsito',
        'location': 'Miami International Airport',
        'date': '13 Mar 2025, 08:45 AM',
        'isCompleted': true,
      },
      {
        'title': 'Paquete llegó a destino',
        'location': 'Aeropuerto Internacional de la Ciudad de México',
        'date': '14 Mar 2025, 11:20 AM',
        'isCompleted': true,
      },
      {
        'title': 'En proceso de despacho aduanero',
        'location': 'Aduana CDMX',
        'date': '15 Mar 2025, 09:30 AM',
        'isCompleted': true,
      },
      {
        'title': 'En ruta para entrega final',
        'location': 'Centro de distribución CDMX',
        'date': '15 Mar 2025, 10:30 AM',
        'isCompleted': false,
        'isCurrent': true,
      },
      {
        'title': 'Entregado',
        'location': 'Ciudad de México',
        'date': 'Pendiente',
        'isCompleted': false,
      },
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Seguimiento del envío',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: events.length,
              itemBuilder: (context, index) {
                final event = events[index];
                final isFirst = index == 0;
                final isLast = index == events.length - 1;
                final isCurrent = event.containsKey('isCurrent') && event['isCurrent'] == true;

                return TimelineTile(
                  isFirst: isFirst,
                  isLast: isLast,
                  indicatorStyle: IndicatorStyle(
                    width: 20,
                    color: event['isCompleted'] == true
                        ? AppTheme.primaryColor
                        : isCurrent
                            ? AppTheme.warningColor
                            : AppTheme.secondaryColor,
                    iconStyle: IconStyle(
                      color: Colors.white,
                      iconData: event['isCompleted'] == true
                          ? Icons.check
                          : isCurrent
                              ? Icons.local_shipping
                              : Icons.circle,
                      fontSize: 12,
                    ),
                  ),
                  beforeLineStyle: LineStyle(
                    color: event['isCompleted'] == true
                        ? AppTheme.primaryColor
                        : AppTheme.secondaryColor,
                  ),
                  afterLineStyle: LineStyle(
                    color: index < events.length - 1 && events[index + 1]['isCompleted'] == true
                        ? AppTheme.primaryColor
                        : AppTheme.secondaryColor,
                  ),
                  endChild: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          event['title'] as String,
                          style: TextStyle(
                            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                            color: isCurrent ? AppTheme.primaryColor : null,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          event['location'] as String,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          event['date'] as String,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppTheme.mutedTextColor,
                              ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPackageDetails(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalles del paquete',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildDetailItem(
                    context,
                    'Peso',
                    '2.5 kg',
                    Icons.scale,
                  ),
                ),
                Expanded(
                  child: _buildDetailItem(
                    context,
                    'Dimensiones',
                    '30 x 20 x 15 cm',
                    Icons.straighten,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildDetailItem(
                    context,
                    'Categoría',
                    'Electrónicos',
                    Icons.category,
                  ),
                ),
                Expanded(
                  child: _buildDetailItem(
                    context,
                    'Valor declarado',
                    '\$350.00 USD',
                    Icons.attach_money,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              'Información del remitente',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            _buildContactInfo(
              context,
              'Juan Pérez',
              'juan.perez@example.com',
              '+1 (305) 555-1234',
              '123 Main St, Miami, FL 33101, USA',
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              'Información del destinatario',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            _buildContactInfo(
              context,
              'María González',
              'maria.gonzalez@example.com',
              '+52 55 1234 5678',
              'Av. Reforma 123, Col. Juárez, CDMX, 06600, México',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: AppTheme.mutedTextColor,
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildContactInfo(
    BuildContext context,
    String name,
    String email,
    String phone,
    String address,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          name,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            const Icon(
              Icons.email_outlined,
              size: 16,
              color: AppTheme.mutedTextColor,
            ),
            const SizedBox(width: 8),
            Text(
              email,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            const Icon(
              Icons.phone_outlined,
              size: 16,
              color: AppTheme.mutedTextColor,
            ),
            const SizedBox(width: 8),
            Text(
              phone,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(
              Icons.location_on_outlined,
              size: 16,
              color: AppTheme.mutedTextColor,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                address,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.message_outlined),
            label: const Text('Contactar'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.report_problem_outlined),
            label: const Text('Reportar problema'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}


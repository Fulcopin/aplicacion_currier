import 'package:flutter/material.dart';
import '../theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
  bool _emailAlerts = true;
  String _language = 'Español';
  final List<String> _languages = ['Español', 'English', 'Português', 'Français'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Apariencia'),
          _buildSettingCard(
            title: 'Modo oscuro',
            description: 'Cambiar entre modo claro y oscuro',
            trailing: Switch(
              value: _darkMode,
              onChanged: (value) {
                setState(() {
                  _darkMode = value;
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
          ),
          _buildSettingCard(
            title: 'Idioma',
            description: 'Seleccionar el idioma de la aplicación',
            trailing: DropdownButton<String>(
              value: _language,
              onChanged: (String? newValue) {
                setState(() {
                  _language = newValue!;
                });
              },
              items: _languages.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              underline: Container(),
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionHeader('Notificaciones'),
          _buildSettingCard(
            title: 'Notificaciones push',
            description: 'Recibir notificaciones en el dispositivo',
            trailing: Switch(
              value: _notifications,
              onChanged: (value) {
                setState(() {
                  _notifications = value;
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
          ),
          _buildSettingCard(
            title: 'Alertas por correo',
            description: 'Recibir alertas por correo electrónico',
            trailing: Switch(
              value: _emailAlerts,
              onChanged: (value) {
                setState(() {
                  _emailAlerts = value;
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionHeader('Cuenta'),
          _buildSettingCard(
            title: 'Información personal',
            description: 'Actualizar datos de perfil',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navegar a la pantalla de información personal
            },
          ),
          _buildSettingCard(
            title: 'Cambiar contraseña',
            description: 'Actualizar contraseña de acceso',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navegar a la pantalla de cambio de contraseña
            },
          ),
          _buildSettingCard(
            title: 'Preferencias de privacidad',
            description: 'Gestionar configuración de privacidad',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Navegar a la pantalla de preferencias de privacidad
            },
          ),
          const SizedBox(height: 16),
          _buildSectionHeader('Información'),
          _buildSettingCard(
            title: 'Acerca de',
            description: 'Información sobre la aplicación',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              _showAboutDialog();
            },
          ),
          _buildSettingCard(
            title: 'Términos y condiciones',
            description: 'Leer términos de uso del servicio',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Mostrar términos y condiciones
            },
          ),
          _buildSettingCard(
            title: 'Política de privacidad',
            description: 'Leer política de privacidad',
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              // Mostrar política de privacidad
            },
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              _showLogoutConfirmation();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryColor,
        ),
      ),
    );
  }

  Widget _buildSettingCard({
    required String title,
    required String description,
    required Widget trailing,
    VoidCallback? onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(description),
        trailing: trailing,
        onTap: onTap,
      ),
    );
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Acerca de Vacabox'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Vacabox Courier App'),
              SizedBox(height: 8),
              Text('Versión: 1.0.0'),
              SizedBox(height: 8),
              Text('© 2025 Vacabox. Todos los derechos reservados.'),
              SizedBox(height: 16),
              Text(
                'Aplicación de gestión para servicios de courier y paquetería internacional.',
                style: TextStyle(
                  color: AppTheme.mutedTextColor,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cerrar'),
            ),
          ],
        );
      },
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Cerrar sesión'),
          content: const Text('¿Está seguro que desea cerrar sesión?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushReplacementNamed(context, '/');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Cerrar sesión'),
            ),
          ],
        );
      },
    );
  }
}


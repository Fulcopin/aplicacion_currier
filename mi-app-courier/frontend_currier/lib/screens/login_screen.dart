import 'package:flutter/material.dart';
import '../theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _obscurePassword = true;
  String? _emailError;
  String? _passwordError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // Validar el formulario antes de navegar
  bool _validateForm() {
    bool isValid = true;
    
    // Validar email
    if (_emailController.text.isEmpty) {
      setState(() {
        _emailError = 'El correo electrónico es obligatorio';
      });
      isValid = false;
    } else if (!_emailController.text.contains('@')) {
      setState(() {
        _emailError = 'Ingrese un correo electrónico válido';
      });
      isValid = false;
    } else {
      setState(() {
        _emailError = null;
      });
    }
    
    // Validar contraseña
    if (_passwordController.text.isEmpty) {
      setState(() {
        _passwordError = 'La contraseña es obligatoria';
      });
      isValid = false;
    } else if (_passwordController.text.length < 6) {
      setState(() {
        _passwordError = 'La contraseña debe tener al menos 6 caracteres';
      });
      isValid = false;
    } else {
      setState(() {
        _passwordError = null;
      });
    }
    
    return isValid;
  }

  // Manejar el inicio de sesión
  void _handleLogin() {
    if (_validateForm()) {
      // En un caso real, aquí iría la autenticación con el backend
      // Por ahora, simplemente navegamos al dashboard
      Navigator.pushReplacementNamed(context, '/dashboard');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            if (constraints.maxWidth > 800) {
              // Diseño para tablet/desktop
              return Row(
                children: [
                  Expanded(
                    child: _buildLoginForm(),
                  ),
                  Expanded(
                    child: _buildRightPanel(),
                  ),
                ],
              );
            } else {
              // Diseño para móvil
              return _buildLoginForm();
            }
          },
        ),
      ),
    );
  }

Widget _buildLoginForm() {
  return Container(
    color: AppTheme.secondaryColor.withOpacity(0.2),
    padding: const EdgeInsets.all(24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Centrar "Vacabox"
        Center(
          child: Column(
            children: [
              Image.asset(
                'assets/images/logo.jpeg', // Ruta de la imagen del logo
                height: 100, // Ajusta la altura según sea necesario
                width: 100,  // Ajusta el ancho según sea necesario
                fit: BoxFit.cover, // Ajusta la forma en que la imagen se ajusta al espacio
              ),
              const SizedBox(height: 16), // Espacio entre la imagen y el texto
              Text(
                'Vacabox',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ),
        const Spacer(),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Trae tus productos a menos precio',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Text(
                'Bienvenido Inicia Seccion',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: 400,
                child: TextField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    hintText: 'Email',
                    prefixIcon: const Icon(Icons.email_outlined),
                    errorText: _emailError,
                  ),
                  keyboardType: TextInputType.emailAddress,
                  onChanged: (value) {
                    // Limpiar el error cuando el usuario comienza a escribir
                    if (_emailError != null) {
                      setState(() {
                        _emailError = null;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 400,
                child: TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'Contraseña',
                    prefixIcon: const Icon(Icons.lock_outline),
                    errorText: _passwordError,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  onChanged: (value) {
                    // Limpiar el error cuando el usuario comienza a escribir
                    if (_passwordError != null) {
                      setState(() {
                        _passwordError = null;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 400,
                child: Row(
                  children: [
                    Checkbox(
                      value: _rememberMe,
                      onChanged: (value) {
                        setState(() {
                          _rememberMe = value ?? false;
                        });
                      },
                      activeColor: AppTheme.primaryColor,
                    ),
                    const Text('Recordar mis datos'),
                    const Spacer(),
                    TextButton(
                      onPressed: () {
                        // Lógica para recuperar contraseña
                      },
                      child: const Text('¿Olvidaste tu contraseña?'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 400,
                child: ElevatedButton(
                  onPressed: _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Iniciar sesión'),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 400,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Lógica para iniciar sesión con Gmail
                  },
                  icon: const Icon(Icons.mail_outline),
                  label: const Text('Iniciar sesión con Gmail'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black87,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 400,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('¿No tienes una cuenta?'),
                    TextButton(
                      onPressed: () {
                        // Lógica para registrarse
                      },
                      child: const Text('Regístrate'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
      ],
    ),
  );
}

Widget _buildRightPanel() {
  return Container(
    color: Colors.white,
    child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 24, right: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _buildNavItem('Home', true),
              _buildNavItem('About us', false),
              _buildNavItem('Blog', false),
              _buildNavItem('Pricing', false),
            ],
          ),
        ),
        Expanded(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Agrega la imagen del logo aquí (sin const)
                Image.asset(
                  'assets/images/logo.jpeg', // Ruta de la imagen del logo
                  height: 100, // Ajusta la altura según sea necesario
                  width: 100,  // Ajusta el ancho según sea necesario
                  fit: BoxFit.cover, // Ajusta la forma en que la imagen se ajusta al espacio
                ),
                const SizedBox(height: 24),
                const Text(
                  'Servicio de courier confiable y rápido',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 48),
                  child: Text(
                    'Envía y recibe paquetes de manera segura con nuestro servicio premium de courier internacional.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.mutedTextColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    ),
  );
}

  Widget _buildNavItem(String title, bool isActive) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: Text(
      title,
      style: TextStyle(
        color: isActive ? AppTheme.textColor : AppTheme.mutedTextColor,
        fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
        decoration: isActive ? TextDecoration.underline : TextDecoration.none,
        decorationThickness: 2,
        decorationColor: AppTheme.textColor,
      ),
    ),
  );
}
}


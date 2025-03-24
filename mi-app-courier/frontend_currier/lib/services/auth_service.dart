import 'package:flutter/material.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  bool get isAdmin => _currentUser?.isAdmin ?? false;

  // Datos de usuario simulados
  final _users = [
    User(
      id: '1',
      name: 'Admin Usuario',
      email: 'admin@example.com',
      role: 'admin',
    ),
    User(
      id: '2',
      name: 'Cliente Usuario',
      email: 'cliente@example.com',
      role: 'client',
    ),
  ];

  Future<bool> login(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simular retraso de red
      await Future.delayed(const Duration(seconds: 1));

      // Buscar usuario por email (en un caso real verificaríamos también la contraseña)
      final user = _users.firstWhere(
        (user) => user.email == email,
        orElse: () => throw Exception('Usuario no encontrado'),
      );

      _currentUser = user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _currentUser = null;
    notifyListeners();
  }
}


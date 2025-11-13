import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();
  
  User? _user;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final userJson = await _storage.getUser();
    if (userJson != null) {
      _user = User.fromJson(jsonDecode(userJson));
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<String?> login(String username, String password) async {
    try {
      final response = await _api.post(
        ApiConstants.login,
        {'username': username, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _storage.saveToken(data['token']);
        await _storage.saveUser(jsonEncode(data['user']));
        _user = User.fromJson(data['user']);
        _isAuthenticated = true;
        notifyListeners();
        return null;
      } else {
        return 'Credenciais inválidas';
      }
    } catch (e) {
      return 'Erro ao conectar ao servidor';
    }
  }

  Future<void> logout() async {
    await _storage.clear();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  bool hasRole(String role) {
    return _user?.role == role;
  }

  bool hasAnyRole(List<String> roles) {
    return _user != null && roles.contains(_user!.role);
  }
}

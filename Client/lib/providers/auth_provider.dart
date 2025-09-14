import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../models/auth_response.dart';
import '../models/login_request.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _isAuthenticated;

  // Khởi tạo - kiểm tra session
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      print('🔍 AuthProvider: Starting initialize...');
      
      final localUser = await AuthService.getUser();
      print('🔍 AuthProvider: Local user = ${localUser?.fullName ?? "null"}');
      
      if (localUser != null) {
        print('🔍 AuthProvider: Found local user, validating with server...');
        final response = await AuthService.getMe();
        print('🔍 AuthProvider: getMe response success = ${response.success}');
        
        if (response.success && response.user != null) {
          _user = response.user;
          _isAuthenticated = true;
          await AuthService.saveUser(response.user!);
          print('✅ AuthProvider: User data validated and updated from server');
        } else {
          _user = localUser;
          _isAuthenticated = true;
          print('⚠️ AuthProvider: Using local user data (server validation failed)');
        }
      } else {
        print('🔍 AuthProvider: No local user, checking server...');
        final response = await AuthService.getMe();
        print('🔍 AuthProvider: getMe response success = ${response.success}');
        
        if (response.success && response.user != null) {
          _user = response.user;
          _isAuthenticated = true;
          await AuthService.saveUser(response.user!);
          print('✅ AuthProvider: User data restored from server');
        } else {
          _user = null;
          _isAuthenticated = false;
          await AuthService.clearUser();
          await AuthService.logout();
          print('❌ AuthProvider: No valid session found');
        }
      }
      
      print('🔍 AuthProvider: Final state - user = ${_user?.fullName ?? "null"}, authenticated = $_isAuthenticated');
    } catch (e) {
      print('❌ Initialize error: $e');
      _user = null;
      _isAuthenticated = false;
    }
    
    _isLoading = false;
    notifyListeners();
  }

  // Đăng nhập
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loginRequest = LoginRequest(email: email, password: password);
      final response = await AuthService.login(loginRequest);

      print('🔐 AuthProvider: Login response - success: ${response.success}, user: ${response.user?.fullName ?? "null"}');

      if (response.success && response.user != null) {
        _user = response.user;
        _isAuthenticated = true;
        _errorMessage = null;
        _isLoading = false;
        print('🔐 AuthProvider: Login successful, user set to: ${_user?.fullName}');
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Đăng xuất
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await AuthService.logout();
    } catch (e) {
      print('❌ Logout error: $e');
    }

    _user = null;
    _isAuthenticated = false;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }

  // Xóa lỗi
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

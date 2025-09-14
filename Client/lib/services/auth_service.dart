import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import '../models/user.dart';
import '../models/auth_response.dart';
import '../models/login_request.dart';

class AuthService {
  static const String userKey = 'user_data';

  // Lưu user data
  static Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(userKey, jsonEncode(user.toJson()));
  }

  // Lấy user data
  static Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString(userKey);
    if (userString != null) {
      final userJson = jsonDecode(userString);
      return User.fromJson(userJson);
    }
    return null;
  }

  // Xóa user data
  static Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(userKey);
  }

  // Đăng nhập
  static Future<AuthResponse> login(LoginRequest loginRequest) async {
    final response = await ApiService.post('/auth/login', loginRequest.toJson());
    
    print('🔐 Login API Response: $response'); // Debug log
    
    if (response['success']) {
      final data = response['data'];
      print('🔐 Login data: $data'); // Debug log
      
      // Parse user data
      User? user;
      if (data['status'] == 'success' && data['data'] != null && data['data']['user'] != null) {
        try {
          print('🔐 Parsing user from: ${data['data']['user']}'); // Debug log
          user = User.fromJson(data['data']['user']);
          print('🔐 User parsed successfully: ${user.fullName}'); // Debug log
        } catch (e) {
          print('❌ Error parsing user: $e');
          user = null;
        }
      }
      
      final authResponse = AuthResponse(
        success: data['status'] == 'success',
        message: data['status'] == 'success' ? 'Đăng nhập thành công' : data['message'],
        user: user,
        token: data['token'],
      );
      
      // Lưu user data nếu đăng nhập thành công
      if (authResponse.success && authResponse.user != null) {
        await saveUser(authResponse.user!);
      }
      
      return authResponse;
    } else {
      return AuthResponse(
        success: false,
        message: response['message'] ?? 'Đăng nhập thất bại',
        user: null,
        token: null,
      );
    }
  }

  // Lấy thông tin user hiện tại
  static Future<AuthResponse> getMe() async {
    final response = await ApiService.get('/auth/me');
    
    if (response['success']) {
      final data = response['data'];
      print('🔍 AuthService.getMe data structure: $data');
      print('🔍 data.keys: ${data.keys.toList()}');
      if (data['data'] != null) {
        print('🔍 data.data keys: ${data['data'].keys.toList()}');
      }
      
      User? user;
      if (data['status'] == 'success' && data['data'] != null && data['data']['user'] != null) {
        try {
          print('🔍 Parsing user from: ${data['data']['user']}');
          user = User.fromJson(data['data']['user']);
        } catch (e) {
          print('❌ Error parsing user: $e');
          user = null;
        }
      }
      
      return AuthResponse(
        success: data['status'] == 'success',
        message: data['status'] == 'success' ? 'Lấy thông tin thành công' : data['message'],
        user: user,
        token: null,
      );
    } else {
      return AuthResponse(
        success: false,
        message: response['message'] ?? 'Không thể lấy thông tin user',
        user: null,
        token: null,
      );
    }
  }

  // Đăng xuất
  static Future<AuthResponse> logout() async {
    final response = await ApiService.post('/auth/logout', null);
    
    // Xóa user data và cookies
    await clearUser();
    await ApiService.clearCookies();
    
    return AuthResponse(
      success: true,
      message: 'Đăng xuất thành công',
      user: null,
      token: null,
    );
  }

  // Kiểm tra token có hợp lệ không
  static Future<bool> isTokenValid() async {
    try {
      final response = await ApiService.get('/auth/me');
      return response['success'] == true;
    } catch (e) {
      print('❌ Token validation failed: $e');
      return false;
    }
  }

  // Kiểm tra có đăng nhập không
  static Future<bool> isLoggedIn() async {
    // Thử gọi getMe để kiểm tra token
    try {
      final response = await AuthService.getMe();
      return response.success;
    } catch (e) {
      print('❌ isLoggedIn check failed: $e');
      return false;
    }
  }
}

import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.9.35:5000/api';
  
  static late Dio _dio;
  static late CookieJar _cookieJar;
  static bool _initialized = false;

  // Khởi tạo Dio với persistent cookie jar
  static Future<void> initialize() async {
    if (_initialized) return;
    
    // Tạo persistent cookie jar
    final appDocDir = await getApplicationDocumentsDirectory();
    final cookiePath = '${appDocDir.path}/cookies';
    _cookieJar = PersistCookieJar(
      storage: FileStorage(cookiePath),
    );
    
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));
    
    // Thêm cookie manager để tự động xử lý cookie
    _dio.interceptors.add(CookieManager(_cookieJar));
    
    // Thêm logging interceptor
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('🌐 API: $obj'),
    ));
    
    _initialized = true;
  }

  // GET request
  static Future<Map<String, dynamic>> get(String endpoint) async {
    await initialize();
    try {
      final response = await _dio.get(endpoint);
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // POST request
  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic>? data) async {
    await initialize();
    try {
      final response = await _dio.post(endpoint, data: data);
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // PUT request
  static Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic>? data) async {
    await initialize();
    try {
      final response = await _dio.put(endpoint, data: data);
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // DELETE request
  static Future<Map<String, dynamic>> delete(String endpoint) async {
    await initialize();
    try {
      final response = await _dio.delete(endpoint);
      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // Xử lý response
  static Map<String, dynamic> _handleResponse(Response response) {
    return {
      'success': response.statusCode! >= 200 && response.statusCode! < 300,
      'statusCode': response.statusCode,
      'data': response.data,
      'message': response.data?['message'] ?? _getDefaultMessage(response.statusCode!),
    };
  }

  // Xử lý lỗi
  static Map<String, dynamic> _handleError(dynamic error) {
    if (error is DioException) {
      String errorMessage = 'Network error';
      
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
          errorMessage = 'Connection timeout. Please check your internet connection and try again.';
          break;
        case DioExceptionType.sendTimeout:
          errorMessage = 'Send timeout. The server is taking too long to respond.';
          break;
        case DioExceptionType.receiveTimeout:
          errorMessage = 'Receive timeout. The server is taking too long to respond.';
          break;
        case DioExceptionType.connectionError:
          errorMessage = 'Connection error. Please check if the server is running and accessible.';
          break;
        case DioExceptionType.badResponse:
          errorMessage = error.response?.data?['message'] ?? 'Server error: ${error.response?.statusCode}';
          break;
        case DioExceptionType.cancel:
          errorMessage = 'Request was cancelled.';
          break;
        default:
          errorMessage = error.message ?? 'Unknown network error';
      }
      
      return {
        'success': false,
        'statusCode': error.response?.statusCode ?? 0,
        'data': error.response?.data,
        'message': errorMessage,
      };
    }
    
    return {
      'success': false,
      'statusCode': 0,
      'data': null,
      'message': error.toString(),
    };
  }

  // Lấy message mặc định
  static String _getDefaultMessage(int statusCode) {
    switch (statusCode) {
      case 200:
        return 'Success';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 500:
        return 'Internal server error';
      default:
        return 'Unknown error';
    }
  }

  // Xóa tất cả cookies (logout)
  static Future<void> clearCookies() async {
    await initialize();
    await _cookieJar.deleteAll();
  }

  // Kiểm tra có cookie không
  static Future<bool> hasCookies() async {
    await initialize();
    final cookies = await _cookieJar.loadForRequest(Uri.parse(baseUrl));
    return cookies.isNotEmpty;
  }

  // Kiểm tra kết nối server
  static Future<bool> testConnection() async {
    await initialize();
    try {
      final response = await _dio.get('/health', 
        options: Options(
          receiveTimeout: const Duration(seconds: 10),
          sendTimeout: const Duration(seconds: 10),
        )
      );
      return response.statusCode == 200;
    } catch (e) {
      print('🌐 API: Connection test failed - $e');
      return false;
    }
  }

  // Lấy thông tin server
  static String getServerInfo() {
    return 'Server: $baseUrl\nTimeouts: Connect=30s, Send=30s, Receive=30s';
  }
}

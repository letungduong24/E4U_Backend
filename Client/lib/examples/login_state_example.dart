import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// Ví dụ minh họa cách quản lý state trong Login Page
/// 
/// Đây là file demo để bạn hiểu rõ hơn về state management
/// KHÔNG sử dụng trong production
class LoginStateExample extends StatefulWidget {
  const LoginStateExample({super.key});

  @override
  State<LoginStateExample> createState() => _LoginStateExampleState();
}

class _LoginStateExampleState extends State<LoginStateExample> {
  // ===== LOCAL STATE (State cục bộ) =====
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false; // Ví dụ thêm local state

  @override
  void dispose() {
    // Clean up local state
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('State Management Demo')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ===== DEMO: Local State =====
            _buildLocalStateDemo(),
            const SizedBox(height: 20),
            
            // ===== DEMO: Global State =====
            _buildGlobalStateDemo(),
            const SizedBox(height: 20),
            
            // ===== DEMO: Form với State Management =====
            _buildLoginForm(),
          ],
        ),
      ),
    );
  }

  /// Demo Local State - chỉ ảnh hưởng đến widget này
  Widget _buildLocalStateDemo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '1. LOCAL STATE (State cục bộ)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text('Obscure Password: $_obscurePassword'),
            Text('Remember Me: $_rememberMe'),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    // Thay đổi local state
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                  child: const Text('Toggle Password'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    // Thay đổi local state
                    setState(() {
                      _rememberMe = !_rememberMe;
                    });
                  },
                  child: const Text('Toggle Remember'),
                ),
              ],
            ),
            const Text(
              '→ Chỉ widget này rebuild khi local state thay đổi',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  /// Demo Global State - ảnh hưởng đến toàn ứng dụng
  Widget _buildGlobalStateDemo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '2. GLOBAL STATE (State toàn cục)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            
            // Consumer sẽ tự động rebuild khi AuthProvider thay đổi
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Is Loading: ${authProvider.isLoading}'),
                    Text('Is Authenticated: ${authProvider.isAuthenticated}'),
                    Text('User: ${authProvider.user?.fullName ?? "Chưa đăng nhập"}'),
                    Text('Error: ${authProvider.errorMessage ?? "Không có lỗi"}'),
                  ],
                );
              },
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () {
                // Thay đổi global state
                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                authProvider.clearError(); // Gọi method trong AuthProvider
              },
              child: const Text('Clear Error'),
            ),
            const Text(
              '→ Tất cả Consumer<AuthProvider> sẽ rebuild khi global state thay đổi',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  /// Demo Form với State Management
  Widget _buildLoginForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '3. FORM VỚI STATE MANAGEMENT',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 16),
            
            // Form fields
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                labelText: 'Password',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword; // Local state
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Login button với Consumer
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _handleLogin,
                    child: authProvider.isLoading
                        ? const CircularProgressIndicator()
                        : const Text('Login'),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 16),
            
            // Error display với Consumer
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                if (authProvider.errorMessage != null) {
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      authProvider.errorMessage!,
                      style: TextStyle(color: Colors.red[700]),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Xử lý login - kết hợp local và global state
  Future<void> _handleLogin() async {
    // 1. Validation (Local state)
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // 2. Gọi global state
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    // 3. Xử lý kết quả
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng nhập thành công!')),
      );
    }
  }
}

/// Demo về cách AuthProvider hoạt động
class AuthProviderDemo {
  // Giả lập AuthProvider để demo
  bool _isLoading = false;
  String? _errorMessage;
  String? _user;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get user => _user;

  /// Demo login process
  Future<bool> login(String email, String password) async {
    print('🔄 Bắt đầu login process...');
    
    // 1. Set loading state
    _isLoading = true;
    _errorMessage = null;
    print('📱 UI sẽ hiển thị loading spinner');
    
    // Giả lập API call
    await Future.delayed(const Duration(seconds: 2));
    
    // 2. Xử lý kết quả
    if (email == 'demo@example.com' && password == '123456') {
      _user = 'Demo User';
      _isLoading = false;
      print('✅ Login thành công - UI sẽ chuyển trang');
      return true;
    } else {
      _errorMessage = 'Email hoặc mật khẩu không đúng';
      _isLoading = false;
      print('❌ Login thất bại - UI sẽ hiển thị lỗi');
      return false;
    }
  }

  /// Demo clear error
  void clearError() {
    _errorMessage = null;
    print('🧹 Xóa lỗi - UI sẽ ẩn error message');
  }
}


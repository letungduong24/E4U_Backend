# Hướng dẫn Quản lý State trong Login Page

## 🏗️ Kiến trúc State Management

### 1. **Cấu trúc tổng quan**

```
LoginPage (UI Layer)
    ↓
AuthProvider (State Management Layer)
    ↓
AuthService (Service Layer)
    ↓
API Service (Network Layer)
```

## 📊 Các loại State trong Login

### **1. Local State (State cục bộ)**
```dart
class _LoginPageState extends State<LoginPage> {
  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  // UI state
  bool _obscurePassword = true;  // Ẩn/hiện mật khẩu
}
```

**Mục đích:** Quản lý trạng thái UI cục bộ của trang login
- Form validation
- Hiển thị/ẩn mật khẩu
- Input controllers

### **2. Global State (State toàn cục)**
```dart
class AuthProvider with ChangeNotifier {
  User? _user;                    // Thông tin user
  bool _isLoading = false;        // Trạng thái loading
  String? _errorMessage;          // Thông báo lỗi
  bool _isAuthenticated = false;  // Trạng thái đăng nhập
}
```

**Mục đích:** Quản lý trạng thái xác thực toàn ứng dụng
- Thông tin user
- Trạng thái đăng nhập
- Loading states
- Error handling

## 🔄 Luồng xử lý State

### **Khi người dùng nhấn "Đăng nhập":**

1. **Validation (Local State)**
```dart
Future<void> _handleLogin() async {
  // 1. Kiểm tra form validation
  if (!_formKey.currentState!.validate()) {
    return; // Dừng nếu form không hợp lệ
  }
}
```

2. **Gọi AuthProvider (Global State)**
```dart
  // 2. Lấy AuthProvider và gọi login
  final authProvider = Provider.of<AuthProvider>(context, listen: false);
  final success = await authProvider.login(
    _emailController.text.trim(),
    _passwordController.text,
  );
```

3. **AuthProvider xử lý (State Management)**
```dart
Future<bool> login(String email, String password) async {
  _isLoading = true;        // Bắt đầu loading
  _errorMessage = null;     // Xóa lỗi cũ
  notifyListeners();        // Thông báo UI cập nhật

  try {
    // Gọi service
    final response = await AuthService.login(loginRequest);
    
    if (response.success) {
      _user = response.user;           // Lưu user
      _isAuthenticated = true;         // Đánh dấu đã đăng nhập
      _errorMessage = null;            // Xóa lỗi
    } else {
      _errorMessage = response.message; // Lưu lỗi
    }
  } catch (e) {
    _errorMessage = 'Lỗi kết nối: ${e.toString()}';
  }
  
  _isLoading = false;       // Kết thúc loading
  notifyListeners();        // Thông báo UI cập nhật
  return success;
}
```

4. **UI phản ứng (Consumer Widgets)**
```dart
// Button sẽ tự động cập nhật khi isLoading thay đổi
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    return ElevatedButton(
      onPressed: authProvider.isLoading ? null : _handleLogin,
      child: authProvider.isLoading
          ? CircularProgressIndicator()  // Hiển thị loading
          : Text('Đăng nhập'),           // Hiển thị text bình thường
    );
  },
)

// Error message sẽ tự động hiện/ẩn
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    if (authProvider.errorMessage != null) {
      return Container(/* Hiển thị lỗi */);
    }
    return SizedBox.shrink(); // Ẩn nếu không có lỗi
  },
)
```

## 🎯 Các Pattern State Management được sử dụng

### **1. Provider Pattern**
```dart
// Trong main.dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
  ],
  child: MaterialApp(...),
)

// Trong LoginPage
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    // UI sẽ rebuild khi AuthProvider thay đổi
  },
)
```

### **2. ChangeNotifier Pattern**
```dart
class AuthProvider with ChangeNotifier {
  // Khi state thay đổi, gọi notifyListeners()
  void updateState() {
    notifyListeners(); // Thông báo tất cả Consumer rebuild
  }
}
```

### **3. Separation of Concerns**
- **UI Layer:** Chỉ hiển thị và xử lý user interaction
- **State Layer:** Quản lý business logic và state
- **Service Layer:** Xử lý API calls và data persistence

## 🔧 Cách sử dụng trong thực tế

### **Để lấy state:**
```dart
// Cách 1: Consumer (tự động rebuild khi state thay đổi)
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    return Text('User: ${authProvider.user?.name ?? "Chưa đăng nhập"}');
  },
)

// Cách 2: Provider.of (không tự động rebuild)
final authProvider = Provider.of<AuthProvider>(context, listen: false);
print(authProvider.user?.name);
```

### **Để cập nhật state:**
```dart
// Trong AuthProvider
void updateUser(User newUser) {
  _user = newUser;
  notifyListeners(); // Quan trọng: phải gọi để UI cập nhật
}
```

## 🚀 Lợi ích của cách quản lý này

1. **Tách biệt rõ ràng:** UI và business logic tách biệt
2. **Reactive:** UI tự động cập nhật khi state thay đổi
3. **Scalable:** Dễ mở rộng khi ứng dụng phát triển
4. **Testable:** Dễ test từng layer riêng biệt
5. **Maintainable:** Code dễ bảo trì và debug

## 📝 Best Practices

1. **Luôn gọi notifyListeners()** sau khi thay đổi state
2. **Sử dụng listen: false** khi chỉ cần đọc state
3. **Tách biệt local state và global state** rõ ràng
4. **Xử lý error properly** trong state management
5. **Clean up resources** trong dispose()

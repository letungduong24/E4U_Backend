# Sơ đồ Luồng State Management trong Login

## 🔄 Luồng xử lý khi người dùng nhấn "Đăng nhập"

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
│                    (Nhấn nút "Đăng nhập")                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN PAGE (UI Layer)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ _handleLogin() method                                   │   │
│  │ 1. Form validation (Local State)                        │   │
│  │ 2. Gọi AuthProvider.login()                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AUTH PROVIDER (State Layer)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ login() method                                          │   │
│  │ 1. _isLoading = true                                    │   │
│  │ 2. _errorMessage = null                                 │   │
│  │ 3. notifyListeners() → UI rebuild                       │   │
│  │ 4. Gọi AuthService.login()                              │   │
│  │ 5. Xử lý response                                       │   │
│  │ 6. Cập nhật state                                       │   │
│  │ 7. notifyListeners() → UI rebuild                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AUTH SERVICE (Service Layer)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ login() method                                          │   │
│  │ 1. Tạo LoginRequest                                     │   │
│  │ 2. Gọi API Service                                      │   │
│  │ 3. Trả về AuthResponse                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API SERVICE (Network Layer)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HTTP POST request                                       │   │
│  │ 1. Gửi email/password                                   │   │
│  │ 2. Nhận response từ server                              │   │
│  │ 3. Parse JSON response                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER RESPONSE                          │
│              (Success/Failure với user data/error)              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI AUTOMATIC UPDATE                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Consumer<AuthProvider> widgets rebuild:                 │   │
│  │ • Button: Loading spinner → Normal button               │   │
│  │ • Error: Show/hide error message                        │   │
│  │ • Navigation: Redirect to home page                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 State Changes Timeline

```
Time: 0ms    User nhấn "Đăng nhập"
             ↓
Time: 1ms    Form validation (Local State)
             ↓
Time: 2ms    AuthProvider.login() được gọi
             ↓
Time: 3ms    _isLoading = true
             notifyListeners() → UI rebuild
             ↓
Time: 4ms    Button hiển thị loading spinner
             ↓
Time: 5ms    AuthService.login() được gọi
             ↓
Time: 6ms    API request được gửi
             ↓
Time: 1000ms Server response (giả sử 1 giây)
             ↓
Time: 1001ms AuthProvider xử lý response
             ↓
Time: 1002ms _isLoading = false
             _user = response.user (nếu thành công)
             _errorMessage = response.message (nếu thất bại)
             notifyListeners() → UI rebuild
             ↓
Time: 1003ms UI cập nhật:
             • Button trở về bình thường
             • Hiển thị error (nếu có)
             • Navigate to home (nếu thành công)
```

## 🎯 Các loại State và khi nào sử dụng

### **Local State (setState)**
```
Khi nào sử dụng:
✅ Form validation
✅ UI interactions (ẩn/hiện password)
✅ Local animations
✅ Temporary UI state

Ví dụ:
bool _obscurePassword = true;
bool _isFormValid = false;
String _selectedTab = 'login';
```

### **Global State (Provider)**
```
Khi nào sử dụng:
✅ User authentication
✅ App-wide settings
✅ Shared data between screens
✅ API responses

Ví dụ:
User? _user;
bool _isAuthenticated = false;
List<Notification> _notifications;
```

## 🔧 Cách debug State Management

### **1. Thêm debug prints**
```dart
Future<bool> login(String email, String password) async {
  print('🔄 AuthProvider: Starting login...');
  _isLoading = true;
  notifyListeners();
  print('📱 AuthProvider: UI should show loading now');
  
  // ... rest of code
}
```

### **2. Sử dụng Flutter Inspector**
- Mở Flutter Inspector trong VS Code
- Xem widget tree và state changes
- Debug Consumer rebuilds

### **3. Provider Debug Mode**
```dart
// Trong main.dart
ChangeNotifierProvider(
  create: (_) => AuthProvider(),
  child: MaterialApp(...),
)
// Thêm debugPrintRebuildDirtyWidgets: true trong debug mode
```

## 🚀 Best Practices

### **1. Tách biệt State rõ ràng**
```dart
// ❌ Không nên: Trộn local và global state
class _LoginPageState extends State<LoginPage> {
  bool _isLoading = true; // Nên để trong AuthProvider
  String? _errorMessage;  // Nên để trong AuthProvider
}

// ✅ Nên: Tách biệt rõ ràng
class _LoginPageState extends State<LoginPage> {
  bool _obscurePassword = true; // Local state - chỉ UI
  // Global state được quản lý bởi AuthProvider
}
```

### **2. Sử dụng Consumer đúng cách**
```dart
// ❌ Không nên: Consumer quá rộng
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    return Scaffold(
      body: Column(
        children: [
          // Toàn bộ UI rebuild khi AuthProvider thay đổi
        ],
      ),
    );
  },
)

// ✅ Nên: Consumer cụ thể
Scaffold(
  body: Column(
    children: [
      // UI không cần rebuild
      Text('Static content'),
      
      // Chỉ phần cần thiết rebuild
      Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return authProvider.isLoading 
            ? CircularProgressIndicator()
            : LoginButton();
        },
      ),
    ],
  ),
)
```

### **3. Xử lý Error properly**
```dart
// ✅ Nên: Xử lý error trong Provider
Future<bool> login(String email, String password) async {
  try {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    final response = await AuthService.login(loginRequest);
    
    if (response.success) {
      _user = response.user;
      _isAuthenticated = true;
      return true;
    } else {
      _errorMessage = response.message;
      return false;
    }
  } catch (e) {
    _errorMessage = 'Lỗi kết nối: ${e.toString()}';
    return false;
  } finally {
    _isLoading = false;
    notifyListeners();
  }
}
```


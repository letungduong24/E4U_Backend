# Mintonn Backend API

Backend API cho ứng dụng Mintonn được xây dựng với ExpressJS, MongoDB và JWT authentication.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT với cookie, role-based access control
- **User Management**: Đăng ký, đăng nhập, quản lý profile, đổi mật khẩu
- **Security**: Rate limiting, helmet, CORS, input validation
- **Modular Architecture**: Kiến trúc modular monolith dễ mở rộng
- **Error Handling**: Xử lý lỗi toàn cục với logging

## 🛠️ Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors
- **Development**: nodemon

## 📁 Cấu trúc dự án

```
Backend/
├── config/
│   └── database.js          # Cấu hình MongoDB
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── validate.js          # Input validation
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js   # Auth controller
│   │   ├── auth.service.js      # Auth business logic
│   │   └── auth.routes.js       # Auth routes
│   └── user/
│       └── user.model.js        # User model
├── server.js                # Entry point
├── package.json
└── env.example
```

## 🚀 Cài đặt và chạy

### Phương pháp 1: Chạy trực tiếp (Development)

#### Yêu cầu hệ thống
- Node.js (v16+)
- MongoDB (v4.4+)
- npm hoặc yarn

#### Bước 1: Clone và cài đặt dependencies
```bash
cd Backend
npm install
```

#### Bước 2: Cấu hình môi trường
```bash
# Copy file env.example thành .env
cp env.example .env

# Chỉnh sửa các biến môi trường trong .env
```

#### Bước 3: Khởi động MongoDB
```bash
# Khởi động MongoDB service
mongod
```

#### Bước 4: Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### Bước 5: Tạo dữ liệu mẫu (Optional)
```bash
# Tạo users mẫu cho development
npm run seed
```

### Phương pháp 2: Sử dụng Docker (Khuyến nghị)

#### Yêu cầu hệ thống
- Docker
- Docker Compose

#### Bước 1: Chạy với Docker Compose
```bash
cd Backend
docker-compose up -d
```

#### Bước 2: Truy cập ứng dụng
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017
- Mongo Express (Admin UI): http://localhost:8081 (admin/admin123)

#### Bước 3: Dừng services
```bash
docker-compose down
```

#### Bước 4: Xem logs
```bash
# Xem logs của tất cả services
docker-compose logs

# Xem logs của service cụ thể
docker-compose logs backend
docker-compose logs mongodb
```

## 🔧 Cấu hình môi trường

Tạo file `.env` với các biến sau:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mintonn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Security
BCRYPT_ROUNDS=12
```

## 📚 API Endpoints

### Authentication

#### Public Routes
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgotpassword` - Quên mật khẩu
- `PUT /api/auth/resetpassword/:resettoken` - Đặt lại mật khẩu
- `GET /api/auth/verify-email/:token` - Xác thực email

#### Protected Routes (Yêu cầu JWT token)
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `PUT /api/auth/updateprofile` - Cập nhật profile
- `PUT /api/auth/changepassword` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/verify-email/generate` - Tạo token xác thực email

### Health Check
- `GET /health` - Kiểm tra trạng thái server

## 🔐 Authentication

### JWT Token
- Token được lưu trong HTTP-only cookie
- Hỗ trợ cả cookie và Authorization header
- Token có thời hạn 7 ngày (có thể cấu hình)

### Role-based Access Control
- **user**: Người dùng thông thường
- **moderator**: Người kiểm duyệt
- **admin**: Quản trị viên

## 📝 Validation

### User Registration
- First name, last name: 2-50 ký tự
- Email: Định dạng email hợp lệ
- Password: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt

### Profile Update
- Phone: Định dạng số điện thoại hợp lệ
- Gender: Chọn từ danh sách có sẵn

## 🚨 Security Features

- **Rate Limiting**: Giới hạn 100 requests/15 phút cho mỗi IP
- **Helmet**: Bảo mật HTTP headers
- **CORS**: Cross-origin resource sharing với credentials
- **Input Validation**: Sanitize và validate tất cả input
- **Password Hashing**: Bcrypt với 12 rounds
- **Account Locking**: Khóa tài khoản sau 5 lần đăng nhập thất bại

## 🧪 Testing

```bash
# Chạy tests
npm test

# Chạy tests với coverage
npm run test:coverage
```

## 📊 Database Schema

### User Model
- Thông tin cơ bản: firstName, lastName, email, password
- Role và trạng thái: role, isActive, isEmailVerified
- Profile: avatar, phone, dateOfBirth, gender, address
- Preferences: notifications, language, timezone
- Security: loginAttempts, lockUntil, passwordResetToken

## 🔄 Error Handling

- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure MongoDB connection
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up logging và monitoring
- [ ] Configure backup strategy

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository hoặc liên hệ team development.

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token xác thực bị thiếu hoặc định dạng không hợp lệ',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Không tìm thấy người dùng',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({
      status: 'error',
      message: 'Không có quyền truy cập route này',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Không có quyền truy cập route này',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Vai trò ${req.user.role} không có quyền truy cập route này`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };

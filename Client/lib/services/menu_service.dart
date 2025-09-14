import 'package:flutter/material.dart';
import '../config/menu_config.dart';

/// Service to handle role-based navigation and menu actions
class MenuService {
  /// Handle menu action based on user role and action type
  static void handleMenuAction(
    BuildContext context,
    String action,
    String userRole,
  ) {
    switch (action) {
      case 'home':
        _navigateToHome(context);
        break;
      case 'users':
        _navigateToUserManagement(context, userRole);
        break;
      case 'classes':
        _navigateToClassManagement(context, userRole);
        break;
      case 'teachers':
        _navigateToTeacherManagement(context, userRole);
        break;
      case 'schedule':
        _navigateToSchedule(context, userRole);
        break;
      case 'assignments':
        _navigateToAssignments(context, userRole);
        break;
      case 'grades':
        _navigateToGrades(context, userRole);
        break;
      case 'students':
        _navigateToStudents(context, userRole);
        break;
      case 'documents':
        _navigateToDocuments(context, userRole);
        break;
      case 'reports':
        _navigateToReports(context, userRole);
        break;
      case 'system':
        _navigateToSystemSettings(context, userRole);
        break;
      case 'profile':
        _navigateToProfile(context);
        break;
      case 'settings':
        _navigateToSettings(context);
        break;
      case 'logout':
        _showLogoutDialog(context);
        break;
      default:
        print('Unknown menu action: $action');
    }
  }

  /// Navigate to home page
  static void _navigateToHome(BuildContext context) {
    Navigator.of(context).pushReplacementNamed('/home');
  }

  /// Navigate to user management (admin only)
  static void _navigateToUserManagement(BuildContext context, String userRole) {
    if (userRole == MenuConfig.admin) {
      // TODO: Navigate to user management page
      print('Admin: Navigate to user management');
      _showComingSoonDialog(context, 'Quản lý người dùng');
    } else {
      _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to class management
  static void _navigateToClassManagement(BuildContext context, String userRole) {
    switch (userRole) {
      case MenuConfig.admin:
        // TODO: Navigate to admin class management
        print('Admin: Navigate to class management');
        _showComingSoonDialog(context, 'Quản lý lớp học');
        break;
      case MenuConfig.teacher:
        // TODO: Navigate to teacher's classes
        print('Teacher: Navigate to my classes');
        _showComingSoonDialog(context, 'Lớp học của tôi');
        break;
      default:
        _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to teacher management (admin only)
  static void _navigateToTeacherManagement(BuildContext context, String userRole) {
    if (userRole == MenuConfig.admin) {
      // TODO: Navigate to teacher management
      print('Admin: Navigate to teacher management');
      _showComingSoonDialog(context, 'Quản lý giáo viên');
    } else {
      _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to schedule
  static void _navigateToSchedule(BuildContext context, String userRole) {
    switch (userRole) {
      case MenuConfig.admin:
        // TODO: Navigate to admin schedule management
        print('Admin: Navigate to schedule management');
        _showComingSoonDialog(context, 'Quản lý lịch học');
        break;
      case MenuConfig.teacher:
        // TODO: Navigate to teacher's schedule
        print('Teacher: Navigate to teaching schedule');
        _showComingSoonDialog(context, 'Lịch dạy');
        break;
      case MenuConfig.student:
        // TODO: Navigate to student's schedule
        print('Student: Navigate to study schedule');
        _showComingSoonDialog(context, 'Lịch học');
        break;
      default:
        _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to assignments
  static void _navigateToAssignments(BuildContext context, String userRole) {
    switch (userRole) {
      case MenuConfig.admin:
        // TODO: Navigate to admin assignment management
        print('Admin: Navigate to assignment management');
        _showComingSoonDialog(context, 'Quản lý bài tập');
        break;
      case MenuConfig.teacher:
        // TODO: Navigate to teacher's assignment management
        print('Teacher: Navigate to assignment management');
        _showComingSoonDialog(context, 'Quản lý bài tập');
        break;
      case MenuConfig.student:
        // Navigate to assignments page
        Navigator.of(context).pushNamed('/assignments');
        break;
      default:
        _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to grades
  static void _navigateToGrades(BuildContext context, String userRole) {
    switch (userRole) {
      case MenuConfig.teacher:
        // TODO: Navigate to grade management
        print('Teacher: Navigate to grade management');
        _showComingSoonDialog(context, 'Quản lý điểm');
        break;
      case MenuConfig.student:
        // TODO: Navigate to student's grades
        print('Student: Navigate to my grades');
        _showComingSoonDialog(context, 'Xem điểm');
        break;
      default:
        _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to students (teacher only)
  static void _navigateToStudents(BuildContext context, String userRole) {
    if (userRole == MenuConfig.teacher) {
      // TODO: Navigate to student list
      print('Teacher: Navigate to student list');
      _showComingSoonDialog(context, 'Danh sách học sinh');
    } else {
      _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to documents
  static void _navigateToDocuments(BuildContext context, String userRole) {
    switch (userRole) {
      case MenuConfig.student:
        // TODO: Navigate to study materials
        print('Student: Navigate to study materials');
        _showComingSoonDialog(context, 'Tài liệu học tập');
        break;
      case MenuConfig.teacher:
        // TODO: Navigate to document management
        print('Teacher: Navigate to document management');
        _showComingSoonDialog(context, 'Quản lý tài liệu');
        break;
      default:
        _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to reports (admin only)
  static void _navigateToReports(BuildContext context, String userRole) {
    if (userRole == MenuConfig.admin) {
      // TODO: Navigate to reports
      print('Admin: Navigate to reports');
      _showComingSoonDialog(context, 'Báo cáo thống kê');
    } else {
      _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to system settings (admin only)
  static void _navigateToSystemSettings(BuildContext context, String userRole) {
    if (userRole == MenuConfig.admin) {
      // TODO: Navigate to system settings
      print('Admin: Navigate to system settings');
      _showComingSoonDialog(context, 'Cài đặt hệ thống');
    } else {
      _showAccessDeniedDialog(context);
    }
  }

  /// Navigate to profile
  static void _navigateToProfile(BuildContext context) {
    // TODO: Navigate to profile page
    print('Navigate to profile page');
    _showComingSoonDialog(context, 'Trang cá nhân');
  }

  /// Navigate to settings
  static void _navigateToSettings(BuildContext context) {
    // TODO: Navigate to settings
    print('Navigate to settings');
    _showComingSoonDialog(context, 'Cài đặt');
  }

  /// Show logout confirmation dialog
  static void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Đăng xuất'),
          content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                // TODO: Call logout from AuthProvider
                Navigator.of(context).pushReplacementNamed('/login');
              },
              child: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  /// Show coming soon dialog
  static void _showComingSoonDialog(BuildContext context, String feature) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Tính năng đang phát triển'),
          content: Text('$feature sẽ sớm được cập nhật. Vui lòng quay lại sau!'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }

  /// Show access denied dialog
  static void _showAccessDeniedDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Không có quyền truy cập'),
          content: const Text('Bạn không có quyền truy cập tính năng này.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }
}

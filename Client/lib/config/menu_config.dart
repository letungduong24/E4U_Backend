import 'package:flutter/material.dart';

/// Menu item configuration for role-based navigation
class MenuItem {
  final String id;
  final String title;
  final IconData icon;
  final Color? iconColor;
  final Color? textColor;
  final bool isDivider;
  final List<String> allowedRoles;

  const MenuItem({
    required this.id,
    required this.title,
    required this.icon,
    this.iconColor,
    this.textColor,
    this.isDivider = false,
    required this.allowedRoles,
  });

  /// Create a divider menu item
  factory MenuItem.divider() {
    return MenuItem(
      id: 'divider',
      title: '',
      icon: Icons.space_bar,
      isDivider: true,
      allowedRoles: [],
    );
  }
}

/// Role-based menu configuration
class MenuConfig {
  static const String student = 'student';
  static const String teacher = 'teacher';
  static const String admin = 'admin';

  /// Get menu items based on user role
  static List<MenuItem> getMenuItems(String role) {
    switch (role) {
      case student:
        return _getStudentMenuItems();
      case teacher:
        return _getTeacherMenuItems();
      case admin:
        return _getAdminMenuItems();
      default:
        return _getDefaultMenuItems();
    }
  }

  /// Student menu items
  static List<MenuItem> _getStudentMenuItems() {
    return [
      const MenuItem(
        id: 'home',
        title: 'Trang chủ',
        icon: Icons.home,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'assignments',
        title: 'Bài tập',
        icon: Icons.assignment,
        iconColor: Colors.grey,
        allowedRoles: [student],
      ),
      const MenuItem(
        id: 'grades',
        title: 'Xem điểm',
        icon: Icons.grade,
        iconColor: Colors.grey,
        allowedRoles: [student],
      ),
      const MenuItem(
        id: 'documents',
        title: 'Tài liệu',
        icon: Icons.folder,
        iconColor: Colors.grey,
        allowedRoles: [student],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'profile',
        title: 'Trang cá nhân',
        icon: Icons.person,
        iconColor: Colors.blue,
        textColor: Colors.blue,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'settings',
        title: 'Cài đặt',
        icon: Icons.settings,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'logout',
        title: 'Đăng xuất',
        icon: Icons.logout,
        iconColor: Colors.red,
        textColor: Colors.red,
        allowedRoles: [student, teacher, admin],
      ),
    ];
  }

  /// Teacher menu items
  static List<MenuItem> _getTeacherMenuItems() {
    return [
      const MenuItem(
        id: 'home',
        title: 'Trang chủ',
        icon: Icons.home,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'assignments',
        title: 'Quản lý bài tập',
        icon: Icons.assignment,
        iconColor: Colors.grey,
        allowedRoles: [teacher],
      ),
      const MenuItem(
        id: 'grades',
        title: 'Quản lý điểm',
        icon: Icons.grade,
        iconColor: Colors.grey,
        allowedRoles: [teacher],
      ),
      const MenuItem(
        id: 'documents',
        title: 'Quản lý tài liệu',
        icon: Icons.folder,
        iconColor: Colors.grey,
        allowedRoles: [teacher],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'profile',
        title: 'Trang cá nhân',
        icon: Icons.person,
        iconColor: Colors.blue,
        textColor: Colors.blue,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'settings',
        title: 'Cài đặt',
        icon: Icons.settings,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'logout',
        title: 'Đăng xuất',
        icon: Icons.logout,
        iconColor: Colors.red,
        textColor: Colors.red,
        allowedRoles: [student, teacher, admin],
      ),
    ];
  }

  /// Admin menu items
  static List<MenuItem> _getAdminMenuItems() {
    return [
      const MenuItem(
        id: 'home',
        title: 'Trang chủ',
        icon: Icons.home,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'users',
        title: 'Quản lý người dùng',
        icon: Icons.people,
        iconColor: Colors.grey,
        allowedRoles: [admin],
      ),
      const MenuItem(
        id: 'classes',
        title: 'Quản lý lớp học',
        icon: Icons.class_,
        iconColor: Colors.grey,
        allowedRoles: [admin],
      ),
      const MenuItem(
        id: 'schedule',
        title: 'Quản lý lịch học',
        icon: Icons.schedule,
        iconColor: Colors.grey,
        allowedRoles: [admin],
      ),
      const MenuItem(
        id: 'assignments',
        title: 'Quản lý bài tập',
        icon: Icons.assignment,
        iconColor: Colors.grey,
        allowedRoles: [admin],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'profile',
        title: 'Trang cá nhân',
        icon: Icons.person,
        iconColor: Colors.blue,
        textColor: Colors.blue,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'settings',
        title: 'Cài đặt',
        icon: Icons.settings,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'logout',
        title: 'Đăng xuất',
        icon: Icons.logout,
        iconColor: Colors.red,
        textColor: Colors.red,
        allowedRoles: [student, teacher, admin],
      ),
    ];
  }

  /// Default menu items (fallback)
  static List<MenuItem> _getDefaultMenuItems() {
    return [
      const MenuItem(
        id: 'home',
        title: 'Trang chủ',
        icon: Icons.home,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'profile',
        title: 'Trang cá nhân',
        icon: Icons.person,
        iconColor: Colors.blue,
        textColor: Colors.blue,
        allowedRoles: [student, teacher, admin],
      ),
      const MenuItem(
        id: 'settings',
        title: 'Cài đặt',
        icon: Icons.settings,
        iconColor: Colors.grey,
        allowedRoles: [student, teacher, admin],
      ),
      MenuItem.divider(),
      const MenuItem(
        id: 'logout',
        title: 'Đăng xuất',
        icon: Icons.logout,
        iconColor: Colors.red,
        textColor: Colors.red,
        allowedRoles: [student, teacher, admin],
      ),
    ];
  }
}

/// Quick access button configuration for role-based home page
class QuickAccessConfig {
  /// Get quick access buttons based on user role
  static List<QuickAccessButton> getQuickAccessButtons(String role) {
    switch (role) {
      case MenuConfig.student:
        return _getStudentQuickAccess();
      case MenuConfig.teacher:
        return _getTeacherQuickAccess();
      case MenuConfig.admin:
        return _getAdminQuickAccess();
      default:
        return _getDefaultQuickAccess();
    }
  }

  /// Student quick access buttons
  static List<QuickAccessButton> _getStudentQuickAccess() {
    return [
      QuickAccessButton(
        title: 'Xem bài tập',
        icon: Icons.assignment,
        onTap: () => print('Student: View assignments'),
      ),
      QuickAccessButton(
        title: 'Xem lịch học',
        icon: Icons.schedule,
        onTap: () => print('Student: View schedule'),
      ),
      QuickAccessButton(
        title: 'Xem điểm',
        icon: Icons.grade,
        onTap: () => print('Student: View grades'),
      ),
    ];
  }

  /// Teacher quick access buttons
  static List<QuickAccessButton> _getTeacherQuickAccess() {
    return [
      QuickAccessButton(
        title: 'Quản lý bài tập',
        icon: Icons.assignment,
        onTap: () => print('Teacher: Assignment management'),
      ),
      QuickAccessButton(
        title: 'Quản lý tài liệu',
        icon: Icons.folder,
        onTap: () => print('Teacher: Document management'),
      ),
      QuickAccessButton(
        title: 'Quản lý điểm',
        icon: Icons.grade,
        onTap: () => print('Teacher: Grade management'),
      ),
    ];
  }

  /// Admin quick access buttons
  static List<QuickAccessButton> _getAdminQuickAccess() {
    return [
      QuickAccessButton(
        title: 'Quản lý người dùng',
        icon: Icons.people,
        onTap: () => print('Admin: User management'),
      ),
      QuickAccessButton(
        title: 'Quản lý lớp',
        icon: Icons.class_,
        onTap: () => print('Admin: Class management'),
      ),
      QuickAccessButton(
        title: 'Quản lý lịch',
        icon: Icons.schedule,
        onTap: () => print('Admin: Schedule management'),
      ),
    ];
  }

  /// Default quick access buttons
  static List<QuickAccessButton> _getDefaultQuickAccess() {
    return [
      QuickAccessButton(
        title: 'Trang chủ',
        icon: Icons.home,
        onTap: () => print('Default: Home'),
      ),
      QuickAccessButton(
        title: 'Cài đặt',
        icon: Icons.settings,
        onTap: () => print('Default: Settings'),
      ),
    ];
  }
}

/// Quick access button model
class QuickAccessButton {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const QuickAccessButton({
    required this.title,
    required this.icon,
    required this.onTap,
  });
}

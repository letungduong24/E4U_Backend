import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/profile_card.dart';
import '../widgets/quick_access_buttons.dart';
import '../widgets/admin_home_content.dart';
import '../widgets/teacher_home_content.dart';
import '../widgets/student_home_content.dart';
import '../config/menu_config.dart';
import '../services/menu_service.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  void _handleMenuAction(BuildContext context, String action, AuthProvider authProvider) {
    // Use MenuService to handle role-based navigation
    MenuService.handleMenuAction(context, action, authProvider.user?.role ?? '');
  }

  void _showLogoutDialog(BuildContext context, AuthProvider authProvider) {
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
                authProvider.logout();
                Navigator.of(context).pushReplacementNamed('/login');
              },
              child: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // User Profile Section
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    if (authProvider.user == null) {
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    }
                    
                    return ProfileCard(
                      user: authProvider.user!,
                      onNotificationTap: () {
                        // TODO: Handle notification tap
                        print('Notification tapped');
                      },
                      onMenuTap: () {
                        // TODO: Handle menu tap
                        print('Menu tapped');
                      },
                      onProfileTap: () {
                        // TODO: Navigate to profile page
                        print('Profile tapped');
                      },
                      onMenuAction: (String action) {
                        _handleMenuAction(context, action, authProvider);
                      },
                    );
                  },
                ),
                const SizedBox(height: 20),
                
                // Role-based Action Buttons
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    if (authProvider.user == null) {
                      return const SizedBox.shrink();
                    }
                    
                    final quickAccessButtons = QuickAccessConfig.getQuickAccessButtons(
                      authProvider.user!.role
                    );
                    
                    return QuickAccessButtons(buttons: quickAccessButtons);
                  },
                ),
                const SizedBox(height: 30),
                
                // Role-based Content
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    if (authProvider.user == null) {
                      return const SizedBox.shrink();
                    }
                    
                    final userRole = authProvider.user!.role;
                    
                    switch (userRole) {
                      case 'admin':
                        return const AdminHomeContent();
                      case 'teacher':
                        return const TeacherHomeContent();
                      case 'student':
                        return const StudentHomeContent();
                      default:
                        return const SizedBox.shrink();
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}
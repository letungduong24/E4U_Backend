import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/simple_header_card.dart';
import '../services/menu_service.dart';

class AssignmentsPage extends StatelessWidget {
  const AssignmentsPage({super.key});

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
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                return SimpleHeaderCard(
                  title: 'Bài tập',
                  userRole: authProvider.user?.role ?? '',
                  onNotificationTap: () {
                    print('Notification tapped');
                  },
                  onMenuAction: (String action) {
                    _handleMenuAction(context, action, authProvider);
                  },
                );
              },
            ),
            
            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListView(
                  children: [
                    // Assignment Card 1
                    _buildAssignmentCard(
                      title: 'Bài tập TEST1',
                      description: 'Kiểm tra thì hiện tại đơn',
                      dueDate: '18/04/2025',
                      status: 'Chưa nộp',
                      statusColor: Colors.orange,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Assignment Card 2
                    _buildAssignmentCard(
                      title: 'Bài tập TEST1',
                      description: 'Kiểm tra thì hiện tại đơn',
                      dueDate: '18/04/2025',
                      status: 'Chưa nộp',
                      statusColor: Colors.orange,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Assignment Card 3
                    _buildAssignmentCard(
                      title: 'Bài tập Grammar',
                      description: 'Ôn tập cấu trúc câu',
                      dueDate: '20/04/2025',
                      status: 'Đã nộp',
                      statusColor: Colors.green,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Assignment Card 4
                    _buildAssignmentCard(
                      title: 'Bài tập Vocabulary',
                      description: 'Học từ vựng chủ đề gia đình',
                      dueDate: '22/04/2025',
                      status: 'Chưa nộp',
                      statusColor: Colors.orange,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssignmentCard({
    required String title,
    required String description,
    required String dueDate,
    required String status,
    required Color statusColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Description
          Text(
            description,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Due date and status row
          Row(
            children: [
              // Due date
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.blue[600],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  'Hạn: $dueDate',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              
              const Spacer(),
              
              // Status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  status,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../models/user.dart';
import 'menu_popup_widget.dart';

class ProfileCard extends StatelessWidget {
  final User user;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onMenuTap;
  final VoidCallback? onProfileTap;
  final Function(String)? onMenuAction;

  const ProfileCard({
    super.key,
    required this.user,
    this.onNotificationTap,
    this.onMenuTap,
    this.onProfileTap,
    this.onMenuAction,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              // Profile Avatar
              GestureDetector(
                onTap: onProfileTap,
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: _getRoleColor(user.role),
                    shape: BoxShape.circle,
                  ),
                  child: user.profile.avatar != null
                      ? ClipOval(
                          child: Image.network(
                            user.profile.avatar!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildDefaultAvatar();
                            },
                          ),
                        )
                      : _buildDefaultAvatar(),
                ),
              ),
              const SizedBox(width: 16),
              
              // User Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.fullName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.roleDisplayName,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Action Icons
              Row(
                children: [
                  // Notification button for all roles
                  GestureDetector(
                    onTap: onNotificationTap,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.notifications, size: 20, color: Colors.grey),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Menu button
                  MenuPopupWidget(
                    onMenuAction: onMenuAction,
                    userRole: user.role,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.more_horiz, size: 20, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        
        // Additional info for different roles
        if (user.role == 'student' && user.currentClass != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.class_, size: 16, color: Colors.blue[600]),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lớp hiện tại: ${user.currentClass!.name}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (user.currentClass!.homeroomTeacher != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          'GVCN: ${user.currentClass!.homeroomTeacher!.fullName}',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.blue[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        
        if (user.role == 'teacher' && user.teachingClass != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.school, size: 16, color: Colors.green[600]),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lớp đang dạy: ${user.teachingClass!.name}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.green[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (user.teachingClass!.code.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Mã lớp: ${user.teachingClass!.code}',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.green[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        
        if (user.role == 'admin') ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.orange[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.orange[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.admin_panel_settings, size: 16, color: Colors.orange[600]),
                const SizedBox(width: 8),
                Text(
                  'Quản trị hệ thống',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.orange[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDefaultAvatar() {
    IconData iconData;
    switch (user.role) {
      case 'admin':
        iconData = Icons.admin_panel_settings;
        break;
      case 'teacher':
        iconData = Icons.person;
        break;
      case 'student':
        iconData = Icons.school;
        break;
      default:
        iconData = Icons.person;
    }
    
    return Icon(
      iconData,
      size: 30,
      color: Colors.white,
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin':
        return Colors.orange;
      case 'teacher':
        return Colors.blue;
      case 'student':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}

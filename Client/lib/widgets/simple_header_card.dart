import 'package:flutter/material.dart';
import 'menu_popup_widget.dart';

class SimpleHeaderCard extends StatelessWidget {
  final String title;
  final String userRole;
  final VoidCallback? onNotificationTap;
  final Function(String)? onMenuAction;

  const SimpleHeaderCard({
    super.key,
    required this.title,
    required this.userRole,
    this.onNotificationTap,
    this.onMenuAction,
  });

  @override
  Widget build(BuildContext context) {
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
      child: Row(
        children: [
          // Title
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ),
          
          // Notification and Menu buttons
          Row(
            children: [
              if (onNotificationTap != null) ...[
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
              ],
              
              // Menu button with popup
              MenuPopupWidget(
                userRole: userRole,
                onMenuAction: onMenuAction,
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
    );
  }
}

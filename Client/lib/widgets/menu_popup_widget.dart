import 'package:flutter/material.dart';
import '../config/menu_config.dart';

class MenuPopupWidget extends StatelessWidget {
  final Function(String)? onMenuAction;
  final Widget child;
  final String userRole;

  const MenuPopupWidget({
    super.key,
    this.onMenuAction,
    required this.child,
    required this.userRole,
  });

  @override
  Widget build(BuildContext context) {
    final menuItems = MenuConfig.getMenuItems(userRole);
    
    return PopupMenuButton<String>(
      onSelected: (value) {
        if (onMenuAction != null) {
          onMenuAction!(value);
        }
      },
      offset: const Offset(0, 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      elevation: 8,
      itemBuilder: (BuildContext context) {
        return menuItems.map((item) {
          if (item.isDivider) {
            return const PopupMenuItem<String>(
              enabled: false,
              height: 8,
              child: Divider(height: 1, thickness: 0.5),
            );
          }
          
          return PopupMenuItem<String>(
            value: item.id,
            height: 48,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(
                    item.icon,
                    size: 20,
                    color: item.iconColor ?? Colors.grey,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item.title,
                      style: TextStyle(
                        color: item.textColor ?? Colors.black,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList();
      },
      child: child,
    );
  }
}

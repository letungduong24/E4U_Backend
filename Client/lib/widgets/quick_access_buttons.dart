import 'package:flutter/material.dart';
import '../config/menu_config.dart';

class QuickAccessButtons extends StatelessWidget {
  final List<QuickAccessButton> buttons;

  const QuickAccessButtons({
    super.key,
    required this.buttons,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: buttons.asMap().entries.map((entry) {
        final index = entry.key;
        final button = entry.value;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: index < buttons.length - 1 ? 12 : 0,
            ),
            child: _buildActionButton(button),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActionButton(QuickAccessButton button) {
    return GestureDetector(
      onTap: button.onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.blue,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            button.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }
}

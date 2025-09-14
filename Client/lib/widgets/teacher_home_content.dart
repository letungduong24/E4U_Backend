import 'package:flutter/material.dart';

class TeacherHomeContent extends StatelessWidget {
  const TeacherHomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Upcoming Teaching Schedule Section
        _buildUpcomingTeachingScheduleSection(),
      ],
    );
  }


  Widget _buildUpcomingTeachingScheduleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lịch dạy sắp tới',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 12),
        _buildScheduleItem(
          'Thứ 7 - Ngày 10/09/2025',
          'Lớp TA1',
          '18:30 - 20:30',
        ),
        const SizedBox(height: 8),
        _buildScheduleItem(
          'Thứ 4 - Ngày 13/09/2025',
          'Lớp TA1',
          '18:30 - 20:30',
        ),
        const SizedBox(height: 8),
        _buildScheduleItem(
          'Thứ 7 - Ngày 17/08/2025',
          'Lớp TA1',
          '18:30 - 20:30',
        ),
      ],
    );
  }

  Widget _buildScheduleItem(String date, String className, String time) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  className,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.blue[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              time,
              style: TextStyle(
                color: Colors.blue[800],
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

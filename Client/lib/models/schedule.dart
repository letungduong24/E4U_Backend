import 'user.dart';

class Schedule {
  final String id;
  final String day; // Format: "2025-09-08"
  final String period; // Format: "08:00-09:00"
  final bool isDone;
  final ClassInfo? classInfo;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Schedule({
    required this.id,
    required this.day,
    required this.period,
    this.isDone = false,
    this.classInfo,
    this.createdAt,
    this.updatedAt,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      id: json['_id'] ?? json['id'] ?? '',
      day: json['day'] ?? '',
      period: json['period'] ?? '',
      isDone: json['isDone'] ?? false,
      classInfo: json['class'] != null ? ClassInfo.fromJson(json['class']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'day': day,
      'period': period,
      'isDone': isDone,
      'class': classInfo?.toJson(),
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  // Getter for period display
  String get periodDisplay => period;

  // Getter for day display in Vietnamese
  String get dayDisplay {
    try {
      final date = DateTime.parse(day);
      final weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      final weekday = weekdays[date.weekday % 7];
      final dayMonth = '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}';
      return '$weekday - $dayMonth';
    } catch (e) {
      return day;
    }
  }
}

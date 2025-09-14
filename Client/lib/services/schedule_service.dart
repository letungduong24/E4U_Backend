import 'api_service.dart';

class ScheduleService {
  // Lấy lịch học/dạy sắp tới
  static Future<Map<String, dynamic>> getUpcomingSchedules() async {
    try {
      final response = await ApiService.get('/schedules/upcoming');
      return response;
    } catch (e) {
      print('❌ Error getting upcoming schedules: $e');
      return {
        'status': 'fail',
        'message': 'Không thể lấy lịch học',
        'data': null,
      };
    }
  }
}

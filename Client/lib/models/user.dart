class UserProfile {
  final String? avatar;
  final String? phone;
  final DateTime? dateOfBirth;
  final String gender;
  final String? address;
  final NotificationPreferences preferences;

  UserProfile({
    this.avatar,
    this.phone,
    this.dateOfBirth,
    this.gender = 'Nam',
    this.address,
    required this.preferences,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    print('🔍 UserProfile.fromJson called with: $json');
    print('🔍 preferences type: ${json['preferences'].runtimeType}');
    print('🔍 preferences value: ${json['preferences']}');
    
    return UserProfile(
      avatar: json['avatar'],
      phone: json['phone'],
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.parse(json['dateOfBirth']) 
          : null,
      gender: json['gender'] ?? 'Nam',
      address: json['address'],
      preferences: json['preferences'] != null
          ? NotificationPreferences.fromJson(json['preferences'])
          : NotificationPreferences(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'avatar': avatar,
      'phone': phone,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'preferences': preferences.toJson(),
    };
  }
}

class NotificationPreferences {
  final bool email;
  final bool push;
  final bool sms;

  NotificationPreferences({
    this.email = true,
    this.push = true,
    this.sms = false,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    final notifications = json['notifications'] ?? {};
    return NotificationPreferences(
      email: notifications['email'] ?? true,
      push: notifications['push'] ?? true,
      sms: notifications['sms'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifications': {
        'email': email,
        'push': push,
        'sms': sms,
      }
    };
  }
}

class ClassInfo {
  final String id;
  final String name;
  final String code;
  final String? description;
  final bool isActive;
  final TeacherInfo? homeroomTeacher;

  ClassInfo({
    required this.id,
    required this.name,
    required this.code,
    this.description,
    this.isActive = true,
    this.homeroomTeacher,
  });

  factory ClassInfo.fromJson(Map<String, dynamic> json) {
    return ClassInfo(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      description: json['description'],
      isActive: json['isActive'] ?? true,
      homeroomTeacher: json['homeroomTeacher'] != null && json['homeroomTeacher'] is Map
          ? TeacherInfo.fromJson(json['homeroomTeacher'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'description': description,
      'isActive': isActive,
      'homeroomTeacher': homeroomTeacher?.toJson(),
    };
  }
}

class TeacherInfo {
  final String id;
  final String firstName;
  final String lastName;

  TeacherInfo({
    required this.id,
    required this.firstName,
    required this.lastName,
  });

  String get fullName => '$firstName $lastName';

  factory TeacherInfo.fromJson(Map<String, dynamic> json) {
    return TeacherInfo(
      id: json['id'] ?? json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
    };
  }
}

class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final bool isActive;
  final DateTime? lastLogin;
  final UserProfile profile;
  final ClassInfo? currentClass;
  final ClassInfo? teachingClass;
  final List<String> enrollmentHistory;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    this.isActive = true,
    this.lastLogin,
    required this.profile,
    this.currentClass,
    this.teachingClass,
    this.enrollmentHistory = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  // Getter for full name
  String get fullName {
    final name = '$firstName $lastName'.trim();
    print('🔍 fullName getter: firstName="$firstName", lastName="$lastName", result="$name"');
    return name;
  }

  // Getter for display name (first name only)
  String get displayName => firstName;

  // Getter for role display name
  String get roleDisplayName {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return role;
    }
  }

  factory User.fromJson(Map<String, dynamic> json) {
    try {
      print('🔍 User.fromJson called with: $json');
      print('🔍 firstName: ${json['firstName']}, lastName: ${json['lastName']}');
      
      // Debug each field individually
      print('🔍 Parsing id...');
      final id = json['id'] ?? json['_id'] ?? '';
      
      print('🔍 Parsing firstName...');
      final firstName = json['firstName'] ?? '';
      
      print('🔍 Parsing lastName...');
      final lastName = json['lastName'] ?? '';
      
      print('🔍 Parsing email...');
      final email = json['email'] ?? '';
      
      print('🔍 Parsing role...');
      final role = json['role'] ?? 'student';
      
      print('🔍 Parsing isActive...');
      final isActive = json['isActive'] ?? true;
      
      print('🔍 Parsing lastLogin...');
      final lastLogin = json['lastLogin'] != null 
          ? DateTime.parse(json['lastLogin']) 
          : null;
      
      print('🔍 Parsing profile...');
      print('🔍 profile type: ${json['profile'].runtimeType}');
      print('🔍 profile value: ${json['profile']}');
      final profile = json['profile'] != null 
          ? UserProfile.fromJson(json['profile'])
          : UserProfile(preferences: NotificationPreferences());
      
      print('🔍 Parsing currentClass...');
      final currentClass = json['currentClass'] != null 
          ? ClassInfo.fromJson(json['currentClass'])
          : null;
      
      print('🔍 Parsing teachingClass...');
      print('🔍 teachingClass type: ${json['teachingClass'].runtimeType}');
      print('🔍 teachingClass value: ${json['teachingClass']}');
      final teachingClass = json['teachingClass'] != null 
          ? ClassInfo.fromJson(json['teachingClass'])
          : null;
      
      print('🔍 Parsing enrollmentHistory...');
      final enrollmentHistory = json['enrollmentHistory'] != null 
          ? (json['enrollmentHistory'] as List).map((e) => e.toString()).toList()
          : <String>[];
      
      print('🔍 Parsing createdAt...');
      final createdAt = json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'])
          : DateTime.now();
      
      print('🔍 Parsing updatedAt...');
      final updatedAt = json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now();
      
      print('🔍 Creating User object...');
      return User(
        id: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role,
        isActive: isActive,
        lastLogin: lastLogin,
        profile: profile,
        currentClass: currentClass,
        teachingClass: teachingClass,
        enrollmentHistory: enrollmentHistory,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
    } catch (e) {
      print('🔍 Error in User.fromJson: $e');
      print('🔍 JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'role': role,
      'isActive': isActive,
      'lastLogin': lastLogin?.toIso8601String(),
      'profile': profile.toJson(),
      'currentClass': currentClass?.toJson(),
      'teachingClass': teachingClass?.toJson(),
      'enrollmentHistory': enrollmentHistory,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? role,
    bool? isActive,
    DateTime? lastLogin,
    UserProfile? profile,
    ClassInfo? currentClass,
    ClassInfo? teachingClass,
    List<String>? enrollmentHistory,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      lastLogin: lastLogin ?? this.lastLogin,
      profile: profile ?? this.profile,
      currentClass: currentClass ?? this.currentClass,
      teachingClass: teachingClass ?? this.teachingClass,
      enrollmentHistory: enrollmentHistory ?? this.enrollmentHistory,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class Car {
  final int id;
  final int userId;
  final String brand;
  final String model;
  final int year;
  final double price;
  final String transactionType;
  final String? description;
  final String city;
  final String condition;
  final String? imageUrl;
  final String? ownerName;

  Car({
    required this.id,
    required this.userId,
    required this.brand,
    required this.model,
    required this.year,
    required this.price,
    required this.transactionType,
    this.description,
    required this.city,
    required this.condition,
    this.imageUrl,
    this.ownerName,
  });

  // دالة تحويل الـ JSON القادم من Laravel API إلى كائن Car
  factory Car.fromJson(Map<String, dynamic> json) {
    return Car(
      id: json['id'],
      userId: json['user_id'] ?? 0,
      brand: json['brand'] ?? '',
      model: json['model'] ?? '',
      year: json['year'] ?? 0,
      price: double.tryParse(json['price'].toString()) ?? 0.0,
      transactionType: json['transaction_type'] ?? 'sale',
      description: json['description'],
      city: json['city'] ?? '',
      condition: json['condition'] ?? 'used',
      imageUrl: json['image_url'],
      ownerName: json['user'] != null ? json['user']['name'] : null,
    );
  }
}

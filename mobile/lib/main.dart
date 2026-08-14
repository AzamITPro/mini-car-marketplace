import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'models/car.dart';

void main() {
  runApp(const MiniCarMarketplaceApp());
}

class MiniCarMarketplaceApp extends StatelessWidget {
  const MiniCarMarketplaceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mini Car Marketplace',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamilyFallback: const ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        useMaterial3: true,
      ),
      home: const CarListScreen(),
    );
  }
}

class CarListScreen extends StatefulWidget {
  const CarListScreen({super.key});

  @override
  State<CarListScreen> createState() => _CarListScreenState();
}

class _CarListScreenState extends State<CarListScreen> {
  List<Car> _cars = [];
  bool _isLoading = true;
  String? _errorMessage;

  String _searchQuery = '';
  String _selectedType = 'all';

  final String _baseUrl = 'http://127.0.0.1:8000/api';

  @override
  void initState() {
    super.initState();
    _fetchCars();
  }

  Future<void> _fetchCars() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      String url = '$_baseUrl/cars?';
      if (_searchQuery.isNotEmpty) {
        url += 'search=$_searchQuery&';
      }
      if (_selectedType != 'all') {
        url += 'transaction_type=$_selectedType&';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {'Accept': 'application/json'},
      );

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List data = decoded['data'];
        setState(() {
          _cars = data.map((json) => Car.fromJson(json)).toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'فشل جلب البيانات من الخادم';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'تعذر الاتصال بالخادم. تأكد من تشغيل Laravel!';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF4F6F9),
        appBar: AppBar(
          title: const Text(
            '🚗 سوق السيارات المصغر (Flutter)',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
              fontSize: 18,
            ),
          ),
          centerTitle: true,
          backgroundColor: Colors.blueAccent,
          elevation: 2,
        ),
        body: Column(
          children: [
            // شريط البحث والفلاتر
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              color: Colors.white,
              child: Column(
                children: [
                  TextField(
                    onChanged: (value) {
                      _searchQuery = value;
                      _fetchCars();
                    },
                    decoration: InputDecoration(
                      hintText: 'ابحث عن شركة، موديل، مدينة...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 8,
                        horizontal: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildFilterChip('الكل', 'all'),
                      const SizedBox(width: 8),
                      _buildFilterChip('بيع 🏷️', 'sale'),
                      const SizedBox(width: 8),
                      _buildFilterChip('تأجير 🔑', 'rent'),
                    ],
                  ),
                ],
              ),
            ),

            // قائمة السيارات
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _errorMessage != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline,
                            size: 45,
                            color: Colors.red,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage!,
                            style: const TextStyle(color: Colors.red),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _fetchCars,
                            child: const Text('إعادة المحاولة 🔄'),
                          ),
                        ],
                      ),
                    )
                  : _cars.isEmpty
                  ? const Center(
                      child: Text(
                        'لا توجد سيارات مطابقة 🔍',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchCars,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _cars.length,
                        itemBuilder: (context, index) {
                          final car = _cars[index];
                          return _buildCarCard(car);
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedType == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedType = value;
          });
          _fetchCars();
        }
      },
    );
  }

  Widget _buildCarCard(Car car) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 3,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // عرض الصورة المرفوعة حياً
          car.imageUrl != null
              ? Image.network(
                  'http://127.0.0.1:8000${car.imageUrl}',
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 130,
                    color: Colors.grey[200],
                    child: const Center(
                      child: Icon(
                        Icons.directions_car,
                        size: 50,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                )
              : Container(
                  height: 130,
                  color: Colors.grey[200],
                  child: const Center(
                    child: Icon(
                      Icons.directions_car,
                      size: 50,
                      color: Colors.grey,
                    ),
                  ),
                ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${car.brand} - ${car.model}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blueAccent,
                      ),
                    ),
                    Text(
                      '\$${car.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Chip(
                      label: Text(
                        car.transactionType == 'sale' ? 'بيع 🏷️' : 'تأجير 🔑',
                      ),
                      backgroundColor: car.transactionType == 'sale'
                          ? Colors.orange[50]
                          : Colors.purple[50],
                    ),
                    const SizedBox(width: 8),
                    Chip(
                      label: Text(
                        car.condition == 'new' ? 'جديدة ✨' : 'مستعملة 🛠️',
                      ),
                      backgroundColor: Colors.blue[50],
                    ),
                    const Spacer(),
                    Text(
                      'سنة: ${car.year}',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text('المدينة: ${car.city}'),
                    if (car.ownerName != null) ...[
                      const SizedBox(width: 15),
                      const Icon(Icons.person, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('المالك: ${car.ownerName}'),
                    ],
                  ],
                ),
                if (car.description != null && car.description!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    car.description!,
                    style: const TextStyle(
                      color: Colors.black54,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

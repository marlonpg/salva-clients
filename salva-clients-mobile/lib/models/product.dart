class Product {
  final int id;
  final String name;
  final String category;
  final String? description;
  final double price;
  final int minStock;
  final int stockQuantity;

  Product({
    required this.id,
    required this.name,
    required this.category,
    this.description,
    required this.price,
    required this.minStock,
    required this.stockQuantity,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      minStock: json['minStock'] ?? 0,
      stockQuantity: json['stockQuantity'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'category': category,
      'description': description,
      'price': price,
      'minStock': minStock,
      'stockQuantity': stockQuantity,
    };
  }

  bool get isLowStock => stockQuantity <= minStock;
}

import 'client.dart';

class Service {
  final int id;
  final String pet;
  final Client? client;
  final String severity;
  final double amount;
  final String? createdDate;
  final String? updatedDate;

  Service({
    required this.id,
    required this.pet,
    this.client,
    required this.severity,
    required this.amount,
    this.createdDate,
    this.updatedDate,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'],
      pet: json['pet'],
      client: json['client'] != null ? Client.fromJson(json['client']) : null,
      severity: json['severity'],
      amount: (json['amount'] ?? 0).toDouble(),
      createdDate: json['createdDate'],
      updatedDate: json['updatedDate'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pet': pet,
      'severity': severity,
      'amount': amount,
      'client': client != null ? {'id': client!.id} : null,
    };
  }
}

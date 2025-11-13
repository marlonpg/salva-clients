class Client {
  final int id;
  final String name;
  final String lastname;
  final String cpf;
  final String address;
  final String city;
  final String emailAddress;
  final String phoneNumber;

  Client({
    required this.id,
    required this.name,
    required this.lastname,
    required this.cpf,
    required this.address,
    required this.city,
    required this.emailAddress,
    required this.phoneNumber,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'],
      name: json['name'],
      lastname: json['lastname'],
      cpf: json['cpf'],
      address: json['address'],
      city: json['city'],
      emailAddress: json['emailAddress'],
      phoneNumber: json['phoneNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'lastname': lastname,
      'cpf': cpf,
      'address': address,
      'city': city,
      'emailAddress': emailAddress,
      'phoneNumber': phoneNumber,
    };
  }
}

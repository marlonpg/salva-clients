import 'dart:convert';
import 'package:flutter/material.dart';
import '../../models/client.dart';
import '../../models/service.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import 'client_form_screen.dart';

class ClientDetailScreen extends StatefulWidget {
  final Client client;

  const ClientDetailScreen({super.key, required this.client});

  @override
  State<ClientDetailScreen> createState() => _ClientDetailScreenState();
}

class _ClientDetailScreenState extends State<ClientDetailScreen> {
  final ApiService _api = ApiService();
  List<Service> _services = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get(ApiConstants.services);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _services = data
              .map((json) => Service.fromJson(json))
              .where((s) => s.client?.id == widget.client.id)
              .toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao carregar serviços')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhes do Cliente'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ClientFormScreen(client: widget.client),
                ),
              );
              if (result == true && mounted) {
                Navigator.pop(context, true);
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${widget.client.name} ${widget.client.lastname}',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const Divider(height: 24),
                    _buildInfoRow('CPF', widget.client.cpf),
                    _buildInfoRow('Email', widget.client.emailAddress),
                    _buildInfoRow('Telefone', widget.client.phoneNumber),
                    _buildInfoRow('Endereço', widget.client.address),
                    _buildInfoRow('Cidade', widget.client.city),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Serviços',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _services.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('Nenhum serviço encontrado'),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _services.length,
                        itemBuilder: (context, index) {
                          final service = _services[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: const Icon(Icons.pets),
                              title: Text(service.pet),
                              subtitle: Text('Gravidade: ${service.severity}'),
                              trailing: Text(
                                'R\$ ${service.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

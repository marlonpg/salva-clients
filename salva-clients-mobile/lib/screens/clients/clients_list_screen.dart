import 'dart:convert';
import 'package:flutter/material.dart';
import '../../models/client.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import 'client_detail_screen.dart';
import 'client_form_screen.dart';

class ClientsListScreen extends StatefulWidget {
  const ClientsListScreen({super.key});

  @override
  State<ClientsListScreen> createState() => _ClientsListScreenState();
}

class _ClientsListScreenState extends State<ClientsListScreen> {
  final ApiService _api = ApiService();
  final _searchController = TextEditingController();
  List<Client> _clients = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadClients();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadClients() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get(ApiConstants.clients);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _clients = data.map((json) => Client.fromJson(json)).toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao carregar clientes')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _searchClients(String query) async {
    if (query.isEmpty) {
      _loadClients();
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await _api.get('${ApiConstants.clientsSearch}?name=$query');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _clients = data.map((json) => Client.fromJson(json)).toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao buscar clientes')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Buscar por nome, CPF ou cidade',
              prefixIcon: const Icon(Icons.search),
              border: const OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _searchController.clear();
                  _loadClients();
                },
              ),
            ),
            onSubmitted: _searchClients,
          ),
        ),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _clients.isEmpty
                  ? const Center(child: Text('Nenhum cliente encontrado'))
                  : ListView.builder(
                      itemCount: _clients.length,
                      itemBuilder: (context, index) {
                        final client = _clients[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF2D7D46),
                              child: Text(
                                client.name[0].toUpperCase(),
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                            title: Text('${client.name} ${client.lastname}'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('📞 ${client.phoneNumber}'),
                                Text('📍 ${client.city}'),
                              ],
                            ),
                            isThreeLine: true,
                            onTap: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ClientDetailScreen(client: client),
                                ),
                              );
                              if (result == true) _loadClients();
                            },
                          ),
                        );
                      },
                    ),
        ),
      ],
    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const ClientFormScreen(),
            ),
          );
          if (result == true) _loadClients();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

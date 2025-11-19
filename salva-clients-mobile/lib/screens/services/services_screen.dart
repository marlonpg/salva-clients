import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/service.dart';
import '../../models/client.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../providers/auth_provider.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final ApiService _api = ApiService();
  List<Service> _services = [];
  List<Client> _clients = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([_loadServices(), _loadClients()]);
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get(ApiConstants.services);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _services = data.map((json) => Service.fromJson(json)).toList();
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

  Future<void> _loadClients() async {
    try {
      final response = await _api.get(ApiConstants.clients);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _clients = data.map((json) => Client.fromJson(json)).toList();
        });
      }
    } catch (e) {
      // Silent fail
    }
  }

  Future<void> _deleteService(int id) async {
    try {
      final response = await _api.delete('${ApiConstants.services}/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        _loadServices();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Serviço excluído')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao excluir serviço')),
        );
      }
    }
  }

  void _showServiceForm([Service? service]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ServiceFormSheet(
        service: service,
        clients: _clients,
        onSaved: _loadServices,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final canManage = auth.hasAnyRole(['ADMIN', 'VETERINARIAN']);

    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _services.isEmpty
              ? const Center(child: Text('Nenhum serviço encontrado'))
              : ListView.builder(
                  itemCount: _services.length,
                  itemBuilder: (context, index) {
                    final service = _services[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: ListTile(
                        leading: const CircleAvatar(
                          child: Icon(Icons.pets),
                        ),
                        title: Text(service.pet),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Cliente: ${service.client?.name ?? "N/A"}'),
                            Text('Gravidade: ${service.severity}'),
                          ],
                        ),
                        trailing: Text(
                          'R\$ ${service.amount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        isThreeLine: true,
                        onTap: canManage
                            ? () => _showServiceForm(service)
                            : null,
                        onLongPress: canManage
                            ? () => _showDeleteDialog(service)
                            : null,
                      ),
                    );
                  },
                ),
      floatingActionButton: canManage
          ? FloatingActionButton(
              onPressed: () => _showServiceForm(),
              child: const Icon(Icons.add),
            )
          : null,
    );
  }

  void _showDeleteDialog(Service service) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Excluir Serviço'),
        content: Text('Deseja excluir o serviço de ${service.pet}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteService(service.id);
            },
            child: const Text('Excluir', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class ServiceFormSheet extends StatefulWidget {
  final Service? service;
  final List<Client> clients;
  final VoidCallback onSaved;

  const ServiceFormSheet({
    super.key,
    this.service,
    required this.clients,
    required this.onSaved,
  });

  @override
  State<ServiceFormSheet> createState() => _ServiceFormSheetState();
}

class _ServiceFormSheetState extends State<ServiceFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _api = ApiService();
  
  late TextEditingController _petController;
  late TextEditingController _severityController;
  late TextEditingController _amountController;
  int? _selectedClientId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _petController = TextEditingController(text: widget.service?.pet ?? '');
    _severityController = TextEditingController(text: widget.service?.severity ?? '');
    _amountController = TextEditingController(
      text: widget.service?.amount.toStringAsFixed(2) ?? '',
    );
    _selectedClientId = widget.service?.client?.id;
  }

  @override
  void dispose() {
    _petController.dispose();
    _severityController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _saveService() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedClientId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione um cliente')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final body = {
        'pet': _petController.text,
        'severity': _severityController.text,
        'amount': double.parse(_amountController.text),
        'client': {'id': _selectedClientId},
      };

      final response = widget.service == null
          ? await _api.post(ApiConstants.services, body)
          : await _api.put('${ApiConstants.services}/${widget.service!.id}', body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        widget.onSaved();
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Serviço salvo com sucesso')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao salvar serviço')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.service == null ? 'Novo Serviço' : 'Editar Serviço',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _petController,
              decoration: const InputDecoration(
                labelText: 'Pet',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v?.isEmpty ?? true ? 'Campo obrigatório' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<int>(
              value: _selectedClientId,
              decoration: const InputDecoration(
                labelText: 'Cliente',
                border: OutlineInputBorder(),
              ),
              items: widget.clients.map((client) {
                return DropdownMenuItem(
                  value: client.id,
                  child: Text('${client.name} ${client.lastname}'),
                );
              }).toList(),
              onChanged: (value) => setState(() => _selectedClientId = value),
              validator: (v) => v == null ? 'Selecione um cliente' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _severityController,
              decoration: const InputDecoration(
                labelText: 'Gravidade',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v?.isEmpty ?? true ? 'Campo obrigatório' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Valor',
                border: OutlineInputBorder(),
                prefixText: 'R\$ ',
              ),
              keyboardType: TextInputType.number,
              validator: (v) => v?.isEmpty ?? true ? 'Campo obrigatório' : null,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancelar'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveService,
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : const Text('Salvar'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

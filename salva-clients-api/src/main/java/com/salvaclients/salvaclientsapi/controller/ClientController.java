package com.salvaclients.salvaclientsapi.controller;

import com.salvaclients.salvaclientsapi.model.Client;
import com.salvaclients.salvaclientsapi.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientRepository.save(client);
    }

    @GetMapping("/search")
    public List<Client> searchClients(@RequestParam(required = false) String name,
                                     @RequestParam(required = false) String cpf,
                                     @RequestParam(required = false) String city) {
        // Simple search logic, can be improved
        return clientRepository.findAll().stream()
                .filter(c -> (name == null || c.getName().toLowerCase().contains(name.toLowerCase()))
                        && (cpf == null || c.getCpf().equalsIgnoreCase(cpf))
                        && (city == null || c.getCity().toLowerCase().contains(city.toLowerCase())))
                .toList();
    }
    @GetMapping("/{id}")
    public Client getClientById(@PathVariable Long id) {
        return clientRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Client updateClient(@PathVariable Long id, @RequestBody Client client) {
        return clientRepository.findById(id)
            .map(existing -> {
                existing.setName(client.getName());
                existing.setLastname(client.getLastname());
                existing.setCpf(client.getCpf());
                existing.setAddress(client.getAddress());
                existing.setCity(client.getCity());
                existing.setEmailAddress(client.getEmailAddress());
                existing.setPhoneNumber(client.getPhoneNumber());
                return clientRepository.save(existing);
            })
            .orElse(null);
    }
}
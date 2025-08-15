package com.salvaclients.salvaclientsapi.controller;

import com.salvaclients.salvaclientsapi.model.Service;
import com.salvaclients.salvaclientsapi.repository.ServiceRepository;
import com.salvaclients.salvaclientsapi.repository.ClientRepository;
import com.salvaclients.salvaclientsapi.model.Client;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final ClientRepository clientRepository;

    public ServiceController(ServiceRepository serviceRepository, ClientRepository clientRepository) {
        this.serviceRepository = serviceRepository;
        this.clientRepository = clientRepository;
    }

    @GetMapping
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Optional<Service> service = serviceRepository.findById(id);
        return service.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        if (service.getClient() == null || service.getClient().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Optional<Client> clientOpt = clientRepository.findById(service.getClient().getId());
        if (clientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        service.setClient(clientOpt.get());
        service.setCreatedDate(LocalDateTime.now());
        service.setUpdatedDate(LocalDateTime.now());
        Service saved = serviceRepository.save(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service service) {
        Optional<Service> existingOpt = serviceRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Service existing = existingOpt.get();
        existing.setPet(service.getPet());
        existing.setSeverity(service.getSeverity());
        existing.setUpdatedDate(LocalDateTime.now());
        if (service.getClient() != null && service.getClient().getId() != null) {
            Optional<Client> clientOpt = clientRepository.findById(service.getClient().getId());
            clientOpt.ifPresent(existing::setClient);
        }
        Service updated = serviceRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (!serviceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        serviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
package com.salvaclients.salvaclientsapi.repository;

import com.salvaclients.salvaclientsapi.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
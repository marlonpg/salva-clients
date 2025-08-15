package com.salvaclients.salvaclientsapi.repository;

import com.salvaclients.salvaclientsapi.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}
package com.salvaclients.salvaclientsapi.repository;

import com.salvaclients.salvaclientsapi.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
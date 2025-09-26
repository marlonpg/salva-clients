package com.salvaclients.salvaclientsapi.repository;

import com.salvaclients.salvaclientsapi.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}
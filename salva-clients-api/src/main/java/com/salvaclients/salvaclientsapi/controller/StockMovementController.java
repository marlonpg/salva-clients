package com.salvaclients.salvaclientsapi.controller;

import com.salvaclients.salvaclientsapi.model.Product;
import com.salvaclients.salvaclientsapi.model.StockMovement;
import com.salvaclients.salvaclientsapi.repository.ProductRepository;
import com.salvaclients.salvaclientsapi.repository.StockMovementRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;

    public StockMovementController(StockMovementRepository stockMovementRepository, ProductRepository productRepository) {
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<StockMovement> createMovement(@RequestBody StockMovementRequest request) {
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Get current authenticated user
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth != null ? auth.getName() : "system";

        Product product = productOpt.get();
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        
        // Validate stock for OUT movements
        if ("OUT".equals(request.getType()) && currentStock < request.getQuantity()) {
            return ResponseEntity.badRequest().body("Estoque insuficiente. Estoque atual: " + currentStock);
        }
        
        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(StockMovement.MovementType.valueOf(request.getType()));
        movement.setQuantity(request.getQuantity());
        movement.setUnitPrice(request.getUnitPrice());
        movement.setSupplier(request.getSupplier());
        movement.setNotes(request.getNotes());
        movement.setCreatedBy(currentUser);

        // Update product stock
        if (movement.getType() == StockMovement.MovementType.IN) {
            product.setStockQuantity(currentStock + request.getQuantity());
        } else {
            product.setStockQuantity(currentStock - request.getQuantity());
        }
        productRepository.save(product);

        StockMovement saved = stockMovementRepository.save(movement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public static class StockMovementRequest {
        private Long productId;
        private String type;
        private Integer quantity;
        private java.math.BigDecimal unitPrice;
        private String supplier;
        private String notes;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public java.math.BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(java.math.BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getSupplier() { return supplier; }
        public void setSupplier(String supplier) { this.supplier = supplier; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
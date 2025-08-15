package com.salvaclients.salvaclientsapi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pet;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;


    private String severity;

    private java.math.BigDecimal amount;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPet() { return pet; }
    public void setPet(String pet) { this.pet = pet; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }


    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
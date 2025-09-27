package com.salvaclients.salvaclientsapi.controller;

import com.salvaclients.salvaclientsapi.model.Expense;
import com.salvaclients.salvaclientsapi.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/expenses")
@PreAuthorize("hasRole('ADMIN')")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    public ExpenseController(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @GetMapping
    public List<Expense> getAllExpenses(@RequestParam(required = false) String month) {
        if (month != null) {
            LocalDate startDate = LocalDate.parse(month + "-01");
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            return expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDesc(startDate, endDate);
        }
        return expenseRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequest request) {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth != null ? auth.getName() : "admin";

        Expense expense = new Expense();
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setSupplier(request.getSupplier());
        expense.setNotes(request.getNotes());
        expense.setCreatedBy(currentUser);

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getExpenseSummary(@RequestParam String month) {
        LocalDate startDate = LocalDate.parse(month + "-01");
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Object[]> categoryData = expenseRepository.findExpensesByCategory(startDate, endDate);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("categoryBreakdown", categoryData);
        
        return ResponseEntity.ok(summary);
    }

    public static class ExpenseRequest {
        private String category;
        private String description;
        private java.math.BigDecimal amount;
        private LocalDate expenseDate;
        private String supplier;
        private String notes;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
        public LocalDate getExpenseDate() { return expenseDate; }
        public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
        public String getSupplier() { return supplier; }
        public void setSupplier(String supplier) { this.supplier = supplier; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
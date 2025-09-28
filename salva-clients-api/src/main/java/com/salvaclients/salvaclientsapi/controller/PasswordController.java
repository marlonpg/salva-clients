package com.salvaclients.salvaclientsapi.controller;

import com.salvaclients.salvaclientsapi.model.User;
import com.salvaclients.salvaclientsapi.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/password")
public class PasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/change")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        return userRepository.findByUsername(currentUsername)
            .map(user -> {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body("Senha atual incorreta");
                }
                
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setPasswordSet(true);
                userRepository.save(user);
                
                return ResponseEntity.ok("Senha alterada com sucesso");
            })
            .orElse(ResponseEntity.notFound().build());
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
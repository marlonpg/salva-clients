package com.salvaclients.salvaclientsapi.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNewUserEmail(String toEmail, String username, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Bem-vindo ao Sistema Salva Clientes");
        message.setText(
            "Olá!\n\n" +
            "Sua conta foi criada no sistema Salva Clientes.\n\n" +
            "Dados de acesso:\n" +
            "Usuário: " + username + "\n" +
            "Senha temporária: " + tempPassword + "\n\n" +
            "Por favor, faça login e altere sua senha.\n\n" +
            "Atenciosamente,\n" +
            "Equipe Salva Clientes"
        );
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail user creation
            System.err.println("Erro ao enviar email: " + e.getMessage());
        }
    }
}
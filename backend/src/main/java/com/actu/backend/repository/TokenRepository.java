package com.actu.backend.repository;

import com.actu.backend.model.Token;
import com.actu.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByValue(String value);
    List<Token> findByUser(User user);
    void deleteByUser(User user);

    // Trouver un token valide pour un utilisateur
    Optional<Token> findFirstByUserAndRevokedFalseAndExpiresAtAfter(User user, LocalDateTime now);
} 
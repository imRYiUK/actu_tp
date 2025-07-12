package com.actu.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import com.actu.backend.repository.TokenRepository;
import com.actu.backend.model.Token;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private TokenRepository tokenRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Skip SOAP requests - they will be handled by SoapJwtAuthenticationInterceptor
        String path = request.getRequestURI();
        return path.startsWith("/ws");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String tokenValue = null;
        String username = null;
        if (header != null && header.startsWith("Bearer ")) {
            tokenValue = header.substring(7);
            logger.info("[JWT FILTER] Authorization header found, token: {}", tokenValue);
            try {
                username = jwtUtil.getUsernameFromToken(tokenValue);
                logger.info("[JWT FILTER] Username from token: {}", username);
            } catch (Exception e) {
                logger.warn("[JWT FILTER] Impossible d'extraire le username du token: {}", e.getMessage());
            }
        } else {
            logger.info("[JWT FILTER] Pas de header Authorization Bearer trouvé");
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Token dbToken = tokenRepository.findByValue(tokenValue)
                    .filter(t -> !t.isRevoked() && t.getExpiresAt().isAfter(LocalDateTime.now()))
                    .orElse(null);
            if (dbToken == null) {
                logger.warn("[JWT FILTER] Token non trouvé ou révoqué/expiré en base pour username: {}", username);
            } else {
                logger.info("[JWT FILTER] Token trouvé en base et valide (non révoqué, non expiré) pour username: {}", username);
            }
            if (dbToken != null && jwtUtil.validateJwtToken(tokenValue)) {
                logger.info("[JWT FILTER] Token JWT valide, authentification de l'utilisateur: {}", username);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                logger.warn("[JWT FILTER] Token JWT non valide ou non trouvé en base pour username: {}", username);
            }
        }
        filterChain.doFilter(request, response);
    }
} 
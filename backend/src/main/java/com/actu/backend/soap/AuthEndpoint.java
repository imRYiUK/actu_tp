package com.actu.backend.soap;

import com.actu.backend.model.User;
import com.actu.backend.model.Token;
import com.actu.backend.repository.UserRepository;
import com.actu.backend.repository.TokenRepository;
import com.actu.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import com.actu.backend.users.*;
import java.time.LocalDateTime;
import java.util.Optional;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.time.ZoneId;
import java.util.GregorianCalendar;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Endpoint
public class AuthEndpoint {
    private static final String NAMESPACE_URI = "http://actu.com/users";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    // --- Login ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "loginRequest")
    @ResponsePayload
    public LoginResponse login(@RequestPayload LoginRequest request) {
        LoginResponse response = new LoginResponse();
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            
            // Create or update token
            Optional<Token> existingTokenOpt = tokenRepository.findFirstByUserAndRevokedFalseAndExpiresAtAfter(user, LocalDateTime.now());
            Token token;
            if (existingTokenOpt.isPresent()) {
                token = existingTokenOpt.get();
                token.setValue(jwt);
                token.setExpiresAt(LocalDateTime.now().plusDays(30));
            } else {
                token = Token.builder()
                        .value(jwt)
                        .user(user)
                        .createdAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .revoked(false)
                        .build();
            }
            tokenRepository.save(token);
            
            // Create AuthUser for response
            AuthUser authUser = new AuthUser();
            authUser.setUsername(user.getUsername());
            authUser.setRole(UserMapper.toSoapUserRole(user.getRole()));
            
            response.setToken(jwt);
            response.setUser(authUser);
        }
        return response;
    }

    // --- Register ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "registerRequest")
    @ResponsePayload
    public RegisterResponse register(@RequestPayload RegisterRequest request) {
        RegisterResponse response = new RegisterResponse();
        
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            response.setSuccess(false);
            response.setMessage("Username already exists");
            return response;
        }
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            response.setSuccess(false);
            response.setMessage("Email already exists");
            return response;
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.VISITOR)
                .build();
        
        userRepository.save(user);
        response.setSuccess(true);
        response.setMessage("Registration successful");
        return response;
    }

    // --- Get current user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getCurrentUserRequest")
    @ResponsePayload
    public GetCurrentUserResponse getCurrentUser(@RequestPayload GetCurrentUserRequest request) {
        GetCurrentUserResponse response = new GetCurrentUserResponse();
        
        // Extract user info from the JWT token in the request
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            userOpt.ifPresent(user -> response.setUser(UserMapper.toSoapUser(user)));
        }
        
        return response;
    }

    // --- Logout ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "logoutRequest")
    @ResponsePayload
    public LogoutResponse logout(@RequestPayload LogoutRequest request) {
        LogoutResponse response = new LogoutResponse();
        // This would typically invalidate the JWT token
        // For now, we'll return a placeholder response
        response.setSuccess(true);
        response.setMessage("Logout successful");
        return response;
    }

    // --- Helper methods ---
    private com.actu.backend.users.User toSoapUser(User user) {
        return UserMapper.toSoapUser(user);
    }

    private com.actu.backend.users.UserRole toSoapUserRole(User.Role role) {
        return UserMapper.toSoapUserRole(role);
    }
} 
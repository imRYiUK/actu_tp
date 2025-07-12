package com.actu.backend.soap;

import com.actu.backend.model.User;
import com.actu.backend.model.Token;
import com.actu.backend.repository.UserRepository;
import com.actu.backend.repository.TokenRepository;
import com.actu.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import com.actu.backend.users.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.time.ZoneId;
import java.util.GregorianCalendar;

@Endpoint
public class UserEndpoint {
    private static final String NAMESPACE_URI = "http://actu.com/users";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    // --- Admin: Get all users ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getAllUsersRequest")
    @ResponsePayload
    public GetAllUsersResponse getAllUsers(@RequestPayload GetAllUsersRequest request) {
        GetAllUsersResponse response = new GetAllUsersResponse();
        List<User> users = userRepository.findAll();
        UserList userList = new UserList();
        userList.getUser().addAll(users.stream().map(this::toSoapUser).collect(Collectors.toList()));
        response.setUsers(userList);
        return response;
    }

    // --- Admin: Get user by ID ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getUserRequest")
    @ResponsePayload
    public GetUserResponse getUser(@RequestPayload GetUserRequest request) {
        GetUserResponse response = new GetUserResponse();
        Optional<User> userOpt = userRepository.findById(request.getId());
        userOpt.ifPresent(user -> response.setUser(toSoapUser(user)));
        return response;
    }

    // --- Admin: Create user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "createUserRequest")
    @ResponsePayload
    public CreateUserResponse createUser(@RequestPayload CreateUserRequest request) {
        CreateUserResponse response = new CreateUserResponse();
        User user = toDomainUser(request.getUser());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        response.setUser(toSoapUser(saved));
        return response;
    }

    // --- Admin: Update user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "updateUserRequest")
    @ResponsePayload
    public UpdateUserResponse updateUser(@RequestPayload UpdateUserRequest request) {
        UpdateUserResponse response = new UpdateUserResponse();
        Optional<User> userOpt = userRepository.findById(request.getId());
        if (userOpt.isPresent()) {
            User existing = userOpt.get();
            User user = toDomainUser(request.getUser());
            user.setId(existing.getId());
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(existing.getPassword());
            } else if (!user.getPassword().equals(existing.getPassword())) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            User saved = userRepository.save(user);
            response.setUser(toSoapUser(saved));
        }
        return response;
    }

    // --- Admin: Delete user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "deleteUserRequest")
    @ResponsePayload
    public DeleteUserResponse deleteUser(@RequestPayload DeleteUserRequest request) {
        DeleteUserResponse response = new DeleteUserResponse();
        Optional<User> userOpt = userRepository.findById(request.getId());
        if (userOpt.isPresent()) {
            tokenRepository.deleteByUser(userOpt.get());
            userRepository.deleteById(request.getId());
            response.setSuccess(true);
            response.setMessage("User deleted");
        } else {
            response.setSuccess(false);
            response.setMessage("User not found");
        }
        return response;
    }

    // --- Admin: Get all tokens ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getAllTokensRequest")
    @ResponsePayload
    public GetAllTokensResponse getAllTokens(@RequestPayload GetAllTokensRequest request) {
        GetAllTokensResponse response = new GetAllTokensResponse();
        List<Token> tokens = tokenRepository.findAll();
        TokenList tokenList = new TokenList();
        tokenList.getToken().addAll(tokens.stream().map(this::toSoapToken).collect(Collectors.toList()));
        response.setTokens(tokenList);
        return response;
    }

    // --- Admin: Generate token ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "generateTokenRequest")
    @ResponsePayload
    public GenerateTokenResponse generateToken(@RequestPayload GenerateTokenRequest request) {
        GenerateTokenResponse response = new GenerateTokenResponse();
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) return response;
        Optional<Token> existingTokenOpt = tokenRepository.findFirstByUserAndRevokedFalseAndExpiresAtAfter(user, LocalDateTime.now());
        Token token;
        if (existingTokenOpt.isPresent()) {
            token = existingTokenOpt.get();
        } else {
            List<Token> userTokens = tokenRepository.findByUser(user);
            token = null;
            for (Token t : userTokens) {
                if (t.isRevoked() || t.getExpiresAt().isBefore(LocalDateTime.now())) {
                    String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
                    t.setValue(jwt);
                    t.setRevoked(false);
                    t.setCreatedAt(LocalDateTime.now());
                    t.setExpiresAt(LocalDateTime.now().plusDays(30));
                    token = tokenRepository.save(t);
                    break;
                }
            }
            if (token == null) {
                String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
                token = Token.builder()
                        .value(jwt)
                        .user(user)
                        .createdAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .revoked(false)
                        .build();
                token = tokenRepository.save(token);
            }
        }
        response.setToken(toSoapToken(token));
        return response;
    }

    // --- Admin: Delete token ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "deleteTokenRequest")
    @ResponsePayload
    public DeleteTokenResponse deleteToken(@RequestPayload DeleteTokenRequest request) {
        DeleteTokenResponse response = new DeleteTokenResponse();
        Optional<Token> tokenOpt = tokenRepository.findById(request.getId());
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            token.setRevoked(true);
            tokenRepository.save(token);
            tokenRepository.deleteById(request.getId());
            response.setSuccess(true);
            response.setMessage("Token deleted");
        } else {
            response.setSuccess(false);
            response.setMessage("Token not found");
        }
        return response;
    }

    // --- Admin: Get tokens by user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getTokensByUserRequest")
    @ResponsePayload
    public GetTokensByUserResponse getTokensByUser(@RequestPayload GetTokensByUserRequest request) {
        GetTokensByUserResponse response = new GetTokensByUserResponse();
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        TokenList tokenList = new TokenList();
        if (userOpt.isPresent()) {
            List<Token> tokens = tokenRepository.findByUser(userOpt.get());
            tokenList.getToken().addAll(tokens.stream().map(this::toSoapToken).collect(Collectors.toList()));
        }
        response.setTokens(tokenList);
        return response;
    }

    // --- Admin: Reactivate token ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "reactivateTokenRequest")
    @ResponsePayload
    public ReactivateTokenResponse reactivateToken(@RequestPayload ReactivateTokenRequest request) {
        ReactivateTokenResponse response = new ReactivateTokenResponse();
        Optional<Token> tokenOpt = tokenRepository.findById(request.getId());
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            token.setRevoked(false);
            tokenRepository.save(token);
            response.setSuccess(true);
            response.setMessage("Token reactivated");
        } else {
            response.setSuccess(false);
            response.setMessage("Token not found");
        }
        return response;
    }

    // --- Admin: Revoke token ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "revokeTokenRequest")
    @ResponsePayload
    public RevokeTokenResponse revokeToken(@RequestPayload RevokeTokenRequest request) {
        RevokeTokenResponse response = new RevokeTokenResponse();
        Optional<Token> tokenOpt = tokenRepository.findById(request.getId());
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            token.setRevoked(true);
            tokenRepository.save(token);
            response.setSuccess(true);
            response.setMessage("Token revoked");
        } else {
            response.setSuccess(false);
            response.setMessage("Token not found");
        }
        return response;
    }

    // --- Editor/Admin: Get profile ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getProfileRequest")
    @ResponsePayload
    public GetProfileResponse getProfile(@RequestPayload GetProfileRequest request) {
        GetProfileResponse response = new GetProfileResponse();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        userOpt.ifPresent(user -> response.setUser(toSoapUser(user)));
        return response;
    }

    // --- Editor/Admin: Update profile ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "updateProfileRequest")
    @ResponsePayload
    public UpdateProfileResponse updateProfile(@RequestPayload UpdateProfileRequest request) {
        UpdateProfileResponse response = new UpdateProfileResponse();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User existing = userOpt.get();
            User user = toDomainUser(request.getUser());
            user.setId(existing.getId());
            if (!user.getPassword().equals(existing.getPassword())) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            user.setRole(existing.getRole());
            User saved = userRepository.save(user);
            response.setUser(toSoapUser(saved));
        }
        return response;
    }

    // --- Authentication: Login ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "loginRequest")
    @ResponsePayload
    public LoginResponse login(@RequestPayload LoginRequest request) {
        LoginResponse response = new LoginResponse();
        try {
            // Note: For SOAP, we'll handle authentication differently since we can't use AuthenticationManager directly
            // We'll validate credentials manually
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    // Generate JWT token
                    String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
                    
                    // Find or create token in database
                    Token token = tokenRepository.findFirstByUserAndRevokedFalseAndExpiresAtAfter(user, LocalDateTime.now())
                            .filter(t -> jwtUtil.validateJwtToken(t.getValue()))
                            .orElseGet(() -> {
                                Token newToken = Token.builder()
                                        .value(jwt)
                                        .user(user)
                                        .createdAt(LocalDateTime.now())
                                        .expiresAt(LocalDateTime.now().plusDays(30))
                                        .revoked(false)
                                        .build();
                                return tokenRepository.save(newToken);
                            });
                    
                    response.setToken(token.getValue());
                    AuthUser authUser = new AuthUser();
                    authUser.setUsername(user.getUsername());
                    authUser.setRole(toSoapUserRole(user.getRole()));
                    response.setUser(authUser);
                }
            }
        } catch (Exception e) {
            // Handle authentication failure
        }
        return response;
    }

    // --- Authentication: Register ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "registerRequest")
    @ResponsePayload
    public RegisterResponse register(@RequestPayload RegisterRequest request) {
        RegisterResponse response = new RegisterResponse();
        try {
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
            response.setMessage("User registered successfully");
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Registration failed: " + e.getMessage());
        }
        return response;
    }

    // --- Authentication: Get current user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getCurrentUserRequest")
    @ResponsePayload
    public GetCurrentUserResponse getCurrentUser(@RequestPayload GetCurrentUserRequest request) {
        GetCurrentUserResponse response = new GetCurrentUserResponse();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            userOpt.ifPresent(user -> response.setUser(toSoapUser(user)));
        }
        return response;
    }

    // --- Authentication: Logout ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "logoutRequest")
    @ResponsePayload
    public LogoutResponse logout(@RequestPayload LogoutRequest request) {
        LogoutResponse response = new LogoutResponse();
        try {
            // For SOAP logout, we'll need to get the token from the SOAP header
            // This is handled by the SOAP interceptor, so we just return success
            response.setSuccess(true);
            response.setMessage("Logged out successfully");
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Logout failed: " + e.getMessage());
        }
        return response;
    }

    // --- Mapping helpers ---
    private com.actu.backend.users.User toSoapUser(User user) {
        com.actu.backend.users.User soapUser = new com.actu.backend.users.User();
        soapUser.setId(user.getId());
        soapUser.setUsername(user.getUsername());
        soapUser.setPassword(user.getPassword());
        soapUser.setEmail(user.getEmail());
        soapUser.setRole(com.actu.backend.users.UserRole.fromValue(user.getRole().name()));
        return soapUser;
    }

    private User toDomainUser(com.actu.backend.users.User soapUser) {
        User user = new User();
        user.setId(soapUser.getId());
        user.setUsername(soapUser.getUsername());
        user.setPassword(soapUser.getPassword());
        user.setEmail(soapUser.getEmail());
        user.setRole(com.actu.backend.model.User.Role.valueOf(soapUser.getRole().value()));
        return user;
    }

    private com.actu.backend.users.Token toSoapToken(Token token) {
        com.actu.backend.users.Token soapToken = new com.actu.backend.users.Token();
        soapToken.setId(token.getId());
        soapToken.setValue(token.getValue());
        soapToken.setUserId(token.getUser().getId());
        soapToken.setCreatedAt(toXMLGregorianCalendar(token.getCreatedAt()));
        soapToken.setExpiresAt(toXMLGregorianCalendar(token.getExpiresAt()));
        soapToken.setRevoked(token.isRevoked());
        return soapToken;
    }

    private XMLGregorianCalendar toXMLGregorianCalendar(LocalDateTime dateTime) {
        try {
            GregorianCalendar cal = GregorianCalendar.from(dateTime.atZone(ZoneId.systemDefault()));
            return DatatypeFactory.newInstance().newXMLGregorianCalendar(cal);
        } catch (Exception e) {
            return null;
        }
    }

    private com.actu.backend.users.UserRole toSoapUserRole(User.Role role) {
        return com.actu.backend.users.UserRole.fromValue(role.name());
    }
} 
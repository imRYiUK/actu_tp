package com.actu.backend.soap;

import com.actu.backend.model.User;
import com.actu.backend.model.Token;
import com.actu.backend.repository.UserRepository;
import com.actu.backend.repository.TokenRepository;
import com.actu.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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
public class TokenEndpoint {
    private static final String NAMESPACE_URI = "http://actu.com/users";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private JwtUtil jwtUtil;

    // --- Admin: Get all tokens ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getAllTokensRequest")
    @ResponsePayload
    public GetAllTokensResponse getAllTokens(@RequestPayload GetAllTokensRequest request) {
        GetAllTokensResponse response = new GetAllTokensResponse();
        List<Token> tokens = tokenRepository.findAll();
        TokenList tokenList = new TokenList();
        tokenList.getToken().addAll(tokens.stream().map(UserMapper::toSoapToken).collect(Collectors.toList()));
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
            tokenList.getToken().addAll(tokens.stream().map(UserMapper::toSoapToken).collect(Collectors.toList()));
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
            token.setExpiresAt(LocalDateTime.now().plusDays(30));
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

    // --- Helper methods ---
    private com.actu.backend.users.Token toSoapToken(Token token) {
        return UserMapper.toSoapToken(token);
    }

    private XMLGregorianCalendar toXMLGregorianCalendar(LocalDateTime dateTime) {
        return UserMapper.toXMLGregorianCalendar(dateTime);
    }
} 
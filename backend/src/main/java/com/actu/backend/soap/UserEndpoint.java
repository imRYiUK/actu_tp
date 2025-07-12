package com.actu.backend.soap;

import com.actu.backend.model.User;
import com.actu.backend.model.Token;
import com.actu.backend.repository.UserRepository;
import com.actu.backend.repository.TokenRepository;
import com.actu.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import com.actu.backend.users.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        userList.getUser().addAll(users.stream().map(UserMapper::toSoapUser).collect(Collectors.toList()));
        response.setUsers(userList);
        return response;
    }

    // --- Admin: Get user by ID ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getUserRequest")
    @ResponsePayload
    public GetUserResponse getUser(@RequestPayload GetUserRequest request) {
        GetUserResponse response = new GetUserResponse();
        Optional<User> userOpt = userRepository.findById(request.getId());
        userOpt.ifPresent(user -> response.setUser(UserMapper.toSoapUser(user)));
        return response;
    }

    // --- Admin: Create user ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "createUserRequest")
    @ResponsePayload
    public CreateUserResponse createUser(@RequestPayload CreateUserRequest request) {
        CreateUserResponse response = new CreateUserResponse();
        User user = UserMapper.toDomainUser(request.getUser());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        response.setUser(UserMapper.toSoapUser(saved));
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
            User user = UserMapper.toDomainUser(request.getUser());
            user.setId(existing.getId());
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(existing.getPassword());
            } else if (!user.getPassword().equals(existing.getPassword())) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            User saved = userRepository.save(user);
            response.setUser(UserMapper.toSoapUser(saved));
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

    // --- User: Get profile ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getProfileRequest")
    @ResponsePayload
    public GetProfileResponse getProfile(@RequestPayload GetProfileRequest request) {
        GetProfileResponse response = new GetProfileResponse();
        
        // Extract user info from the JWT token in the request
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            userOpt.ifPresent(user -> response.setUser(UserMapper.toSoapUser(user)));
        }
        
        return response;
    }

    // --- User: Update profile ---
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "updateProfileRequest")
    @ResponsePayload
    public UpdateProfileResponse updateProfile(@RequestPayload UpdateProfileRequest request) {
        UpdateProfileResponse response = new UpdateProfileResponse();
        
        // Extract user info from the JWT token in the request
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User existing = userOpt.get();
                User user = UserMapper.toDomainUser(request.getUser());
                user.setId(existing.getId());
                user.setRole(existing.getRole()); // Users can't change their own role
                
                // Handle password update
                if (user.getPassword() == null || user.getPassword().isEmpty()) {
                    user.setPassword(existing.getPassword());
                } else if (!user.getPassword().equals(existing.getPassword())) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                }
                
                User saved = userRepository.save(user);
                response.setUser(UserMapper.toSoapUser(saved));
            }
        }
        
        return response;
    }
} 
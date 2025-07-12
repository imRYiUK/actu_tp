package com.actu.backend.soap;

import com.actu.backend.model.User;
import com.actu.backend.model.Token;
import com.actu.backend.users.*;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.GregorianCalendar;

public class UserMapper {
    
    public static com.actu.backend.users.User toSoapUser(User user) {
        if (user == null) {
            return null;
        }
        
        com.actu.backend.users.User soapUser = new com.actu.backend.users.User();
        soapUser.setId(user.getId());
        soapUser.setUsername(user.getUsername());
        soapUser.setEmail(user.getEmail());
        soapUser.setRole(toSoapUserRole(user.getRole()));
        return soapUser;
    }
    
    public static User toDomainUser(com.actu.backend.users.User soapUser) {
        if (soapUser == null) {
            return null;
        }
        
        User user = new User();
        user.setId(soapUser.getId());
        user.setUsername(soapUser.getUsername());
        user.setEmail(soapUser.getEmail());
        user.setPassword(soapUser.getPassword());
        user.setRole(toDomainUserRole(soapUser.getRole()));
        return user;
    }
    
    public static com.actu.backend.users.Token toSoapToken(Token token) {
        if (token == null) {
            return null;
        }
        
        com.actu.backend.users.Token soapToken = new com.actu.backend.users.Token();
        soapToken.setId(token.getId());
        soapToken.setValue(token.getValue());
        soapToken.setUserId(token.getUser().getId());
        soapToken.setCreatedAt(toXMLGregorianCalendar(token.getCreatedAt()));
        soapToken.setExpiresAt(toXMLGregorianCalendar(token.getExpiresAt()));
        soapToken.setRevoked(token.isRevoked());
        return soapToken;
    }
    
    public static com.actu.backend.users.UserRole toSoapUserRole(User.Role role) {
        if (role == null) {
            return com.actu.backend.users.UserRole.USER; // Default to USER for null roles
        }
        
        switch (role) {
            case VISITOR: return com.actu.backend.users.UserRole.USER;
            case EDITOR: return com.actu.backend.users.UserRole.EDITOR;
            case ADMIN: return com.actu.backend.users.UserRole.ADMIN;
            default: return com.actu.backend.users.UserRole.USER;
        }
    }
    
    public static User.Role toDomainUserRole(com.actu.backend.users.UserRole soapRole) {
        if (soapRole == null) {
            return User.Role.VISITOR; // Default to VISITOR for null roles
        }
        
        switch (soapRole) {
            case USER: return User.Role.VISITOR;
            case EDITOR: return User.Role.EDITOR;
            case ADMIN: return User.Role.ADMIN;
            default: return User.Role.VISITOR;
        }
    }
    
    public static XMLGregorianCalendar toXMLGregorianCalendar(LocalDateTime dateTime) {
        try {
            GregorianCalendar calendar = GregorianCalendar.from(dateTime.atZone(ZoneId.systemDefault()));
            return DatatypeFactory.newInstance().newXMLGregorianCalendar(calendar);
        } catch (Exception e) {
            return null;
        }
    }
} 
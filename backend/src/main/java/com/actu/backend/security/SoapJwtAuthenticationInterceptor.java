package com.actu.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.ws.context.MessageContext;
import org.springframework.ws.server.EndpointInterceptor;
import org.springframework.ws.soap.SoapHeaderElement;
import org.springframework.ws.soap.SoapMessage;
import org.springframework.ws.WebServiceMessage;
import org.springframework.ws.soap.SoapFault;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.actu.backend.repository.TokenRepository;
import com.actu.backend.model.Token;

import javax.xml.namespace.QName;
import java.time.LocalDateTime;
import java.util.Iterator;

@Component
public class SoapJwtAuthenticationInterceptor implements EndpointInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(SoapJwtAuthenticationInterceptor.class);
    
    private static final String TOKEN_HEADER_NAME = "Authorization";
    private static final String NAMESPACE_URI = "http://actu.com/security";

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private TokenRepository tokenRepository;

    @Override
    public boolean handleRequest(MessageContext messageContext, Object endpoint) throws Exception {
        WebServiceMessage request = messageContext.getRequest();
        
        if (request instanceof SoapMessage) {
            SoapMessage soapMessage = (SoapMessage) request;
            
            // Check if this is an authentication request (login/register)
            if (isAuthenticationRequest(soapMessage)) {
                logger.info("[SOAP JWT FILTER] Authentication request detected, skipping JWT validation");
                return true;
            }
            
            // Extract token from SOAP header
            String tokenValue = extractTokenFromHeader(soapMessage);
            
            if (tokenValue == null) {
                logger.warn("[SOAP JWT FILTER] Pas de token d'autorisation trouvé dans les headers SOAP");
                createUnauthorizedFault(messageContext, "Missing authorization token");
                return false;
            }

            // Remove "Bearer " prefix if present
            if (tokenValue.startsWith("Bearer ")) {
                tokenValue = tokenValue.substring(7);
            }

            logger.info("[SOAP JWT FILTER] Token trouvé: {}", tokenValue);

            try {
                String username = jwtUtil.getUsernameFromToken(tokenValue);
                logger.info("[SOAP JWT FILTER] Username from token: {}", username);

                if (username != null) {
                    // Check token in database
                    Token dbToken = tokenRepository.findByValue(tokenValue)
                            .filter(t -> !t.isRevoked() && t.getExpiresAt().isAfter(LocalDateTime.now()))
                            .orElse(null);

                    if (dbToken == null) {
                        logger.warn("[SOAP JWT FILTER] Token non trouvé ou révoqué/expiré en base pour username: {}", username);
                        createUnauthorizedFault(messageContext, "Token not found or expired");
                        return false;
                    }

                    logger.info("[SOAP JWT FILTER] Token trouvé en base et valide pour username: {}", username);

                    if (jwtUtil.validateJwtToken(tokenValue)) {
                        logger.info("[SOAP JWT FILTER] Token JWT valide, authentification de l'utilisateur: {}", username);
                        
                        // Authenticate user
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        
                        return true;
                    } else {
                        logger.warn("[SOAP JWT FILTER] Token JWT non valide pour username: {}", username);
                        createUnauthorizedFault(messageContext, "Invalid token");
                        return false;
                    }
                }
            } catch (Exception e) {
                logger.warn("[SOAP JWT FILTER] Erreur lors de la validation du token: {}", e.getMessage());
                createUnauthorizedFault(messageContext, "Token validation error");
                return false;
            }
        }
        
        createUnauthorizedFault(messageContext, "Authentication required");
        return false;
    }

    @Override
    public boolean handleResponse(MessageContext messageContext, Object endpoint) throws Exception {
        return true;
    }

    @Override
    public boolean handleFault(MessageContext messageContext, Object endpoint) throws Exception {
        return true;
    }

    @Override
    public void afterCompletion(MessageContext messageContext, Object endpoint, Exception ex) throws Exception {
        // Clear security context after request
        SecurityContextHolder.clearContext();
    }

    private String extractTokenFromHeader(SoapMessage soapMessage) {
        try {
            if (soapMessage.getSoapHeader() == null) {
                return null;
            }

            Iterator<SoapHeaderElement> headers = soapMessage.getSoapHeader().examineAllHeaderElements();
            
            while (headers.hasNext()) {
                SoapHeaderElement header = headers.next();
                QName headerName = header.getName();
                
                if (TOKEN_HEADER_NAME.equals(headerName.getLocalPart()) && 
                    NAMESPACE_URI.equals(headerName.getNamespaceURI())) {
                    return header.getText();
                }
            }
        } catch (Exception e) {
            logger.error("[SOAP JWT FILTER] Erreur lors de l'extraction du token: {}", e.getMessage());
        }
        
        return null;
    }

    private void createUnauthorizedFault(MessageContext messageContext, String message) {
        try {
            SoapMessage response = (SoapMessage) messageContext.getResponse();
            response.getSoapBody().addClientOrSenderFault(message, null);
        } catch (Exception e) {
            logger.error("[SOAP JWT FILTER] Erreur lors de la création du SOAP fault: {}", e.getMessage());
        }
    }

    private boolean isAuthenticationRequest(SoapMessage soapMessage) {
        try {
            if (soapMessage.getSoapBody() == null) {
                return false;
            }
            
            // Convert SOAP message to string to check content
            javax.xml.transform.TransformerFactory factory = javax.xml.transform.TransformerFactory.newInstance();
            javax.xml.transform.Transformer transformer = factory.newTransformer();
            javax.xml.transform.dom.DOMSource source = new javax.xml.transform.dom.DOMSource(soapMessage.getDocument());
            java.io.StringWriter writer = new java.io.StringWriter();
            javax.xml.transform.stream.StreamResult result = new javax.xml.transform.stream.StreamResult(writer);
            transformer.transform(source, result);
            String bodyContent = writer.toString();
            
            // Check if the request contains authentication operations
            return bodyContent.contains("loginRequest") || bodyContent.contains("registerRequest");
            
        } catch (Exception e) {
            logger.error("[SOAP JWT FILTER] Erreur lors de la vérification du type de requête: {}", e.getMessage());
            return false;
        }
    }
} 
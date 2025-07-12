package com.actu.backend.config;

import com.actu.backend.model.User;
import com.actu.backend.model.Category;
import com.actu.backend.repository.UserRepository;
import com.actu.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedData() {
        // Seed admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@actu.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            
            userRepository.save(adminUser);
            System.out.println("Admin user created successfully!");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
        } else {
            System.out.println("Admin user already exists!");
        }

        // Seed categories
        if (categoryRepository.count() == 0) {
            Category politique = Category.builder()
                    .name("Politique")
                    .description("Actualités politiques nationales et internationales")
                    .build();
            
            Category economie = Category.builder()
                    .name("Économie")
                    .description("Actualités économiques et financières")
                    .build();
            
            Category technologie = Category.builder()
                    .name("Technologie")
                    .description("Actualités technologiques et innovations")
                    .build();
            
            Category sport = Category.builder()
                    .name("Sport")
                    .description("Actualités sportives et résultats")
                    .build();
            
            Category culture = Category.builder()
                    .name("Culture")
                    .description("Actualités culturelles et artistiques")
                    .build();

            categoryRepository.save(politique);
            categoryRepository.save(economie);
            categoryRepository.save(technologie);
            categoryRepository.save(sport);
            categoryRepository.save(culture);
            
            System.out.println("Sample categories created successfully!");
        } else {
            System.out.println("Categories already exist!");
        }
    }
} 
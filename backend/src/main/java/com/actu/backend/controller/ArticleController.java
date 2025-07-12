package com.actu.backend.controller;

import com.actu.backend.model.Article;
import com.actu.backend.model.Category;
import com.actu.backend.repository.ArticleRepository;
import com.actu.backend.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public Page<Article> getArticles(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @GetMapping(value = "/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<Article> getArticle(@PathVariable Long id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/category/{categoryId}", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<List<Article>> getArticlesByCategory(@PathVariable Long categoryId) {
        Optional<Category> category = categoryRepository.findById(categoryId);
        return category.map(cat -> ResponseEntity.ok(articleRepository.findByCategory(cat)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/grouped-by-category", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public Map<String, List<Article>> getArticlesGroupedByCategory() {
        List<Category> categories = categoryRepository.findAll();
        Map<String, List<Article>> result = new HashMap<>();
        for (Category cat : categories) {
            result.put(cat.getName(), articleRepository.findByCategory(cat));
        }
        return result;
    }

    // CRUD (éditeur/admin)
    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @PostMapping
    public Article createArticle(@Valid @RequestBody Article article) {
        article.setCreatedAt(java.time.LocalDateTime.now());
        return articleRepository.save(article);
    }

    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @Valid @RequestBody Article article) {
        return articleRepository.findById(id)
                .map(existing -> {
                    article.setId(id);
                    article.setCreatedAt(existing.getCreatedAt());
                    return ResponseEntity.ok(articleRepository.save(article));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        if (!articleRepository.existsById(id)) return ResponseEntity.notFound().build();
        articleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 
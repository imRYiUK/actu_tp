package com.actu.backend.repository;

import com.actu.backend.model.Article;
import com.actu.backend.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Page<Article> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Article> findByCategory(Category category);
    Page<Article> findByCategory(Category category, Pageable pageable);
} 
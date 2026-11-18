package com.url.shortener.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(
    name = "url_mapping",
    indexes = {
        @Index(name = "idx_url_short_url", columnList = "shortUrl", unique = true),
        @Index(name = "idx_url_user_created", columnList = "user_id, createdDate DESC")
    }
)
public class UrlMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048)
    private String originalUrl;

    @Column(nullable = false, unique = true, length = 50)
    private String shortUrl;

    @Column(nullable = false)
    private int clickCount = 0;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "urlMapping", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClickEvent> clickEvents;
}

package com.url.shortener.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(
    name = "click_event",
    indexes = {
        @Index(name = "idx_click_mapping_date", columnList = "url_mapping_id, clickDate")
    }
)
public class ClickEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime clickDate;

    @Column(length = 30)
    private String deviceType = "Unknown";

    @Column(length = 40)
    private String os = "Unknown";

    @Column(length = 40)
    private String browser = "Unknown";

    @Column(length = 255)
    private String referer = "Direct";

    @Column(length = 45)
    private String clientIp;

    @ManyToOne
    @JoinColumn(name = "url_mapping_id", nullable = false)
    private UrlMapping urlMapping;
}

package com.url.shortener.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UrlMappingDTO {

    private String username;
    private String originalUrl;
    private String shortUrl;
    private long id;
    private int clickCount;
    private LocalDateTime createdDate;

}

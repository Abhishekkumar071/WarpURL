package com.url.shortener.repository;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent,Long> {
    List<ClickEvent> findByUrlMappingAndClickDateBetween(UrlMapping urlMapping, LocalDateTime startDate,LocalDateTime endDate);
    //there are two dates, being passed, so jpa will automatically convert this into between clause
    //what jpa will do is, filter all data by this urlMapping, between these two dates,...

    List<ClickEvent> findByUrlMappingInAndClickDateBetween(List<UrlMapping> urlMappings, LocalDateTime startDate,LocalDateTime endDate);
}

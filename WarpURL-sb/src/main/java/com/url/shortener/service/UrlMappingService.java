package com.url.shortener.service;

import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
public class UrlMappingService {

    private UrlMappingRepository urlMappingRepository;
    private ClickEventRepository clickEventRepository;

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";


    public UrlMappingDTO createShortUrl(String originalUrl, User user) {
        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());

        // First save: get DB-generated ID
        UrlMapping saved = urlMappingRepository.save(urlMapping);

        // Base62 from ID
        String shortUrl = generateShortUrl(saved.getId());
        saved.setShortUrl(shortUrl);

        // Second save: persist short code
        UrlMapping finalSaved = urlMappingRepository.save(saved);
        return convertToDto(finalSaved);
    }

    public UrlMappingDTO convertToDto(UrlMapping urlMapping){
        UrlMappingDTO urlMappingDTO=new UrlMappingDTO();
        urlMappingDTO.setId(urlMapping.getId());
        urlMappingDTO.setUsername(urlMapping.getUser().getUsername());
        urlMappingDTO.setCreatedDate(urlMapping.getCreatedDate());
        urlMappingDTO.setOriginalUrl(urlMapping.getOriginalUrl());
        urlMappingDTO.setShortUrl(urlMapping.getShortUrl());
        urlMappingDTO.setClickCount(urlMapping.getClickCount());
        return urlMappingDTO;
    }

    private String generateShortUrl(Long id) {
        if (id == null || id < 0) {
            throw new IllegalArgumentException("ID must be non-null and non-negative");
        }
        if (id == 0) return "0";

        StringBuilder sb = new StringBuilder();
        long value = id;
        while (value > 0) {
            int rem = (int) (value % 62);
            sb.append(BASE62.charAt(rem));
            value /= 62;
        }
        return sb.reverse().toString();
    }

    public List<UrlMappingDTO> getUrlsByUser(User user){
        return urlMappingRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<ClickEventDTO> getClickEventsByDate(String shortUrl,LocalDateTime start,LocalDateTime end){
        UrlMapping urlMapping=urlMappingRepository.findByShortUrl(shortUrl);
        if(urlMapping!=null){
            return clickEventRepository.findByUrlMappingAndClickDateBetween(urlMapping,start,end)
                    .stream().collect(Collectors.groupingBy(click->click.getClickDate().toLocalDate(),Collectors.counting()))
                    .entrySet().stream().map(
                            entry->{
                                ClickEventDTO clickEventDTO=new ClickEventDTO();
                                clickEventDTO.setClickDate(entry.getKey());
                                clickEventDTO.setCount(entry.getValue());
                                return clickEventDTO;
                            }
                    ).collect(Collectors.toList());
        }
        return null;
    }
    public Map<LocalDate,Long> getTotalClicksByUserAndDate(User user, LocalDate startDate, LocalDate endDate){
        List<UrlMapping> urlMappings=urlMappingRepository.findByUser(user);
        List<ClickEvent> clickEvents=clickEventRepository.findByUrlMappingInAndClickDateBetween(urlMappings,startDate.atStartOfDay(),endDate.plusDays(1).atStartOfDay());
        return clickEvents.stream().collect(Collectors.
                groupingBy(click->click.getClickDate().toLocalDate(),Collectors.counting()));
    }

    public UrlMapping getOriginalUrl(String shortUrl) {
        UrlMapping urlMapping=urlMappingRepository.findByShortUrl(shortUrl);
        if(urlMapping!=null){
            urlMapping.setClickCount(urlMapping.getClickCount()+1);
            urlMappingRepository.save(urlMapping);
            //click event
            ClickEvent clickEvent=new ClickEvent();
            clickEvent.setClickDate(LocalDateTime.now());
            clickEvent.setUrlMapping(urlMapping);
            clickEventRepository.save(clickEvent);
        }
        return urlMapping;
    }
}

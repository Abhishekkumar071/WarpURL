package com.url.shortener.service;

import com.url.shortener.dtos.LoginRequest;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.repository.UserRepository;
import com.url.shortener.security.jwt.JwtAuthenticationResponse;
import com.url.shortener.security.jwt.JwtUtils;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@AllArgsConstructor
public class UserService {
    private PasswordEncoder passwordEncoder;
    private UserRepository userRepository;
    private AuthenticationManager authenticationManager;
    private JwtUtils jwtUtils;
    private UrlMappingRepository urlMappingRepository;
    private ClickEventRepository clickEventRepository;

    public User registerUser(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest){
        Authentication authentication=authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails=(UserDetailsImpl) authentication.getPrincipal();
        String jwt=jwtUtils.generateToken(userDetails);
        return new JwtAuthenticationResponse(jwt);
    }

    public User findByUsername(String name){
        return userRepository.findByUsername(name).orElseThrow(
                ()->new UsernameNotFoundException("User not found with username: "+name)
        );
    }

    @Transactional
    public JwtAuthenticationResponse loginAsDemoUser() {
        final String demoUsername = "demo_user";
        User demoUser = userRepository.findByUsername(demoUsername).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(demoUsername);
            newUser.setEmail("demo@warpurl.com");
            newUser.setPassword(passwordEncoder.encode("DemoUserPass@123!"));
            newUser.setRole("ROLE_USER");
            return userRepository.save(newUser);
        });

        // Seed demo links & analytics if none exist for demo user
        List<UrlMapping> existing = urlMappingRepository.findByUser(demoUser);
        if (existing.isEmpty()) {
            seedDemoData(demoUser);
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(demoUser);
        String jwt = jwtUtils.generateToken(userDetails);
        return new JwtAuthenticationResponse(jwt);
    }

    private void seedDemoData(User demoUser) {
        String[][] demoLinks = {
            {"https://github.com/Abhishekkumar071/WarpURL", "warp-gh"},
            {"https://spring.io/projects/spring-boot", "spring-boot"},
            {"https://react.dev", "react-docs"},
            {"https://hub.docker.com", "docker-hub"}
        };

        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        for (String[] link : demoLinks) {
            String originalUrl = link[0];
            String shortCode = link[1];

            if (urlMappingRepository.existsByShortUrl(shortCode)) {
                shortCode = shortCode + "-" + (random.nextInt(900) + 100);
            }

            UrlMapping mapping = new UrlMapping();
            mapping.setOriginalUrl(originalUrl);
            mapping.setShortUrl(shortCode);
            mapping.setUser(demoUser);
            mapping.setCreatedDate(now.minusDays(7));

            UrlMapping savedMapping = urlMappingRepository.save(mapping);

            int totalClicks = 0;
            // Seed click events across the last 7 days
            for (int dayOffset = 6; dayOffset >= 0; dayOffset--) {
                int dailyClicks = random.nextInt(15) + 6; // 6 to 20 clicks
                for (int c = 0; c < dailyClicks; c++) {
                    ClickEvent click = new ClickEvent();
                    click.setUrlMapping(savedMapping);
                    LocalDateTime clickTime = now.minusDays(dayOffset)
                            .withHour(random.nextInt(24))
                            .withMinute(random.nextInt(60))
                            .withSecond(random.nextInt(60));
                    click.setClickDate(clickTime);
                    clickEventRepository.save(click);
                    totalClicks++;
                }
            }

            savedMapping.setClickCount(totalClicks);
            urlMappingRepository.save(savedMapping);
        }
    }
}

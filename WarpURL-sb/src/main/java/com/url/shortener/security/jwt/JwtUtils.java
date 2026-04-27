package com.url.shortener.security.jwt;

import com.url.shortener.service.UserDetailsImpl;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;
    //these are coming from, application.properties
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    public String getJwtFromHeader(HttpServletRequest request){
        String bearerToken=request.getHeader("Authorization");
        if(bearerToken!=null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }

    public String generateToken(UserDetailsImpl userDetails){
                                //why this type of object is needed, so that we can have the roles etc of the user
        String username=userDetails.getUsername();
        String roles=userDetails.getAuthorities().stream()
                .map(authority->authority.getAuthority())
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(username)
                .claim("roles",roles).issuedAt(new Date())
                .expiration(new Date((new Date().getTime()+jwtExpirationMs)))
                .signWith(key()).compact();//this is value of miliseconds for 2 days
    }

    public String getUserNameFromJwtToken(String token){
        return Jwts.parser().verifyWith((SecretKey) key())
                .build().parseSignedClaims(token)
                .getPayload().getSubject();
    }

//    private Key key(){
//        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
//    }
    private Key key(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String authToken){
        try{
            Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
            //if this line succeeds, that means token is valid, otherwise, it will not come down
            return true;
        } catch (JwtException e) {
            return false;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e);
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}

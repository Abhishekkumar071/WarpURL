package com.url.shortener.service;

import com.url.shortener.models.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@NoArgsConstructor
public class UserDetailsImpl implements UserDetails {//this is from Spring security

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String password;
    private String email;


    public Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String password, String email, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user){
        GrantedAuthority grantedAuthority=new SimpleGrantedAuthority(user.getRole());
        return new UserDetailsImpl(user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                Collections.singletonList(grantedAuthority));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

}

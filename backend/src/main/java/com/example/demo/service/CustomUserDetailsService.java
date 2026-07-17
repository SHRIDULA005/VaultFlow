package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService {
    

package com.example.App.security;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
 
import com.example.App.Entity.User;
import com.example.App.Repository.UserRepo;
 
@Service
public class CustomUserDetailsService implements UserDetailsService {
 
    @Autowired
    private UserRepo repo;
 
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
 
        User user = repo.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User Not Found"));
 
        return new CustomUserDetails(user);
 
    }
 
}
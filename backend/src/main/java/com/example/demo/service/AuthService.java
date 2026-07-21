package com.example.demo.service;

import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.security.JwtUtil;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtService;
    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        ));
        // SecurityContextHolder.getContext().setAuthentication(authentication);
        // HttpSession session = httpRequest.getSession(true);
        // System.out.println("Session ID: " + session.getId());
        // session.setAttribute(
        //         HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
        //         SecurityContextHolder.getContext()
        // );
        UserDetails us=(UserDetails)authentication.getPrincipal();
        return jwtService.generateToken(us);
        // return "Login Successful";
    }
}


// package com.example.demo.service;

// import org.springframework.stereotype.Service;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpSession;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
// import org.springframework.stereotype.Service;

// import com.example.demo.dto.LoginRequest;
// import com.example.demo.security.JwtUtil;

// @Service
// public class AuthService {
//     @Autowired
//     private AuthenticationManager authenticationManager;

//     @Autowired
//     private JwtUtil jwtService;
//     public String login(LoginRequest request) {
//         Authentication authentication = authenticationManager.authenticate(
//                         new UsernamePasswordAuthenticationToken(
//                                 request.getEmail(),
//                                 request.getPassword()
//                         ));
//         // SecurityContextHolder.getContext().setAuthentication(authentication);
//         // HttpSession session = httpRequest.getSession(true);
//         // System.out.println("Session ID: " + session.getId());
//         // session.setAttribute(
//         //         HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
//         //         SecurityContextHolder.getContext()
//         // );
//         UserDetails us=(UserDetails)authentication.getPrincipal();
//         return jwtService.generateToken(us);
//         // return "Login Successful";
//     }
// }

// package com.example.demo.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.stereotype.Service;

// import com.example.demo.dto.LoginRequest;
// import com.example.demo.security.JwtUtil;

// @Service
// public class AuthService {

//     @Autowired
//     private AuthenticationManager authenticationManager;

//     @Autowired
//     private JwtUtil jwtUtil;

//     public String login(LoginRequest request) {

//         try {

//             System.out.println("========== LOGIN REQUEST ==========");
//             System.out.println("Email: " + request.getEmail());

//             Authentication authentication = authenticationManager.authenticate(
//                     new UsernamePasswordAuthenticationToken(
//                             request.getEmail(),
//                             request.getPassword()));

//             System.out.println("Authentication Successful");

//             UserDetails userDetails = (UserDetails) authentication.getPrincipal();

//             System.out.println("Authenticated User: " + userDetails.getUsername());

//             String token = jwtUtil.generateToken(userDetails);

//             System.out.println("JWT Generated Successfully");
//             System.out.println("===================================");

//             return token;

//         } catch (Exception e) {

//             System.out.println("========== LOGIN FAILED ==========");
//             System.out.println("Exception Type : " + e.getClass().getSimpleName());
//             System.out.println("Exception Msg  : " + e.getMessage());
//             e.printStackTrace();
//             System.out.println("==================================");

//             throw e;
//         }
//     }
// }
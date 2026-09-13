// package com.example.demo.controller;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
 

// import com.example.demo.dto.LoginResponse;
// import com.example.demo.dto.LoginRequest;
// import com.example.demo.service.AuthService;

// import jakarta.servlet.http.HttpServletRequest;

// @RestController
// @RequestMapping("/auth")
// public class AuthController {
//     @Autowired
//      AuthService authService;
//     // @PostMapping("/login")
//     // public ResponseEntity<String> login(@RequestBody LoginRequest request,HttpServletRequest req){
//     //     return ResponseEntity.ok(authService.login(request,req));
//     // }
//     @PostMapping("/login")
//     public String login(@RequestBody LoginRequest request) {
//         return authService.login(request);
//         // return ResponseEntity.ok(new LoginResponse(token));
//     }

    
// }

package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    @Autowired
    AuthService authService;

    @Autowired
    UserService userService;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }


    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody User user) {

        return ResponseEntity.ok(
                userService.registerUser(user)
        );
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout() {

        return ResponseEntity.ok(
                "Logout successful"
        );
    }
}
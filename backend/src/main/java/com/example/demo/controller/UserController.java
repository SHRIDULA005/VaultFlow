package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Register User
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

        return ResponseEntity.ok(userService.registerUser(user));
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {

        Optional<User> user = userService.getUserById(id);

        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {

        Optional<User> user = userService.getUserByEmail(email);

        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        return ResponseEntity.ok(userService.deleteUser(id));
    }
}
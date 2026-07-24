package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register User
    public User registerUser(User user) {

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by id
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Update user
    public User updateUser(Long id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null
                && !updatedUser.getPassword().isEmpty()) {

            existingUser.setPassword(
                    passwordEncoder.encode(updatedUser.getPassword()));
        }

        existingUser.setRole(updatedUser.getRole());
        existingUser.setUserId(updatedUser.getUserId());
        existingUser.setOrganizationId(updatedUser.getOrganizationId());

        return userRepository.save(existingUser);
    }

    // Delete user
    public String deleteUser(Long id) {

        userRepository.deleteById(id);

        return "User deleted successfully";
    }
}
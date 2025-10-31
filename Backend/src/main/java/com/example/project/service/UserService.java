package com.example.project.service;

import com.example.project.dto.UserDtos;
import com.example.project.model.Role;
import com.example.project.model.User;
import com.example.project.repository.RoleRepository;
import com.example.project.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDtos.UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserDtos.UserResponse getById(Long id) {
        return userRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public UserDtos.UserResponse updateProfile(Long id, UserDtos.UpdateProfileRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public UserDtos.UserResponse setRoles(Long id, Set<String> roleNames) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        String requested = roleNames == null || roleNames.isEmpty() ? "ROLE_STUDENT" : (roleNames.iterator().next().startsWith("ROLE_") ? roleNames.iterator().next() : "ROLE_" + roleNames.iterator().next().toUpperCase());
        Role role = roleRepository.findByName(requested).orElseGet(() -> roleRepository.save(Role.builder().name(requested).build()));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    private UserDtos.UserResponse toResponse(User user) {
        UserDtos.UserResponse resp = new UserDtos.UserResponse();
        resp.setId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setRole(user.getRole() != null ? user.getRole().getName() : null);
        return resp;
    }
}



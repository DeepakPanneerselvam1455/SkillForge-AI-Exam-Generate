package com.example.project.service;

import com.example.project.dto.auth.AuthDtos;
import com.example.project.model.Role;
import com.example.project.model.User;
import com.example.project.repository.RoleRepository;
import com.example.project.repository.UserRepository;
import com.example.project.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String username = auth.getName();
        Map<String, Object> claims = new HashMap<>();
        userRepository.findByUsername(username).ifPresent(u -> {
            claims.put("role", u.getRole().getName());
        });
        String accessToken = jwtService.generateToken(username, claims);
        String refreshToken = jwtService.generateRefreshToken(username, claims);
        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        return response;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String reqRole = (request.getRoles() == null || request.getRoles().isEmpty()) ? "STUDENT" : request.getRoles().iterator().next();
        String dbName = (reqRole.startsWith("ROLE_") ? reqRole : "ROLE_" + reqRole.toUpperCase());
        Role role = roleRepository.findByName(dbName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(dbName).build()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role.getName());
        String accessToken = jwtService.generateToken(user.getUsername(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getUsername(), claims);
        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        return response;
    }

    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request) {
        String username = jwtService.extractUsername(request.getRefreshToken());
        userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        Map<String, Object> claims = new HashMap<>();
        userRepository.findByUsername(username).ifPresent(u -> {
            claims.put("role", u.getRole().getName());
        });
        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse();
        response.setAccessToken(jwtService.generateToken(username, claims));
        response.setRefreshToken(request.getRefreshToken());
        return response;
    }
}



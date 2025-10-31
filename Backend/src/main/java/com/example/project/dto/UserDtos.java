package com.example.project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

public class UserDtos {

    @Data
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
    }

    @Data
    public static class UpdateProfileRequest {
        @NotBlank
        private String fullName;

        @Email
        @NotBlank
        private String email;
    }
}



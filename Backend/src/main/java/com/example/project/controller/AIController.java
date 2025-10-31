package com.example.project.controller;

import com.example.project.model.AIRequest;
import com.example.project.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('STUDENT','INSTRUCTOR','ADMIN')")
    public ResponseEntity<AIRequest> analyze(@RequestBody Map<String, String> body, Authentication auth) {
        String prompt = body.getOrDefault("prompt", "");
        if (prompt.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(aiService.analyze(auth.getName(), prompt));
    }
}



package com.example.project.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ai_requests")
public class AIRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "input_text", columnDefinition = "TEXT")
    private String inputText;

    @Column(name = "ai_response", columnDefinition = "TEXT")
    private String aiResponse;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();
}



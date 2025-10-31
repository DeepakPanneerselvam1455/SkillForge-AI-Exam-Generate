package com.example.project.repository;

import com.example.project.model.AIRequest;
import com.example.project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIRequestRepository extends JpaRepository<AIRequest, Long> {
    List<AIRequest> findByUser(User user);
}



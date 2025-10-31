package com.example.project.controller;

import com.example.project.model.Enrollment;
import com.example.project.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Enrollment> enroll(@RequestBody Map<String, Object> body, Authentication auth) {
        Long courseId = ((Number) body.get("courseId")).longValue();
        return ResponseEntity.ok(enrollmentService.enroll(auth.getName(), courseId));
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Enrollment>> myEnrollments(Authentication auth) {
        return ResponseEntity.ok(enrollmentService.listForStudent(auth.getName()));
    }

    @PutMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Enrollment> updateProgress(@RequestBody Map<String, Object> body, Authentication auth) {
        Long courseId = ((Number) body.get("courseId")).longValue();
        BigDecimal progress = new BigDecimal(body.get("progress").toString());
        return ResponseEntity.ok(enrollmentService.updateProgress(auth.getName(), courseId, progress));
    }
}



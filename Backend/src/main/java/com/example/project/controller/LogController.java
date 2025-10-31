package com.example.project.controller;

import com.example.project.model.ActivityLog;
import com.example.project.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final ActivityLogService activityLogService;

    public LogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLog>> list() {
        return ResponseEntity.ok(activityLogService.listAll());
    }
}



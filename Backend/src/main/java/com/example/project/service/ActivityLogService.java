package com.example.project.service;

import com.example.project.model.ActivityLog;
import com.example.project.model.User;
import com.example.project.repository.ActivityLogRepository;
import com.example.project.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public void log(String username, String action) {
        User user = userRepository.findByUsername(username).orElseThrow();
        activityLogRepository.save(ActivityLog.builder().user(user).action(action).build());
    }

    public List<ActivityLog> listAll() {
        return activityLogRepository.findAll();
    }
}



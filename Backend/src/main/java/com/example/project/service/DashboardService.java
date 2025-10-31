package com.example.project.service;

import com.example.project.model.Course;
import com.example.project.model.Enrollment;
import com.example.project.model.User;
import com.example.project.repository.CourseRepository;
import com.example.project.repository.EnrollmentRepository;
import com.example.project.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DashboardService(UserRepository userRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public Map<String, Object> studentDashboard(String username) {
        User student = userRepository.findByUsername(username).orElseThrow();
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        Map<String, Object> data = new HashMap<>();
        data.put("enrollments", enrollments.stream().map(e -> Map.of(
                "courseId", e.getCourse().getId(),
                "courseTitle", e.getCourse().getTitle(),
                "progress", e.getProgress()
        )).collect(Collectors.toList()));
        data.put("aiRecommendations", List.of("Complete Module 2 of Java Basics", "Try quiz on OOP"));
        return data;
    }

    public Map<String, Object> instructorDashboard(String username) {
        User instructor = userRepository.findByUsername(username).orElseThrow();
        List<Course> courses = courseRepository.findByInstructor(instructor);
        Map<String, Object> data = new HashMap<>();
        data.put("courses", courses.stream().map(c -> Map.of(
                "id", c.getId(),
                "title", c.getTitle()
        )).collect(Collectors.toList()));
        data.put("analytics", Map.of("totalCourses", courses.size()));
        return data;
    }

    public Map<String, Object> adminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("systemOverview", Map.of("users", userRepository.count(), "courses", courseRepository.count()));
        data.put("accessControl", List.of("Manage Roles", "Audit Logs"));
        return data;
    }
}



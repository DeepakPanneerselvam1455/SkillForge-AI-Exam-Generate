package com.example.project.service;

import com.example.project.model.Course;
import com.example.project.model.User;
import com.example.project.repository.CourseRepository;
import com.example.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public List<Course> listAll(String q) {
        if (q == null || q.isBlank()) return courseRepository.findAll();
        return courseRepository.findByTitleContainingIgnoreCase(q);
    }

    public Course getById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    @Transactional
    public Course createCourse(String title, String description, String instructorUsername) {
        User instructor = userRepository.findByUsername(instructorUsername)
                .orElseThrow(() -> new IllegalArgumentException("Instructor not found"));
        Course c = Course.builder().title(title).description(description).instructor(instructor).build();
        return courseRepository.save(c);
    }

    @Transactional
    public Course updateCourse(Long id, String title, String description) {
        Course c = getById(id);
        c.setTitle(title);
        c.setDescription(description);
        return courseRepository.save(c);
    }

    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}



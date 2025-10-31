package com.example.project.repository;

import com.example.project.model.Course;
import com.example.project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructor(User instructor);
    List<Course> findByTitleContainingIgnoreCase(String q);
}



package com.example.project.service;

import com.example.project.model.Course;
import com.example.project.model.Enrollment;
import com.example.project.model.User;
import com.example.project.repository.CourseRepository;
import com.example.project.repository.EnrollmentRepository;
import com.example.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Enrollment enroll(String studentUsername, Long courseId) {
        User student = userRepository.findByUsername(studentUsername).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        return enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseGet(() -> enrollmentRepository.save(Enrollment.builder().student(student).course(course).progress(BigDecimal.ZERO).build()));
    }

    public List<Enrollment> listForStudent(String studentUsername) {
        User student = userRepository.findByUsername(studentUsername).orElseThrow();
        return enrollmentRepository.findByStudent(student);
    }

    @Transactional
    public Enrollment updateProgress(String studentUsername, Long courseId, BigDecimal progress) {
        User student = userRepository.findByUsername(studentUsername).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new IllegalArgumentException("Not enrolled"));
        enrollment.setProgress(progress);
        return enrollmentRepository.save(enrollment);
    }
}



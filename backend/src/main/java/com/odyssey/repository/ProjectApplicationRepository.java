package com.odyssey.repository;

import com.odyssey.entity.ProjectApplication;
import com.odyssey.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {
    List<ProjectApplication> findByStudent(StudentProfile student);
    List<ProjectApplication> findByProjectId(Long projectId);
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
    Optional<ProjectApplication> findByProjectIdAndStudentId(Long projectId, Long studentId);
}

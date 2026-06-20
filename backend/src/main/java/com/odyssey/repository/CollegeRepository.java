package com.odyssey.repository;

import com.odyssey.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByUserId(Long userId);
    Optional<College> findByCollegeCode(String collegeCode);
    boolean existsByCollegeCode(String collegeCode);
}

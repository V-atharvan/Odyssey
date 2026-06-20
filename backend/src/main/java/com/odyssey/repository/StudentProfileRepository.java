package com.odyssey.repository;

import com.odyssey.entity.StudentProfile;
import com.odyssey.entity.StudentProfile.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    List<StudentProfile> findByCollegeId(Long collegeId);
    List<StudentProfile> findByCollegeIdAndVerificationStatus(Long collegeId, VerificationStatus status);
    Page<StudentProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    @Query("SELECT s FROM StudentProfile s WHERE s.skills LIKE %:skill%")
    List<StudentProfile> findBySkillsContaining(@Param("skill") String skill);
}

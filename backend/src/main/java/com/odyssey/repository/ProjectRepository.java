package com.odyssey.repository;

import com.odyssey.entity.Project;
import com.odyssey.entity.Project.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCompanyId(Long companyId);
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    List<Project> findByStatus(ProjectStatus status);

    @Query(value = "SELECT * FROM projects p WHERE p.status = 'OPEN' AND " +
           "(EXISTS (SELECT 1 FROM project_skills ps WHERE ps.project_id = p.id AND LOWER(ps.skill) LIKE LOWER(CONCAT('%', :skill, '%'))))", nativeQuery = true)
    Page<Project> findOpenProjectsBySkill(@Param("skill") String skill, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.status = 'OPEN' AND " +
           "(:level IS NULL OR p.experienceLevelRequired = :level)")
    Page<Project> findOpenProjectsByLevel(@Param("level") String level, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.company.id = :companyId AND p.status = :status")
    long countByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE p.status = 'OPEN' AND " +
           "p.company.id IN (SELECT ccp.company.id FROM CompanyCollegePartnership ccp " +
           "WHERE ccp.college.id = :collegeId AND ccp.status = 'ACCEPTED')")
    Page<Project> findByCollegePartnership(@Param("collegeId") Long collegeId, Pageable pageable);
}

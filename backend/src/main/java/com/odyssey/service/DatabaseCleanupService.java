package com.odyssey.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseCleanupService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void deleteCompanyAndUser(Long userId) {
        // Find company by user_id
        Number companyIdOpt = (Number) entityManager.createNativeQuery("SELECT id FROM companies WHERE user_id = :userId")
                .setParameter("userId", userId).getResultList().stream().findFirst().orElse(null);

        if (companyIdOpt != null) {
            Long companyId = companyIdOpt.longValue();
            entityManager.createNativeQuery("DELETE FROM project_applications WHERE project_id IN (SELECT id FROM projects WHERE company_id = :companyId)")
                    .setParameter("companyId", companyId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM reviews WHERE project_id IN (SELECT id FROM projects WHERE company_id = :companyId)")
                    .setParameter("companyId", companyId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM projects WHERE company_id = :companyId")
                    .setParameter("companyId", companyId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM company_college_partnerships WHERE company_id = :companyId")
                    .setParameter("companyId", companyId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM companies WHERE id = :companyId")
                    .setParameter("companyId", companyId).executeUpdate();
        }

        cleanupUserRecords(userId);
        log.info("Platform Admin: Completely purged company user ID: {}", userId);
    }

    @Transactional
    public void deleteCollegeAndUser(Long userId) {
        Number collegeIdOpt = (Number) entityManager.createNativeQuery("SELECT id FROM colleges WHERE user_id = :userId")
                .setParameter("userId", userId).getResultList().stream().findFirst().orElse(null);

        if (collegeIdOpt != null) {
            Long collegeId = collegeIdOpt.longValue();
            entityManager.createNativeQuery("UPDATE student_profiles SET college_id = NULL WHERE college_id = :collegeId")
                    .setParameter("collegeId", collegeId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM company_college_partnerships WHERE college_id = :collegeId")
                    .setParameter("collegeId", collegeId).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM colleges WHERE id = :collegeId")
                    .setParameter("collegeId", collegeId).executeUpdate();
        }

        cleanupUserRecords(userId);
        log.info("Platform Admin: Completely purged college user ID: {}", userId);
    }

    @Transactional
    public void deleteStudentAccount(Long studentProfileId) {
        Number userIdOpt = (Number) entityManager.createNativeQuery("SELECT user_id FROM student_profiles WHERE id = :studentId")
                .setParameter("studentId", studentProfileId).getResultList().stream().findFirst().orElse(null);

        entityManager.createNativeQuery("DELETE FROM project_applications WHERE student_id = :studentId")
                .setParameter("studentId", studentProfileId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reviews WHERE student_id = :studentId")
                .setParameter("studentId", studentProfileId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM portfolio_projects WHERE student_id = :studentId")
                .setParameter("studentId", studentProfileId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM achievements WHERE student_id = :studentId")
                .setParameter("studentId", studentProfileId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM student_profiles WHERE id = :studentId")
                .setParameter("studentId", studentProfileId).executeUpdate();

        if (userIdOpt != null) {
            cleanupUserRecords(userIdOpt.longValue());
        }
        
        log.info("College Admin: Completely purged student profile ID: {}", studentProfileId);
    }

    @Transactional
    public void removeStudentFromProject(Long projectId, Long applicationId) {
        // We delete by application ID for exact target
        entityManager.createNativeQuery("DELETE FROM project_applications WHERE id = :applicationId AND project_id = :projectId")
                .setParameter("applicationId", applicationId)
                .setParameter("projectId", projectId)
                .executeUpdate();
        log.info("Company Admin: Removed student application {} from project {}", applicationId, projectId);
    }

    private void cleanupUserRecords(Long userId) {
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM oauth_accounts WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM otps WHERE REPLACE(email, ' ', '') = (SELECT REPLACE(email, ' ', '') FROM users WHERE id = :userId)").setParameter("userId", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM users WHERE id = :userId").setParameter("userId", userId).executeUpdate();
    }

    @Transactional
    public void purgeAll() {
        entityManager.createNativeQuery("TRUNCATE TABLE users CASCADE").executeUpdate();
        log.warn("Platform Admin: ALL USERS AND CASCADING DATA HAVE BEEN PURGED!");
    }
}

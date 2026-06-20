package com.odyssey.repository;

import com.odyssey.entity.CompanyCollegePartnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyCollegePartnershipRepository extends JpaRepository<CompanyCollegePartnership, Long> {
    
    List<CompanyCollegePartnership> findByCollegeIdAndStatus(Long collegeId, CompanyCollegePartnership.PartnershipStatus status);
    
    List<CompanyCollegePartnership> findByCompanyId(Long companyId);
    
    List<CompanyCollegePartnership> findByCollegeId(Long collegeId);

    Optional<CompanyCollegePartnership> findByCompanyIdAndCollegeId(Long companyId, Long collegeId);
    
    boolean existsByCompanyIdAndCollegeId(Long companyId, Long collegeId);
}

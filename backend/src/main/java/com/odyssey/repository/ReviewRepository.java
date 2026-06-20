package com.odyssey.repository;

import com.odyssey.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByStudentId(Long studentId);
    List<Review> findByCompanyId(Long companyId);

    @Query("SELECT r FROM Review r WHERE r.student.user.email = :email")
    List<Review> findByStudentEmail(@Param("email") String email);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.student.id = :studentId")
    Double findAverageRatingByStudentId(@Param("studentId") Long studentId);
}

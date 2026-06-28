package com.odyssey.controller;

import com.odyssey.dto.response.ApiResponse;
import com.odyssey.dto.response.UserResponse;
import com.odyssey.entity.ProjectApplication;
import com.odyssey.entity.StudentProfile;
import com.odyssey.entity.User;
import com.odyssey.repository.ProjectApplicationRepository;
import com.odyssey.repository.StudentProfileRepository;
import com.odyssey.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProjectApplicationRepository projectApplicationRepository;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }

        // Find the current logged-in user
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);
        if (currentUser == null) {
            return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
        }

        // Find all matching users by name or email
        List<User> matchedUsers = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);

        // Filter and map to UserResponse
        List<UserResponse> responses = new ArrayList<>();

        // If the current user is a STUDENT, find their project IDs where application status is ACCEPTED
        Set<Long> studentProjectIds = null;
        if (currentUser.getRole() == User.Role.STUDENT) {
            StudentProfile currentProfile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (currentProfile != null) {
                studentProjectIds = projectApplicationRepository.findByStudent(currentProfile).stream()
                        .filter(app -> app.getStatus() == ProjectApplication.ApplicationStatus.ACCEPTED)
                        .map(app -> app.getProject().getId())
                        .collect(Collectors.toSet());
            } else {
                studentProjectIds = Set.of();
            }
        }

        for (User matchedUser : matchedUsers) {
            // Skip self
            if (matchedUser.getId().equals(currentUser.getId())) {
                continue;
            }

            // Enforce student rules: a STUDENT can only chat with:
            // 1. COMPANY
            // 2. COLLEGE_ADMIN
            // 3. STUDENT (if and only if they work on the same project)
            if (currentUser.getRole() == User.Role.STUDENT && matchedUser.getRole() == User.Role.STUDENT) {
                StudentProfile matchedProfile = studentProfileRepository.findByUserId(matchedUser.getId()).orElse(null);
                if (matchedProfile == null) {
                    continue; // Skip if no student profile
                }
                
                // Get accepted project IDs for matched student
                Set<Long> matchedProjectIds = projectApplicationRepository.findByStudent(matchedProfile).stream()
                        .filter(app -> app.getStatus() == ProjectApplication.ApplicationStatus.ACCEPTED)
                        .map(app -> app.getProject().getId())
                        .collect(Collectors.toSet());

                // Find intersection of project IDs
                boolean worksOnSameProject = false;
                if (studentProjectIds != null) {
                    worksOnSameProject = matchedProjectIds.stream().anyMatch(studentProjectIds::contains);
                }
                if (!worksOnSameProject) {
                    continue; // Skip this student if they aren't on the same project
                }
            }

            // Build user response
            UserResponse.UserResponseBuilder builder = UserResponse.builder()
                    .id(matchedUser.getId())
                    .email(matchedUser.getEmail())
                    .fullName(matchedUser.getFullName())
                    .role(matchedUser.getRole().name())
                    .status(matchedUser.getStatus().name())
                    .active(matchedUser.isActive());

            responses.add(builder.build());
        }

        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

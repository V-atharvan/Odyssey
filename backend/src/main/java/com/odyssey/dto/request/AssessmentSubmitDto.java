package com.odyssey.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmitDto {
    private Long assessmentId;
    private List<Integer> answers; // Indexes of options selected for each question
}

package com.odyssey.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultDto {
    private boolean passed;
    private double scorePercent;
    private int correctCount;
    private int totalQuestions;
    private double performanceScoreUpdated;
    private String feedbackMessage;
}

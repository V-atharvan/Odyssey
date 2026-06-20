package com.odyssey.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentDto {
    private Long id;
    private String title;
    private String subject;
    private int questionCount;
    private int durationMinutes;
    private List<QuestionDto> questions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuestionDto {
        private int id;
        private String text;
        private List<String> options;
    }
}

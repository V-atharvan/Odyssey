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
public class BulkImportResponse {
    private int totalProcessed;
    private int successCount;
    private int failureCount;
    private List<RowError> errors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RowError {
        private int rowNumber;
        private String email;
        private String errorMessage;
    }
}

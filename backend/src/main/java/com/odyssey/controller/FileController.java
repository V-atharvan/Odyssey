package com.odyssey.controller;

import com.odyssey.dto.response.ApiResponse;
import com.odyssey.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload/{type}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY', 'COLLEGE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @PathVariable String type,
            @RequestParam("file") MultipartFile file
    ) {
        String url = fileStorageService.storeFile(file, type);
        return ResponseEntity.ok(new ApiResponse<>(true, "File uploaded successfully", Map.of("url", url)));
    }

    /**
     * Serves local files. This would be replaced by S3/Cloudfront in production.
     */
    @GetMapping("/{type}/**")
    public ResponseEntity<Resource> serveFile(@PathVariable String type, jakarta.servlet.http.HttpServletRequest request) throws IOException {
        String fullPath = request.getRequestURI();
        String prefix = "/api/files/";
        int index = fullPath.indexOf(prefix);
        if (index == -1) {
            return ResponseEntity.notFound().build();
        }
        String remainingPath = fullPath.substring(index + prefix.length());
        
        int firstSlash = remainingPath.indexOf('/');
        if (firstSlash == -1) {
            throw new IllegalArgumentException("Invalid file path format");
        }
        String actualType = remainingPath.substring(0, firstSlash);
        String fileName = remainingPath.substring(firstSlash + 1);

        byte[] content = fileStorageService.loadFile(actualType, fileName);
        String contentType = "application/octet-stream";
        if (fileName.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
        else if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";

        String simpleName = fileName.contains("/") ? fileName.substring(fileName.lastIndexOf("/") + 1) : fileName;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + simpleName + "\"")
                .body(new ByteArrayResource(content));
    }
}

package com.odyssey.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;
    private boolean useS3 = false;

    @Value("${app.file-upload.base-url:http://localhost:8080/api/files}")
    private String baseUrl;

    public FileStorageService(S3Client s3Client, 
                             @Value("${aws.s3.bucket-name}") String bucketName,
                             @Value("${aws.region}") String region) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.region = region;
    }

    @PostConstruct
    public void init() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            useS3 = true;
            log.info("AWS S3 storage initialized successfully using bucket: {}", bucketName);
        } catch (Exception e) {
            useS3 = false;
            log.warn("AWS S3 connection failed: {}. Falling back to local disk storage.", e.getMessage());
            // Ensure local storage directories exist
            try {
                java.nio.file.Files.createDirectories(java.nio.file.Paths.get("uploads/logos"));
                java.nio.file.Files.createDirectories(java.nio.file.Paths.get("uploads/avatars"));
                java.nio.file.Files.createDirectories(java.nio.file.Paths.get("uploads/resumes"));
            } catch (IOException ioException) {
                log.error("Failed to create local upload directories: {}", ioException.getMessage());
            }
        }
    }

    public String storeFile(MultipartFile file, String subDir) {
        // 1. Sanitize subDir to prevent path traversal
        String sanitizedSubDir = subDir.replaceAll("[^a-zA-Z0-9/]", "").replace("..", "");
        
        // 2. Validate file existence and emptiness
        if (file == null || file.isEmpty()) {
            throw new com.odyssey.exception.BadRequestException("Uploaded file cannot be empty");
        }

        // 3. Extract and validate extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new com.odyssey.exception.BadRequestException("Invalid file name (missing extension)");
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        
        if (!extension.matches("^(pdf|png|jpg|jpeg)$")) {
            throw new com.odyssey.exception.BadRequestException("Only .pdf, .png, .jpg, and .jpeg files are allowed");
        }

        // 4. Validate MIME type (Content-Type)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
                                    !contentType.equals("image/png") && 
                                    !contentType.equals("image/jpeg") &&
                                    !contentType.equals("image/pjpeg"))) {
            throw new com.odyssey.exception.BadRequestException("Invalid file type: " + contentType);
        }

        // 5. Enforce size limits dynamically based on category
        long size = file.getSize();
        if (extension.equals("pdf")) {
            if (size > 10 * 1024 * 1024) { // 10MB
                throw new com.odyssey.exception.BadRequestException("Document files cannot exceed 10MB");
            }
        } else {
            if (size > 5 * 1024 * 1024) { // 5MB
                throw new com.odyssey.exception.BadRequestException("Image files cannot exceed 5MB");
            }
        }

        // 6. Generate secure UUID filename
        String fileName = UUID.randomUUID().toString() + "." + extension;
        String key = sanitizedSubDir + "/" + fileName;

        if (useS3) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(contentType)
                        .build();

                s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                log.info("File uploaded to S3: {}", key);
                return String.format("%s/%s/%s", baseUrl, sanitizedSubDir, fileName);
            } catch (Exception e) {
                log.error("Failed to upload to S3: {}. Falling back to local disk.", e.getMessage());
            }
        }

        // Local Storage Fallback
        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads", sanitizedSubDir);
            java.nio.file.Files.createDirectories(uploadPath);
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            log.info("File uploaded to local storage: {}", filePath.toAbsolutePath());
            return String.format("%s/%s/%s", baseUrl, sanitizedSubDir, fileName);
        } catch (IOException e) {
            log.error("Could not store file locally: {}", fileName, e);
            throw new RuntimeException("Could not store file locally " + fileName, e);
        }
    }

    public byte[] loadFile(String subDir, String fileName) throws IOException {
        String key = subDir + "/" + fileName;
        if (useS3) {
            try {
                return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build()).asByteArray();
            } catch (Exception e) {
                log.error("Failed to load file from S3: {}. Checking local disk.", e.getMessage());
            }
        }

        // Local Storage Fallback
        java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", subDir, fileName);
        if (java.nio.file.Files.exists(filePath)) {
            return java.nio.file.Files.readAllBytes(filePath);
        } else {
            log.error("File not found on local disk: {}", filePath.toAbsolutePath());
            throw new RuntimeException("File not found: " + fileName);
        }
    }
}

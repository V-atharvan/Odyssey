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
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                log.info("Creating S3 bucket: {}", bucketName);
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            } else {
                log.error("Could not verify S3 bucket: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to connect to AWS S3 during initialization: {}. File uploads will fail, but application will proceed.", e.getMessage());
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

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to S3: {}", key);

            // In production (real AWS), this could be the direct S3 URL.
            // For LocalStack/Dev, we still use our proxy endpoint to serve the file
            return String.format("%s/%s/%s", baseUrl, sanitizedSubDir, fileName);
        } catch (IOException e) {
            log.error("Could not store file {}", fileName, e);
            throw new RuntimeException("Could not store file " + fileName, e);
        }
    }

    public byte[] loadFile(String subDir, String fileName) throws IOException {
        String key = subDir + "/" + fileName;
        try {
            return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build()).asByteArray();
        } catch (S3Exception e) {
            log.error("File not found in S3: {}", key);
            throw new RuntimeException("File not found: " + fileName, e);
        }
    }
}

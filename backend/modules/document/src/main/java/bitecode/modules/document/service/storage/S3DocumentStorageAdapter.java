package bitecode.modules.document.service.storage;

import bitecode.modules.document.config.properties.DocumentProperties;
import bitecode.modules.document.model.enums.DocumentStorageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.Path;
import java.util.UUID;

@Component
public class S3DocumentStorageAdapter implements DocumentStorageAdapter {
    private final DocumentProperties documentProperties;
    private final S3Client s3Client;

    @Autowired
    public S3DocumentStorageAdapter(DocumentProperties documentProperties) {
        this.documentProperties = documentProperties;
        this.s3Client = createS3Client(documentProperties);
    }

    S3DocumentStorageAdapter(DocumentProperties documentProperties, S3Client s3Client) {
        this.documentProperties = documentProperties;
        this.s3Client = s3Client;
    }

    private S3Client createS3Client(DocumentProperties documentProperties) {
        var s3Properties = documentProperties.getS3();
        var s3ClientBuilder = S3Client.builder()
                .region(Region.of(s3Properties.getRegion()))
                .forcePathStyle(s3Properties.isForcePathStyle());

        if (StringUtils.hasText(s3Properties.getAccessKey()) && StringUtils.hasText(s3Properties.getSecretKey())) {
            s3ClientBuilder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(s3Properties.getAccessKey(), s3Properties.getSecretKey()))
            );
        } else {
            s3ClientBuilder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        if (StringUtils.hasText(s3Properties.getEndpoint())) {
            s3ClientBuilder.endpointOverride(URI.create(s3Properties.getEndpoint()));
        }

        return s3ClientBuilder.build();
    }

    @Override
    public DocumentStorageType storageType() {
        return DocumentStorageType.S3;
    }

    @Override
    public void store(StoreDocumentRequest request) {
        var bucketName = requireBucketName();
        var objectKey = toObjectKey(request);
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .build(),
                RequestBody.fromBytes(request.fileContent())
        );
    }

    @Override
    public void storeFile(UUID ownerUserId, String storedFilename, Path source, long byteSize) {
        var objectKey = toObjectKey(new StoreDocumentRequest(ownerUserId, storedFilename, new byte[0]));
        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(requireBucketName())
                        .key(objectKey)
                        .build(),
                RequestBody.fromFile(source));
    }

    @Override
    public byte[] load(StoreDocumentRequest request) {
        var bucketName = requireBucketName();
        var objectKey = toObjectKey(request);
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .build())
                .asByteArray();
    }

    @Override
    public void copyToStream(UUID ownerUserId, String storedFilename, OutputStream destination) {
        var objectKey = toObjectKey(new StoreDocumentRequest(ownerUserId, storedFilename, new byte[0]));
        try (ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
                GetObjectRequest.builder().bucket(requireBucketName()).key(objectKey).build())) {
            response.transferTo(destination);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to stream S3 document", exception);
        }
    }

    @Override
    public void delete(StoreDocumentRequest request) {
        var bucketName = requireBucketName();
        var objectKey = toObjectKey(request);
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build());
    }

    private String requireBucketName() {
        var bucketName = documentProperties.getS3().getBucket();
        if (!StringUtils.hasText(bucketName)) {
            throw new IllegalStateException("S3 bucket is not configured for document storage");
        }
        return bucketName;
    }

    private String toObjectKey(StoreDocumentRequest request) {
        return request.userId() + "/" + request.storedFilename();
    }
}

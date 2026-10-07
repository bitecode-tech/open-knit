package bitecode.modules.document.service.storage;

import bitecode.modules.document.config.properties.DocumentProperties;
import bitecode.modules.document.model.enums.DocumentStorageType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalDocumentStorageAdapter implements DocumentStorageAdapter {
    private final Path basePath;

    public LocalDocumentStorageAdapter(DocumentProperties documentProperties) {
        this.basePath = Path.of(documentProperties.getLocal().getBasePath()).toAbsolutePath().normalize();
    }

    @Override
    public DocumentStorageType storageType() {
        return DocumentStorageType.LOCAL;
    }

    @Override
    public void store(StoreDocumentRequest request) {
        var documentPath = resolveDocumentPath(request);
        try {
            Files.createDirectories(documentPath.getParent());
            Files.write(documentPath, request.fileContent());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store document locally", e);
        }
    }

    @Override
    public void storeFile(UUID ownerUserId, String storedFilename, Path source, long byteSize) {
        var destination = resolveDocumentPath(new StoreDocumentRequest(ownerUserId, storedFilename, new byte[0]));
        try {
            Files.createDirectories(destination.getParent());
            Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException cleanupFailure) {
                exception.addSuppressed(cleanupFailure);
            }
            throw new IllegalStateException("Failed to store document locally", exception);
        }
    }

    @Override
    public void copyToStream(UUID ownerUserId, String storedFilename, OutputStream destination) {
        var source = resolveDocumentPath(new StoreDocumentRequest(ownerUserId, storedFilename, new byte[0]));
        try {
            Files.copy(source, destination);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to stream document locally", exception);
        }
    }

    @Override
    public byte[] load(StoreDocumentRequest request) {
        var documentPath = resolveDocumentPath(request);
        try {
            return Files.readAllBytes(documentPath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load local document", e);
        }
    }

    @Override
    public void delete(StoreDocumentRequest request) {
        var documentPath = resolveDocumentPath(request);
        try {
            Files.deleteIfExists(documentPath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete local document", e);
        }
    }

    private Path resolveDocumentPath(StoreDocumentRequest request) {
        var userDirectoryPath = basePath.resolve(request.userId().toString()).normalize();
        var documentPath = userDirectoryPath.resolve(request.storedFilename()).normalize();
        if (!documentPath.startsWith(userDirectoryPath)) {
            throw new IllegalArgumentException("Invalid local document path");
        }
        return documentPath;
    }
}

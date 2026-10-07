package bitecode.modules.document.service.storage;

import bitecode.modules.document.model.enums.DocumentStorageType;

import java.io.OutputStream;
import java.nio.file.Path;
import java.util.UUID;

public interface DocumentStorageAdapter {

    DocumentStorageType storageType();

    void store(StoreDocumentRequest request);

    byte[] load(StoreDocumentRequest request);

    void delete(StoreDocumentRequest request);

    void storeFile(UUID ownerUserId, String storedFilename, Path source, long byteSize);

    void copyToStream(UUID ownerUserId, String storedFilename, OutputStream destination);
}

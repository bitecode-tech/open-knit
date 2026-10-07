package bitecode.modules.document.model.data;

import bitecode.modules.document.model.enums.DocumentStorageType;

import java.util.UUID;

public record DocumentDownload(
        String filename,
        String fileType,
        long fileSize,
        UUID ownerUserId,
        String storedFilename,
        DocumentStorageType storageType
) {
}

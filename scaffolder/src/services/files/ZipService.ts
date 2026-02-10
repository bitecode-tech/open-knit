import fs from "fs";
import archiver from "archiver";
import yauzl from "yauzl";

class ZipService {
    async createZipFromEntries(
        zipFilePath: string,
        addEntries: (archive: archiver.Archiver) => void | Promise<void>
    ): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const outputStream = fs.createWriteStream(zipFilePath);
            const archive = archiver("zip", {zlib: {level: 1}});

            outputStream.on("close", () => resolve());
            outputStream.on("error", (error) => reject(error));
            archive.on("error", (error) => reject(error));

            archive.pipe(outputStream);

            Promise.resolve(addEntries(archive))
                .then(() => archive.finalize())
                .catch((error) => reject(error));
        });
    }

    async createZipFromBaseZipAndEntries(
        baseZipPath: string,
        zipFilePath: string,
        addEntries: (archive: archiver.Archiver) => void | Promise<void>
    ): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const outputStream = fs.createWriteStream(zipFilePath);
            const archive = archiver("zip", {zlib: {level: 1}});

            outputStream.on("close", () => resolve());
            outputStream.on("error", (error) => reject(error));
            archive.on("error", (error) => reject(error));

            archive.pipe(outputStream);

            yauzl.open(baseZipPath, {lazyEntries: true}, (error, zipFile) => {
                if (error || !zipFile) {
                    reject(error ?? new Error("Failed to open base zip"));
                    return;
                }

                zipFile.readEntry();

                zipFile.on("entry", (entry) => {
                    if (/\/$/.test(entry.fileName)) {
                        zipFile.readEntry();
                        return;
                    }
                    zipFile.openReadStream(entry, (streamError, readStream) => {
                        if (streamError || !readStream) {
                            reject(streamError ?? new Error("Failed to read base zip entry"));
                            return;
                        }
                        archive.append(readStream, {name: entry.fileName});
                        readStream.on("end", () => {
                            zipFile.readEntry();
                        });
                    });
                });

                zipFile.on("end", () => {
                    Promise.resolve(addEntries(archive))
                        .then(() => archive.finalize())
                        .catch((finalizeError) => reject(finalizeError));
                });

                zipFile.on("error", (zipError) => reject(zipError));
            });
        });
    }
}

const zipService = new ZipService();
export default zipService;

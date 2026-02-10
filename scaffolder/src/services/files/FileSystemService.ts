import fs from "fs";

class FileSystemService {
    ensureDirectory(targetPath: string): void {
        fs.mkdirSync(targetPath, {recursive: true});
    }
}

const fileSystemService = new FileSystemService();
export default fileSystemService;

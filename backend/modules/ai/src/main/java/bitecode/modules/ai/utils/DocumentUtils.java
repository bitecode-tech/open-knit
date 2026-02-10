package bitecode.modules.ai.utils;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public class DocumentUtils {
    private static final AutoDetectParser PARSER = new AutoDetectParser();

    public static String extractText(MultipartFile file) throws IOException {
        try (var stream = file.getInputStream()) {
            var handler = new BodyContentHandler(-1);
            var metadata = new Metadata();
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, file.getOriginalFilename());
            PARSER.parse(stream, handler, metadata, new ParseContext());
            return handler.toString();
        } catch (Exception e) {
            throw new IOException("Failed to parse " + file.getOriginalFilename(), e);
        }
    }
}

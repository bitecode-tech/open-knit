package bitecode.modules._common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;

public class FileUtils {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final ObjectWriter PRETTY_PRINTER = OBJECT_MAPPER.writerWithDefaultPrettyPrinter();

    public static void writeToFile(Path filePath, String string) {
        try (var fileWriter = new FileWriter(filePath.toFile())) {
            fileWriter.write(string);
            System.out.println("File written to " + filePath);
        } catch (IOException e) {
            System.err.println("Failed to write JSON to file: " + e.getMessage());
        }
    }

    public static void writeToFileAsJson(Path filePath, Object object) {
        try (var fileWriter = new FileWriter(filePath.toFile())) {
            if (object instanceof String strObj) {
                object = OBJECT_MAPPER.readValue(strObj, Object.class);
            }
            var prettyStr = PRETTY_PRINTER.writeValueAsString(object);
            fileWriter.write(prettyStr);
            System.out.println("File written to " + filePath);
        } catch (IOException e) {
            System.err.println("Failed to write JSON to file: " + e.getMessage());
        }
    }

}

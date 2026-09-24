package bitecode.modules._common.client.openai;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.MultipartField;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.OpenAIRetryableException;
import com.openai.errors.OpenAIServiceException;
import com.openai.models.files.FileCreateParams;
import com.openai.models.files.FilePurpose;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class OpenAiFilesClient {
    public UploadedOpenAiFile uploadFile(String apiKey, MultipartFile multipartFile, Purpose purpose) {
        var client = createClient(apiKey);
        try {
            var createParams = FileCreateParams.builder()
                    .file(createMultipartBody(multipartFile))
                    .purpose(toFilePurpose(purpose))
                    .build();
            var uploadedFile = client.files().create(createParams);
            return new UploadedOpenAiFile(uploadedFile.id(), uploadedFile.filename());
        } catch (OpenAIServiceException | OpenAIRetryableException | OpenAIIoException exception) {
            var retryableException = OpenAiErrorClassifier.toRetryableException(exception);
            if (retryableException != null) {
                throw retryableException;
            }
            throw exception;
        } catch (IOException exception) {
            log.error("Error while uploading file through OpenAI Files API", exception);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while uploading file through OpenAI Files API");
        }
    }

    private MultipartField<InputStream> createMultipartBody(MultipartFile multipartFile) throws IOException {
        return MultipartField.<InputStream>builder()
                .filename(multipartFile.getOriginalFilename())
                .value(multipartFile.getInputStream())
                .build();
    }

    private OpenAIClient createClient(String apiKey) {
        return OpenAIOkHttpClient.builder().apiKey(apiKey).build();
    }

    private FilePurpose toFilePurpose(Purpose purpose) {
        return switch (purpose) {
            case ASSISTANTS -> FilePurpose.ASSISTANTS;
            case USER_DATA -> FilePurpose.USER_DATA;
        };
    }

    public enum Purpose {
        ASSISTANTS,
        USER_DATA
    }

    public record UploadedOpenAiFile(String id, String filename) {
    }
}

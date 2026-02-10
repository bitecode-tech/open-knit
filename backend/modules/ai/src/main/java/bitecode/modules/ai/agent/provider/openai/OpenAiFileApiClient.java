package bitecode.modules.ai.agent.provider.openai;

import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.MultipartField;
import com.openai.models.files.FileCreateParams;
import com.openai.models.files.FileObject;
import com.openai.models.files.FilePurpose;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiFileApiClient {

    public FileObject uploadFile(AiServicesProviderConfig providerConfig, MultipartFile multipartFile, FilePurpose purpose) {
        var client = createClient(providerConfig.getApiKey());
        try {
            var createParams = FileCreateParams.builder()
                    .file(createMultipartBody(multipartFile))
                    .purpose(purpose)
                    .build();
            return client.files().create(createParams);
        } catch (IOException e) {
            log.error("Error while uploading file thru OpenAI FileApi", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while uploading file thru OpenAI FileApi");
        }
    }

    private MultipartField<InputStream> createMultipartBody(MultipartFile multipartFile) throws IOException {
        return MultipartField.<InputStream>builder().filename(multipartFile.getOriginalFilename()).value(multipartFile.getInputStream()).build();
    }

    private OpenAIClient createClient(String apiKey) {
        return OpenAIOkHttpClient.builder().apiKey(apiKey).build();
    }
}

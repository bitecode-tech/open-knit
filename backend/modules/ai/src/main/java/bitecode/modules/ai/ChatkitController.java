package bitecode.modules.ai;

import bitecode.modules.ai.model.data.request.ChatkitSessionRequest;
import bitecode.modules.ai.model.data.response.ChatkitSessionResponse;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Issues ChatKit client secrets to the frontend. The secret is minted server-side
 * using the OpenAI provider API key or a configured fallback.
 */
@RestController
@PermitAll
@RequestMapping("/chatkit")
@RequiredArgsConstructor
public class ChatkitController {

    private final ChatkitSessionService chatkitSessionService;

    @PostMapping("/session")
    public ResponseEntity<ChatkitSessionResponse> issueClientSecret(@RequestBody(required = false) ChatkitSessionRequest request) {
        try {
            var secret = chatkitSessionService.fetchClientSecret(
                    request != null ? request.clientSecret() : null,
                    request != null ? request.user() : null,
                    request != null ? request.workflowId() : null
            );
            return ResponseEntity.ok(new ChatkitSessionResponse(secret));
        } catch (Exception ex) {
            return ResponseEntity.status(503).build();
        }
    }


}

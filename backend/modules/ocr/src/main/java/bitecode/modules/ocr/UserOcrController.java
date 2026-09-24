package bitecode.modules.ocr;

import bitecode.modules._common.model.annotation.AdminOrUserAccess;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.ocr.model.data.OcrInstructionDetails;
import bitecode.modules.ocr.model.data.OcrResultDetails;
import bitecode.modules.ocr.model.request.CreateOcrInstructionRequest;
import bitecode.modules.ocr.model.request.RunOcrRequest;
import bitecode.modules.ocr.model.request.UpdateOcrInstructionRequest;
import bitecode.modules.ocr.service.OcrInstructionService;
import bitecode.modules.ocr.service.OcrResultService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@AdminOrUserAccess
@RequestMapping("/api/ocr")
public class UserOcrController {
    private final OcrInstructionService ocrInstructionService;
    private final OcrResultService ocrResultService;

    public UserOcrController(OcrInstructionService ocrInstructionService, OcrResultService ocrResultService) {
        this.ocrInstructionService = ocrInstructionService;
        this.ocrResultService = ocrResultService;
    }

    @GetMapping("/instructions")
    public PagedModel<OcrInstructionDetails> getInstructions(Pageable pageable) {
        return new PagedModel<>(ocrInstructionService.findUserInstructions(AuthUtils.getUserId(), pageable));
    }

    @PostMapping("/instructions")
    public ResponseEntity<OcrInstructionDetails> createInstruction(@Valid @org.springframework.web.bind.annotation.RequestBody CreateOcrInstructionRequest request) {
        return ResponseEntity.status(201).body(ocrInstructionService.createInstruction(AuthUtils.getUserId(), request));
    }

    @PatchMapping("/instructions/{instructionId}")
    public OcrInstructionDetails updateInstruction(@PathVariable UUID instructionId,
                                                   @Valid @org.springframework.web.bind.annotation.RequestBody UpdateOcrInstructionRequest request) {
        return ocrInstructionService.updateInstruction(instructionId, AuthUtils.getUserId(), request);
    }

    @DeleteMapping("/instructions/{instructionId}")
    public void deleteInstruction(@PathVariable UUID instructionId) {
        ocrInstructionService.deleteInstruction(instructionId, AuthUtils.getUserId());
    }

    @GetMapping("/results")
    public PagedModel<OcrResultDetails> getResults(Pageable pageable) {
        return new PagedModel<>(ocrResultService.findUserResults(AuthUtils.getUserId(), pageable));
    }

    @PostMapping(path = "/results", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<OcrResultDetails>> runOcr(@RequestPart("request") @Valid RunOcrRequest request,
                                                         @RequestPart("file") MultipartFile file) {
        return ocrResultService.runOcr(AuthUtils.getUserId(), request, file)
                .map(result -> ResponseEntity.status(201).body(result));
    }
}

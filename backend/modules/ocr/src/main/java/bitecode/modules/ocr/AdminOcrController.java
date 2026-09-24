package bitecode.modules.ocr;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.ocr.model.data.OcrResultDetails;
import bitecode.modules.ocr.service.OcrResultService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@AdminAccess
@RequestMapping("/api/admin/ocr/results")
public class AdminOcrController {
    private final OcrResultService ocrResultService;

    public AdminOcrController(OcrResultService ocrResultService) {
        this.ocrResultService = ocrResultService;
    }

    @GetMapping
    public PagedModel<OcrResultDetails> getResults(Pageable pageable) {
        return new PagedModel<>(ocrResultService.findAllResults(pageable));
    }

    @DeleteMapping("/{resultId}")
    public void deleteResult(@PathVariable UUID resultId) {
        ocrResultService.deleteResultAsAdmin(resultId);
    }
}

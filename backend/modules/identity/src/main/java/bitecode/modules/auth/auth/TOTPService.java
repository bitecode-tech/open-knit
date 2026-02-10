package bitecode.modules.auth.auth;

import bitecode.modules.auth.auth.config.properties.TOTPProperties;
import bitecode.modules.auth.auth.model.entity.TOTPSecret;
import bitecode.modules.auth.auth.repository.TOTPSecretRepository;
import bitecode.modules.auth.user.model.entity.User;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrDataFactory;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TOTPService {
    private final TOTPProperties props;
    private final TOTPSecretRepository totpTokenRepository;

    private final QrDataFactory qrDataFactory;
    private final CodeVerifier verifier;
    private final RecoveryCodeGenerator recoveryCodeGenerator;
    private final SecretGenerator secretGenerator;

    public String setupDevice(User user) throws QrGenerationException {
        var secret = secretGenerator.generate();
        var totpSecret = totpTokenRepository.findByUserId(user.getId())
                .orElseGet(() -> TOTPSecret.builder().userId(user.getId()).build());
        totpSecret.setSecret(secret);

        var data = qrDataFactory.newBuilder()
                .label(user.getUsername())
                .secret(secret)
                .issuer(props.getIssuer())
                .build();

        totpTokenRepository.save(totpSecret);

        return data.getUri();
    }

    public boolean verify(Long userId, String code) {
        var secret = totpTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
        return verifier.isValidCode(secret.getSecret(), code);
    }

    public List<String> generateRecoveryCodes(String code) {
        return Arrays.stream(recoveryCodeGenerator.generateCodes(16)).toList();
    }

}
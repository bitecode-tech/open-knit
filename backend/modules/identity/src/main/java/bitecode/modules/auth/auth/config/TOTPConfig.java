package bitecode.modules.auth.auth.config;

import bitecode.modules.auth.auth.config.properties.TOTPProperties;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.qr.QrDataFactory;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class TOTPConfig {
    private final TOTPProperties props;

    @Bean
    public HashingAlgorithm hashingAlgorithm() {
        return HashingAlgorithm.SHA1;
    }

    @Bean
    public TimeProvider timeProvider() {
        return new SystemTimeProvider();
    }

    @Bean
    public SecretGenerator secretGenerator() {
        return new DefaultSecretGenerator(props.getSecret().getLength());
    }

    @Bean
    @ConditionalOnMissingBean
    public RecoveryCodeGenerator recoveryCodeGenerator() {
        return new RecoveryCodeGenerator();
    }

    @Bean
    public QrDataFactory qrDataFactory(HashingAlgorithm hashingAlgorithm) {
        return new QrDataFactory(hashingAlgorithm, props.getCode().getLength(), props.getTime().getPeriod());
    }

    @Bean
    public CodeGenerator codeGenerator(HashingAlgorithm hashingAlgorithm) {
        return new DefaultCodeGenerator(hashingAlgorithm, props.getCode().getLength());
    }

    @Bean
    @ConditionalOnMissingBean
    public CodeVerifier codeVerifier(CodeGenerator codeGenerator, TimeProvider timeProvider) {
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        verifier.setTimePeriod(props.getTime().getPeriod());
        verifier.setAllowedTimePeriodDiscrepancy(props.getTime().getDiscrepancy());
        return verifier;
    }
}

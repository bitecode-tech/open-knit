package bitecode.modules._common;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@EnableMethodSecurity(jsr250Enabled = true)
@SpringBootApplication
@ComponentScan(basePackages = {"bitecode.modules"})
@EnableJpaRepositories(basePackages = {"bitecode.modules"})
@EntityScan(basePackages = {"bitecode.modules"})
public class TestApplication {
}

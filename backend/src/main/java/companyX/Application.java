package companyX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity(jsr250Enabled = true)
@ComponentScan(basePackages = {"bitecode.modules", "companyX"})
@EnableJpaRepositories(basePackages = {"bitecode.modules", "companyX"})
@EntityScan(basePackages = {"bitecode.modules", "companyX"})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

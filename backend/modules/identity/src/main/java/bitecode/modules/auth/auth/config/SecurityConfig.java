package bitecode.modules.auth.auth.config;

import bitecode.modules._common.model.enums.EnvProfile;
import bitecode.modules.auth.auth.OAuth2ProvidersService;
import bitecode.modules.auth.auth.config.filter.JwtAuthFilter;
import bitecode.modules.auth.auth.config.properties.AuthProperties;
import bitecode.modules.auth.user.UserService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final UserService userDetailsService;
    private final OAuth2ProvidersService OAuth2ProvidersService;
    private final Environment environment;

    @Resource
    private final AuthProperties authProperties;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var noAuthUrls = authProperties.getSecurity().getNoAuthUrls();
        var isStrictTransportSecurityEnabled = environment.acceptsProfiles(
                Profiles.of(EnvProfile.PROD.name(), EnvProfile.STAGE.name())
        );

        return http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> {
                    if (isStrictTransportSecurityEnabled) {
                        headers.httpStrictTransportSecurity(
                                hsts -> hsts
                                        .maxAgeInSeconds(31536000)
                                        .includeSubDomains(true)
                        );
                    }
                })
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(CorsUtils::isPreFlightRequest).permitAll();
                    noAuthUrls.forEach((httpMethod, url) -> auth.requestMatchers(httpMethod, url.toArray(String[]::new)).permitAll());
                    auth.requestMatchers("/actuator/**").permitAll();
                    // enable in case of any static resources
//                    auth.requestMatchers("/webjars/**", "/css/**", "/js/**", "/error")
//                            .permitAll();
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(ex ->
                        ex.defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/**")
                        )
                )
                .oauth2Login(oauth2 ->
                        oauth2.userInfoEndpoint(userInfo -> userInfo.oidcUserService(OAuth2ProvidersService))
                                .successHandler(OAuth2ProvidersService)
                )
                .build();
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(new BCryptPasswordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Profile(EnvProfile._LOCAL_)
    @Bean(value = "corsConfigurationSource")
    public CorsConfigurationSource corsConfigurationSourceDev(@Autowired ConfigurationSourceProps corsConfiguration) {
        var config = new CorsConfiguration(corsConfiguration);
        if (CollectionUtils.isEmpty(config.getAllowedOriginPatterns()) && CollectionUtils.isEmpty(corsConfiguration.getAllowedOrigins())) {
            config.setAllowedOriginPatterns(List.of("*"));
            config.setAllowedOrigins(null);
        }
        if (List.of(HttpMethod.GET.toString(), HttpMethod.HEAD.toString()).equals(config.getAllowedMethods())) {
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        }
        if (CollectionUtils.isEmpty(config.getAllowedHeaders())) {
            config.setAllowedHeaders(List.of("*"));
        }

        return defaultCorsConfigurationExtension(config);
    }

    @Bean(value = "corsConfigurationSource")
    @ConditionalOnMissingBean
    public CorsConfigurationSource corsConfigurationSourceProd(@Autowired ConfigurationSourceProps corsConfiguration) {
        // credentials can't be = true if origin pattern is present, high security risk
        corsConfiguration.setAllowedOriginPatterns(null);
        return defaultCorsConfigurationExtension(corsConfiguration);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    private CorsConfigurationSource defaultCorsConfigurationExtension(CorsConfiguration corsConfiguration) {
        var config = new CorsConfiguration(corsConfiguration);
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Configuration
    @ConfigurationProperties(prefix = "bitecode.security.cors")
    public static class ConfigurationSourceProps extends CorsConfiguration {
    }
}

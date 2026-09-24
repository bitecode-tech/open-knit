package bitecode.modules._common.service.email;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${spring.mail.from:}")
    private String fromAddress;

    public void sendEmail(String to, String subject, String templateName, Map<String, ?> model) throws MessagingException {
        var message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, true);

        var context = new Context();
        context.setVariables((Map<String, Object>) model);
        var htmlContent = templateEngine.process(templateName, context);

        helper.setTo(to);
        applyFromAddress(helper);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    public void sendEmail(String to, String subject, String content, boolean isHtml) throws MessagingException {
        var message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        applyFromAddress(helper);
        helper.setSubject(subject);
        helper.setText(content, isHtml);

        mailSender.send(message);
    }

    private void applyFromAddress(MimeMessageHelper helper) throws MessagingException {
        if (StringUtils.hasText(fromAddress)) {
            helper.setFrom(fromAddress);
        }
    }
}

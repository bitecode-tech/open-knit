package bitecode.modules._common.model.annotation;

import jakarta.annotation.security.RolesAllowed;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@RolesAllowed("ADMIN")
public @interface AdminAccess {
}
package bitecode.modules.auth.auth.util;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class PasswordUtils {
    public static String hashPassword(String plainPwd) {
        return BCrypt.hashpw(plainPwd, BCrypt.gensalt(12));
    }

    public static String hashPasswordWeak(String plainPwd) {
        return BCrypt.hashpw(plainPwd, BCrypt.gensalt(5));
    }

    public static boolean checkPassword(String plainPwd, String hashedPwd) {
        return BCrypt.checkpw(plainPwd, hashedPwd);
    }
}

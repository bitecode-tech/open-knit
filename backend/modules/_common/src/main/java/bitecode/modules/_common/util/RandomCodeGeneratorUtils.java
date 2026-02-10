package bitecode.modules._common.util;

import java.security.SecureRandom;
import java.util.Random;

public class RandomCodeGeneratorUtils {
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL_CHARACTERS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

    private static final String ALL_CHARACTERS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL_CHARACTERS;
    private static final String CODE_CHARS = UPPERCASE + DIGITS;

    private static final SecureRandom RANDOM = new SecureRandom();

    public static int generatePin(int length) {
        int min = (int) Math.pow(10, length - 1);
        int max = (int) Math.pow(10, length) - 1;
        return min + new Random().nextInt(max - min + 1);
    }


    public static String generateCode(int length) {
        var password = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(CODE_CHARS.length());
            password.append(CODE_CHARS.charAt(index));
        }

        return password.toString();
    }

    public static String generatePassword(int length) {
        var password = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(ALL_CHARACTERS.length());
            password.append(ALL_CHARACTERS.charAt(index));
        }

        return password.toString();
    }
}

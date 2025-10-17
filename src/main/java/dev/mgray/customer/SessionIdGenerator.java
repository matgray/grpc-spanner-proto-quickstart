package dev.mgray.customer;

import java.security.SecureRandom;
import java.util.Base64;

public final class CookieGenerator {

    private static final SecureRandom secureRandom = new SecureRandom(); // Thread-safe
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder(); // Thread-safe

    public static String generateRandomCookieValue(int byteLength) {
        byte[] randomBytes = new byte[byteLength];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.withoutPadding().encodeToString(randomBytes);
    }
}

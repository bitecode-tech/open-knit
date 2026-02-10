package bitecode.modules._common.util;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

public class UrlUtils {

    public static String getBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }

        try {
            // Encode spaces or illegal chars safely
            URI uri = new URI(url.trim().replace(" ", "%20"));
            URL normalized = uri.toURL();

            String protocol = normalized.getProtocol();
            String host = normalized.getHost();
            int port = normalized.getPort();

            StringBuilder baseUrl = new StringBuilder(protocol + "://" + host);
            if (port != -1) {
                baseUrl.append(":").append(port);
            }

            return baseUrl.toString();

        } catch (URISyntaxException | MalformedURLException e) {
            // Fallback: best-effort extraction if the URL is malformed
            int idx = url.indexOf('/', url.indexOf("//") + 2);
            if (idx > 0) {
                return url.substring(0, idx);
            }
            return url;
        }
    }
}

package bitecode.modules.ai.agent;

import java.util.Locale;
import java.util.Map;

final class SqlColumnLabelNaming {
    private SqlColumnLabelNaming() {
    }

    static String toCamelCase(String columnLabel) {
        if (columnLabel.matches("[a-z][A-Za-z0-9]*")) {
            return columnLabel;
        }
        var words = columnLabel.split("[^A-Za-z0-9]+");
        var camelCase = new StringBuilder();
        for (var wordValue : words) {
            var word = wordValue.toLowerCase(Locale.ROOT);
            if (word.isEmpty()) {
                continue;
            }
            if (camelCase.isEmpty()) {
                camelCase.append(word);
            } else {
                camelCase.append(Character.toUpperCase(word.charAt(0)));
                camelCase.append(word.substring(1));
            }
        }
        return camelCase.toString();
    }

    static void putInCamelCase(Map<String, Object> row, String columnLabel, Object value) {
        row.put(toCamelCase(columnLabel), value);
    }
}

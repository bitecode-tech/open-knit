package bitecode.modules._common.model.enums;

import org.apache.commons.lang3.StringUtils;

public enum EnvProfile {
    LOCAL, DEV, STAGE, PROD;
    public static final String _PROD_ = "PROD";
    public static final String _DEV_ = "DEV";
    public static final String _LOCAL_ = "LOCAL";

    public boolean equals(String name) {
        return StringUtils.equalsIgnoreCase(name, this.toString());
    }
}

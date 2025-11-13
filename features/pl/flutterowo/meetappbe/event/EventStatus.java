package pl.flutterowo.meetappbe.event;

public enum EventStatus {
    ACTIVE("Active"),
    CANCELLED("Cancelled"),
    INACTIVE("Inactive");

    private final String displayName;

    EventStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
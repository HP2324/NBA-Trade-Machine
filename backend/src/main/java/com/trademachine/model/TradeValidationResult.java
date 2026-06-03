package com.trademachine.model;

import java.util.List;

public class TradeValidationResult {
    private final boolean valid;
    private final List<TeamBreakdown> breakdown;

    public TradeValidationResult(boolean valid, List<TeamBreakdown> breakdown) {
        this.valid = valid;
        this.breakdown = breakdown;
    }

    public boolean isValid() { return valid; }
    public List<TeamBreakdown> getBreakdown() { return breakdown; }
}

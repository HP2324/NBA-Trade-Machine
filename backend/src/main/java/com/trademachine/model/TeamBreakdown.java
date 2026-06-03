package com.trademachine.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TeamBreakdown {
    private final int teamId;
    private final String teamName;
    private final long outgoingSum;
    private final long incomingSum;
    private final long maxAllowed;
    private final boolean matchOk;

    public TeamBreakdown(int teamId, String teamName, long outgoingSum,
                         long incomingSum, long maxAllowed, boolean matchOk) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.outgoingSum = outgoingSum;
        this.incomingSum = incomingSum;
        this.maxAllowed = maxAllowed;
        this.matchOk = matchOk;
    }

    public int getTeamId() { return teamId; }
    public String getTeamName() { return teamName; }
    public long getOutgoingSum() { return outgoingSum; }
    public long getIncomingSum() { return incomingSum; }
    public long getMaxAllowed() { return maxAllowed; }
    @JsonProperty("isMatchOk")
    public boolean isMatchOk() { return matchOk; }
}

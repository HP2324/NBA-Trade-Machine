package com.trademachine.model;

import java.util.List;

/**
 * Represents a single directional leg of a trade:
 * team {@code from} sends players with {@code playerIds} to team {@code to}.
 */
public class TradeExchange {
    private int from;
    private int to;
    private List<Integer> playerIds;

    public int getFrom() { return from; }
    public void setFrom(int from) { this.from = from; }

    public int getTo() { return to; }
    public void setTo(int to) { this.to = to; }

    public List<Integer> getPlayerIds() { return playerIds; }
    public void setPlayerIds(List<Integer> playerIds) { this.playerIds = playerIds; }
}

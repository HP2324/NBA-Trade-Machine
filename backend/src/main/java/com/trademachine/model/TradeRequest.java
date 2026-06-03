package com.trademachine.model;

import java.util.List;

public class TradeRequest {
    private List<TradeExchange> trades;

    public List<TradeExchange> getTrades() { return trades; }
    public void setTrades(List<TradeExchange> trades) { this.trades = trades; }
}

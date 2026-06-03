package com.trademachine.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Player {
    private final int id;
    private final String name;
    private final long salary;
    private final int teamId;
    private final boolean isPick;

    public Player(int id, String name, long salary, int teamId, boolean isPick) {
        this.id = id;
        this.name = name;
        this.salary = salary;
        this.teamId = teamId;
        this.isPick = isPick;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public long getSalary() { return salary; }
    public int getTeamId() { return teamId; }
    @JsonProperty("isPick")
    public boolean isPick() { return isPick; }
}

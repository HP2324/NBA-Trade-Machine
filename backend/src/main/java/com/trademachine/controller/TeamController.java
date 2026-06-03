package com.trademachine.controller;

import com.trademachine.model.Team;
import com.trademachine.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class TeamController {

    private final DataService dataService;

    public TeamController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/teams")
    public List<Team> getTeams() {
        return dataService.getTeams();
    }

    @GetMapping("/teams/{teamId}/players")
    public ResponseEntity<?> getPlayersByTeam(@PathVariable int teamId) {
        Team team = dataService.findTeamById(teamId);
        if (team == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Team not found"));
        }

        List<Map<String, Object>> roster = dataService.getPlayers().stream()
                .filter(p -> p.getTeamId() == teamId)
                .map(p -> Map.<String, Object>of(
                        "id",     p.getId(),
                        "name",   p.getName(),
                        "salary", p.getSalary(),
                        "isPick", p.isPick()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(roster);
    }
}

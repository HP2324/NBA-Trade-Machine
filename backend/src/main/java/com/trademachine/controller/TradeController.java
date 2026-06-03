package com.trademachine.controller;

import com.trademachine.model.*;
import com.trademachine.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class TradeController {

    private final DataService dataService;

    public TradeController(DataService dataService) {
        this.dataService = dataService;
    }

    @PostMapping("/validate-trade")
    public ResponseEntity<?> validateTrade(@RequestBody TradeRequest request) {
        List<TradeExchange> trades = request.getTrades();

        if (trades == null || trades.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Must provide valid trades array"));
        }

        // Collect all involved team IDs
        Set<Integer> involvedTeams = new HashSet<>();
        for (TradeExchange t : trades) {
            involvedTeams.add(t.getFrom());
            involvedTeams.add(t.getTo());
        }

        // Initialize per-team accumulators
        Map<Integer, long[]> outgoing = new HashMap<>(); // outgoing[0] = sum
        Map<Integer, long[]> incoming = new HashMap<>();
        for (int teamId : involvedTeams) {
            outgoing.put(teamId, new long[]{0});
            incoming.put(teamId, new long[]{0});
        }

        // Process each exchange leg
        for (TradeExchange exchange : trades) {
            if (exchange.getPlayerIds() == null) continue;

            int fromId = exchange.getFrom();
            int toId   = exchange.getTo();

            long legSalary = 0;
            for (int pid : exchange.getPlayerIds()) {
                Player p = dataService.findPlayerById(pid);
                if (p != null && p.getTeamId() == fromId) {
                    legSalary += p.getSalary();
                }
            }

            if (outgoing.containsKey(fromId)) outgoing.get(fromId)[0] += legSalary;
            if (incoming.containsKey(toId))   incoming.get(toId)[0]   += legSalary;
        }

        // Build breakdown
        List<TeamBreakdown> breakdown = involvedTeams.stream().map(teamId -> {
            Team team = dataService.findTeamById(teamId);
            String teamName = team != null ? team.getName() : "Unknown Team";
            long out = outgoing.getOrDefault(teamId, new long[]{0})[0];
            long in  = incoming.getOrDefault(teamId, new long[]{0})[0];
            long max = Math.round(out * 1.25 + 100_000);
            return new TeamBreakdown(teamId, teamName, out, in, max, in <= max);
        }).collect(Collectors.toList());

        boolean valid = breakdown.stream().allMatch(TeamBreakdown::isMatchOk);
        return ResponseEntity.ok(new TradeValidationResult(valid, breakdown));
    }
}

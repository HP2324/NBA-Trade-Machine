package com.trademachine.service;

import com.trademachine.model.Player;
import com.trademachine.model.Team;
import jakarta.annotation.PostConstruct;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.Year;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DataService {

    private final List<Team> teams = new ArrayList<>();
    private final List<Player> players = new ArrayList<>();
    private final Map<String, Integer> teamsByName = new HashMap<>();

    private int nextTeamId = 1;
    private int nextPlayerId = 1;

    @PostConstruct
    public void load() throws Exception {
        Reader reader = new InputStreamReader(
                new ClassPathResource("nba_salaries.csv").getInputStream());

        Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setAllowMissingColumnNames(true)
                .build()
                .parse(reader);

        for (CSVRecord record : records) {
            String name   = firstNonEmpty(record, "Player Name", "name", "Name");
            String team   = firstNonEmpty(record, "Team", "team");
            String salStr = firstNonEmpty(record, "Salary", "salary", "SALARY");

            if (name == null || team == null) continue;

            teamsByName.computeIfAbsent(team, t -> {
                int id = nextTeamId++;
                teams.add(new Team(id, t));
                return id;
            });

            int teamId = teamsByName.get(team);
            long salary = parseSalary(salStr);
            players.add(new Player(nextPlayerId++, name, salary, teamId, false));
        }

        injectDraftPicks();

        System.out.printf("Loaded %d teams and %d players from CSV.%n",
                teams.size(), players.size());
    }

    private void injectDraftPicks() {
        int currentYear = Year.now().getValue();
        String[] rounds = {"1st Round", "2nd Round"};

        for (Team team : new ArrayList<>(teams)) {
            for (int year = currentYear + 1; year <= currentYear + 3; year++) {
                for (String round : rounds) {
                    String pickName = year + " " + round + " Pick";
                    players.add(new Player(nextPlayerId++, pickName, 0, team.getId(), true));
                }
            }
        }
    }

    private static long parseSalary(String s) {
        if (s == null || s.isBlank()) return 0;
        String digits = s.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? 0 : Long.parseLong(digits);
    }

    private static String firstNonEmpty(CSVRecord record, String... keys) {
        for (String key : keys) {
            try {
                String val = record.get(key);
                if (val != null && !val.isBlank()) return val;
            } catch (IllegalArgumentException ignored) {
                // column not present
            }
        }
        return null;
    }

    public List<Team> getTeams() {
        return Collections.unmodifiableList(teams);
    }

    public List<Player> getPlayers() {
        return Collections.unmodifiableList(players);
    }

    public Team findTeamById(int id) {
        return teams.stream().filter(t -> t.getId() == id).findFirst().orElse(null);
    }

    public Player findPlayerById(int id) {
        return players.stream().filter(p -> p.getId() == id).findFirst().orElse(null);
    }
}

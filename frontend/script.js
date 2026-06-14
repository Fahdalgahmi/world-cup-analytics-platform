const API_URL = "http://127.0.0.1:8000";

let goalsChart = null;
let radarChart = null;

const flags = {
    Argentina: "🇦🇷",
    Australia: "🇦🇺",
    Brazil: "🇧🇷",
    Croatia: "🇭🇷",
    England: "🏴",
    France: "🇫🇷",
    Japan: "🇯🇵",
    Morocco: "🇲🇦",
    Netherlands: "🇳🇱",
    Poland: "🇵🇱",
    Portugal: "🇵🇹",
    Senegal: "🇸🇳",
    "South Korea": "🇰🇷",
    Spain: "🇪🇸",
    Switzerland: "🇨🇭",
    USA: "🇺🇸"
};

function hideCharts() {
    const chartCard = document.querySelector(".chart-card");
    const radarCard = document.querySelector(".radar-card");

    if (chartCard) chartCard.style.display = "none";
    if (radarCard) radarCard.style.display = "none";
}

async function loadStats() {
    hideCharts();

    const response = await fetch(`${API_URL}/stats`);
    const data = await response.json();

    document.getElementById("output").innerHTML = `
        <h2>Statistics</h2>
        <div class="cards">
            <div class="card"><h3>Total Matches</h3><p>${data.total_matches}</p></div>
            <div class="card"><h3>Total Goals</h3><p>${data.total_goals}</p></div>
            <div class="card"><h3>Average Goals</h3><p>${data.average_goals_per_match}</p></div>
        </div>
    `;
}

async function loadRankings() {
    hideCharts();

    const response = await fetch(`${API_URL}/teams`);
    const teams = await response.json();

    let rows = teams.map((team, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${flags[team.team] || "⚽"} ${team.team}</td>
            <td>${team.matches ?? 0}</td>
            <td>${team.goals_scored ?? 0}</td>
            <td>${team.goals_allowed ?? 0}</td>
            <td>${(team.goals_scored ?? 0) - (team.goals_allowed ?? 0)}</td>
        </tr>
    `).join("");

    document.getElementById("output").innerHTML = `
        <h2>Team Rankings</h2>
        <table>
            <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Matches</th>
                <th>Goals Scored</th>
                <th>Goals Allowed</th>
                <th>Goal Difference</th>
            </tr>
            ${rows}
        </table>
    `;
}

async function loadMatches() {
    hideCharts();

    const response = await fetch(`${API_URL}/matches`);
    const matches = await response.json();

    let rows = matches.map(match => `
        <tr>
            <td>${match.year}</td>
            <td>${flags[match.home_team] || "⚽"} ${match.home_team}</td>
            <td>${match.home_score}</td>
            <td>${match.away_score}</td>
            <td>${flags[match.away_team] || "⚽"} ${match.away_team}</td>
        </tr>
    `).join("");

    document.getElementById("output").innerHTML = `
        <h2>Matches</h2>
        <table>
            <tr>
                <th>Year</th>
                <th>Home Team</th>
                <th>Home Score</th>
                <th>Away Score</th>
                <th>Away Team</th>
            </tr>
            ${rows}
        </table>
    `;
}

async function compareTeams() {
    const response = await fetch(`${API_URL}/teams`);
    const teams = await response.json();

    const team1Name = document.getElementById("team1").value.trim().toLowerCase();
    const team2Name = document.getElementById("team2").value.trim().toLowerCase();

    const team1 = teams.find(t => t.team.toLowerCase().includes(team1Name));
    const team2 = teams.find(t => t.team.toLowerCase().includes(team2Name));

    if (!team1 || !team2) {
        hideCharts();
        document.getElementById("output").innerHTML = `
            <h3>One or both teams were not found. Try Argentina, Brazil, France, or Morocco.</h3>
        `;
        return;
    }

    const chartCard = document.querySelector(".chart-card");
    const radarCard = document.querySelector(".radar-card");

    if (chartCard) chartCard.style.display = "none";
    if (radarCard) radarCard.style.display = "block";

    document.getElementById("output").innerHTML = `
        <h2>Team Comparison</h2>
        <div class="cards">
            <div class="card">
                <h3>${flags[team1.team] || "⚽"} ${team1.team}</h3>
                <p>Matches: ${team1.matches ?? 0}</p>
                <p>Goals Scored: ${team1.goals_scored ?? 0}</p>
                <p>Goals Allowed: ${team1.goals_allowed ?? 0}</p>
                <p>Goal Difference: ${(team1.goals_scored ?? 0) - (team1.goals_allowed ?? 0)}</p>
            </div>

            <div class="card">
                <h3>${flags[team2.team] || "⚽"} ${team2.team}</h3>
                <p>Matches: ${team2.matches ?? 0}</p>
                <p>Goals Scored: ${team2.goals_scored ?? 0}</p>
                <p>Goals Allowed: ${team2.goals_allowed ?? 0}</p>
                <p>Goal Difference: ${(team2.goals_scored ?? 0) - (team2.goals_allowed ?? 0)}</p>
            </div>
        </div>
    `;

    const ctx = document.getElementById("radarChart");

    if (radarChart) {
        radarChart.destroy();
    }

    radarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Matches", "Goals Scored", "Goals Allowed", "Goal Difference"],
            datasets: [
                {
                    label: team1.team,
                    data: [
                        team1.matches ?? 0,
                        team1.goals_scored ?? 0,
                        team1.goals_allowed ?? 0,
                        (team1.goals_scored ?? 0) - (team1.goals_allowed ?? 0)
                    ],
                    backgroundColor: "#00E5FF",
                    borderRadius: 10
                },
                {
                    label: team2.team,
                    data: [
                        team2.matches ?? 0,
                        team2.goals_scored ?? 0,
                        team2.goals_allowed ?? 0,
                        (team2.goals_scored ?? 0) - (team2.goals_allowed ?? 0)
                    ],
                    backgroundColor: "#FFCC00",
                    borderRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Head-to-Head Team Comparison",
                    color: "#ffffff",
                    font: { size: 24, weight: "bold" }
                },
                legend: {
                    labels: {
                        color: "#ffffff",
                        font: { size: 14, weight: "bold" }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#ffffff",
                        font: { weight: "bold" }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.12)" }
                }
            }
        }
    });
}

async function loadGoalsChart() {
const chartCard = document.querySelector(".chart-card");
const radarCard = document.querySelector(".radar-card");

if (chartCard) chartCard.style.display = "block";
if (radarCard) radarCard.style.display = "none";

const response = await fetch(`${API_URL}/teams`);
    const teams = await response.json();

    const topTeams = teams
        .sort((a, b) => (b.goals_scored ?? 0) - (a.goals_scored ?? 0))
        .slice(0, 8);

    const labels = topTeams.map(team => `${flags[team.team] || "⚽"} ${team.team}`);
    const goals = topTeams.map(team => team.goals_scored ?? 0);

    const ctx = document.getElementById("goalsChart");

    if (goalsChart) {
        goalsChart.destroy();
    }

    goalsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Goals Scored",
                data: goals,
                backgroundColor: [
                    "#00E5FF",
                    "#FFCC00",
                    "#00FF88",
                    "#FF4081",
                    "#7C4DFF",
                    "#FF6D00",
                    "#18FFFF",
                    "#F50057"
                ],
                borderRadius: 12,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Top Teams by Goals Scored",
                    color: "#ffffff",
                    font: { size: 24, weight: "bold" }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.12)" }
                },
                y: {
                    ticks: {
                        color: "#ffffff",
                        font: { size: 14, weight: "bold" }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    document.getElementById("output").innerHTML = "";
}

async function loadHomeDashboard() {
    hideCharts();

    const statsResponse = await fetch(`${API_URL}/stats`);
    const stats = await statsResponse.json();

    const teamsResponse = await fetch(`${API_URL}/teams`);
    const teams = await teamsResponse.json();

    const matchesResponse = await fetch(`${API_URL}/matches`);
    const matches = await matchesResponse.json();

    const topTeam = teams
        .sort((a, b) => (b.goals_scored ?? 0) - (a.goals_scored ?? 0))[0];

    document.getElementById("summary-cards").innerHTML = `
        <div class="summary-card">🏟️ <h3>${stats.total_matches}</h3><p>Matches</p></div>
        <div class="summary-card">⚽ <h3>${stats.total_goals}</h3><p>Total Goals</p></div>
        <div class="summary-card">📈 <h3>${stats.average_goals_per_match}</h3><p>Avg Goals</p></div>
        <div class="summary-card">🏆 <h3>${flags[topTeam.team] || "🏆"} ${topTeam.team}</h3><p>Top Team</p></div>
    `;

    const latestMatches = matches.slice(0, 5);
    const featured = matches[0];

    document.querySelector(".featured-content").innerHTML = `
        <span>Featured Match</span>
        <h2>${flags[featured.home_team] || "⚽"} ${featured.home_team}
            ${featured.home_score} - ${featured.away_score}
            ${flags[featured.away_team] || "⚽"} ${featured.away_team}</h2>
        <p>${featured.home_team} and ${featured.away_team} played one of the highlighted matches of the tournament.</p>
    `;

    document.getElementById("dynamic-matches").innerHTML = `
        <h2>Latest Matches</h2>
        <div class="match-cards">
            ${latestMatches.map(match => `
                <div class="match-card">
                    <div class="match-year">🏆 ${match.year}</div>

                    <div class="score">
                        ${match.home_score}
                        <span>-</span>
                        ${match.away_score}
                    </div>

                    <div class="teams">
                        <div>${flags[match.home_team] || "⚽"} ${match.home_team}</div>
                        <div>${flags[match.away_team] || "⚽"} ${match.away_team}</div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

window.onload = loadHomeDashboard;


async function loadRealMatches() {

    hideCharts();

    const response = await fetch(
        `${API_URL}/real-matches-clean`
    );

    const matches = await response.json();

    let rows = matches.slice(0, 20).map(match => `
        <tr>
            <td>${match.date.substring(0,10)}</td>
            <td>${match.home_team}</td>
            <td>${match.home_score ?? "-"}</td>
            <td>${match.away_score ?? "-"}</td>
            <td>${match.away_team}</td>
            <td>${match.status}</td>
        </tr>
    `).join("");

    document.getElementById("output").innerHTML = `
        <h2>Live Premier League Matches</h2>

        <table>
            <tr>
                <th>Date</th>
                <th>Home Team</th>
                <th>Home</th>
                <th>Away</th>
                <th>Away Team</th>
                <th>Status</th>
            </tr>

            ${rows}
        </table>
    `;
}
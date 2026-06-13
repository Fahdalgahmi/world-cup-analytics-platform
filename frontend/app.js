let goalsChart = null;

async function loadStats() {
    try {
        const response = await fetch("http://127.0.0.1:8000/stats");
        const data = await response.json();

        document.getElementById("output").innerHTML = `
            <h2>Statistics</h2>

            <div class="cards">
                <div class="card">
                    <h3>Total Matches</h3>
                    <p>${data.total_matches}</p>
                </div>

                <div class="card">
                    <h3>Total Goals</h3>
                    <p>${data.total_goals}</p>
                </div>

                <div class="card">
                    <h3>Average Goals</h3>
                    <p>${data.average_goals_per_match}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Stats error:", error);
        document.getElementById("output").innerHTML = `<p>Stats failed to load.</p>`;
    }
}

async function loadRankings() {
    try {
        const response = await fetch("http://127.0.0.1:8000/rankings");
        const data = await response.json();

        const flags = {
            "Argentina": "🇦🇷",
            "France": "🇫🇷",
            "Morocco": "🇲🇦",
            "Brazil": "🇧🇷",
            "Croatia": "🇭🇷",
            "Portugal": "🇵🇹",
            "England": "🏴",
            "Netherlands": "🇳🇱",
            "South Korea": "🇰🇷",
            "Switzerland": "🇨🇭",
            "Senegal": "🇸🇳",
            "Poland": "🇵🇱",
            "Spain": "🇪🇸",
            "Japan": "🇯🇵",
            "Australia": "🇦🇺",
            "USA": "🇺🇸"
        };

        let html = `
            <h2>Team Rankings</h2>
            <table>
                <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Points</th>
                    <th>Goals Scored</th>
                    <th>Goals Allowed</th>
                </tr>
        `;

        data.forEach((team, index) => {
            html += `
                <tr>
                    <td>#${index + 1}</td>
                    <td class="team-name">${flags[team.team] || "🏳️"} ${team.team}</td>
                    <td>${team.points}</td>
                    <td>${team.goals_scored}</td>
                    <td>${team.goals_allowed}</td>
                </tr>
            `;
        });

        html += `</table>`;
        document.getElementById("output").innerHTML = html;
    } catch (error) {
        console.error("Rankings error:", error);
        document.getElementById("output").innerHTML = `<p>Rankings failed to load.</p>`;
    }
}

async function searchTeam() {
    const teamName = document.getElementById("teamInput").value;

    if (teamName.trim() === "") {
        alert("Please enter a team name");
        return;
    }

    const response = await fetch(`http://127.0.0.1:8000/team/${teamName}`);
    const data = await response.json();

    if (data.error) {
        document.getElementById("output").innerHTML = `
            <h2>Team Not Found</h2>
            <p>Please try another team.</p>
        `;
        return;
    }

    document.getElementById("output").innerHTML = `
        <h2>${data.team} Team Analysis</h2>

        <div class="cards">
            <div class="card">
                <h3>Matches</h3>
                <p>${data.matches_played}</p>
            </div>

            <div class="card">
                <h3>Wins</h3>
                <p>${data.wins}</p>
            </div>

            <div class="card">
                <h3>Draws</h3>
                <p>${data.draws}</p>
            </div>

            <div class="card">
                <h3>Points</h3>
                <p>${data.points}</p>
            </div>
        </div>
    `;
}

async function loadGoalsChart() {
    try {
        const response = await fetch("http://127.0.0.1:8000/rankings");
        const data = await response.json();

        const teams = data.map(team => team.team);
        const goals = data.map(team => team.goals_scored);

        const ctx = document.getElementById("goalsChart");

        if (!ctx) {
            console.error("goalsChart canvas not found");
            return;
        }

        if (goalsChart) {
            goalsChart.destroy();
        }

        goalsChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: teams,
                datasets: [{
                    label: "Goals Scored",
                    data: goals,
                    borderWidth: 3
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: "right"
                    }
                }
            }
        });
    } catch (error) {
        console.error("Chart error:", error);
    }
}



async function compareTeams() {
    const teamOne = document.getElementById("teamOne").value;
    const teamTwo = document.getElementById("teamTwo").value;

    if (teamOne.trim() === "" || teamTwo.trim() === "") {
        alert("Please enter both teams");
        return;
    }

    const responseOne = await fetch(`http://127.0.0.1:8000/team/${teamOne}`);
    const responseTwo = await fetch(`http://127.0.0.1:8000/team/${teamTwo}`);

    const dataOne = await responseOne.json();
    const dataTwo = await responseTwo.json();

    if (dataOne.error || dataTwo.error) {
        document.getElementById("output").innerHTML = `
            <h2>Team Not Found</h2>
            <p>Please check both team names.</p>
        `;
        return;
    }

    document.getElementById("output").innerHTML = `
        <h2>${dataOne.team} vs ${dataTwo.team}</h2>

        <div class="comparison-grid">
            <div class="compare-card">
                <h3>${dataOne.team}</h3>
                <p>Points: ${dataOne.points}</p>
                <p>Wins: ${dataOne.wins}</p>
                <p>Draws: ${dataOne.draws}</p>
                <p>Losses: ${dataOne.losses}</p>
                <p>Goals Scored: ${dataOne.goals_scored}</p>
                <p>Goals Allowed: ${dataOne.goals_allowed}</p>
            </div>

            <div class="compare-card">
                <h3>${dataTwo.team}</h3>
                <p>Points: ${dataTwo.points}</p>
                <p>Wins: ${dataTwo.wins}</p>
                <p>Draws: ${dataTwo.draws}</p>
                <p>Losses: ${dataTwo.losses}</p>
                <p>Goals Scored: ${dataTwo.goals_scored}</p>
                <p>Goals Allowed: ${dataTwo.goals_allowed}</p>
            </div>
        </div>
    `;
}

window.addEventListener("load", function () {
    loadGoalsChart();
});
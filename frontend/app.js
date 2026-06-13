let goalsChart = null;

async function loadStats() {
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
}

async function loadRankings() {
    const response = await fetch("http://127.0.0.1:8000/rankings");
    const data = await response.json();

    const flags = {
        "Argentina": "🇦🇷",
        "France": "🇫🇷",
        "Morocco": "🇲🇦",
        "Brazil": "🇧🇷",
        "Croatia": "🇭🇷",
        "Portugal": "🇵🇹",
        "England": "🏴"
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
}

async function loadGoalsChart() {
    const response = await fetch("http://127.0.0.1:8000/rankings");
    const data = await response.json();

    const teams = data.map(team => team.team);
    const goals = data.map(team => team.goals_scored);

    const ctx = document.getElementById("goalsChart");

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
`;}

loadStats();
loadGoalsChart();
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

loadStats();
async function loadStats() {
    const response = await fetch("http://127.0.0.1:8000/stats");
    const data = await response.json();

    document.getElementById("output").innerHTML = `
        <h2>Statistics</h2>
        <p>Total Matches: ${data.total_matches}</p>
        <p>Total Goals: ${data.total_goals}</p>
        <p>Average Goals Per Match: ${data.average_goals_per_match}</p>
    `;
}

async function loadRankings() {
    const response = await fetch("http://127.0.0.1:8000/rankings");
    const data = await response.json();

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
                <td>${index + 1}</td>
                <td>${team.team}</td>
                <td>${team.points}</td>
                <td>${team.goals_scored}</td>
                <td>${team.goals_allowed}</td>
            </tr>
        `;
    });

    html += `</table>`;

    document.getElementById("output").innerHTML = html;
}
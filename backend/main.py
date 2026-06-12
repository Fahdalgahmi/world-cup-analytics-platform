from fastapi import FastAPI
import pandas as pd
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "matches.csv")

df = pd.read_csv(DATA_PATH)

@app.get("/")
def home():
    return {"message": "World Cup Analytics API is running"}

@app.get("/matches")
def get_matches():
    return df.to_dict(orient="records")

@app.get("/stats")
def get_stats():
    total_matches = len(df)
    total_goals = int(df["home_score"].sum() + df["away_score"].sum())
    avg_goals = round(total_goals / total_matches, 2)

    return {
        "total_matches": total_matches,
        "total_goals": total_goals,
        "average_goals_per_match": avg_goals
    }

@app.get("/teams")
def team_stats():

    teams = pd.concat([
        df["home_team"],
        df["away_team"]
    ]).unique()

    results = []

    for team in teams:

        home_games = df[df["home_team"] == team]
        away_games = df[df["away_team"] == team]

        goals_scored = (
            home_games["home_score"].sum() +
            away_games["away_score"].sum()
        )

        goals_allowed = (
            home_games["away_score"].sum() +
            away_games["home_score"].sum()
        )

        results.append({
            "team": team,
            "goals_scored": int(goals_scored),
            "goals_allowed": int(goals_allowed)
        })

    return results

@app.get("/team/{team_name}")
def get_team(team_name: str):
    team_name = team_name.title()

    home_games = df[df["home_team"] == team_name]
    away_games = df[df["away_team"] == team_name]

    matches_played = len(home_games) + len(away_games)

    if matches_played == 0:
        return {"error": "Team not found"}

    goals_scored = home_games["home_score"].sum() + away_games["away_score"].sum()
    goals_allowed = home_games["away_score"].sum() + away_games["home_score"].sum()

    wins = 0
    draws = 0
    losses = 0

    for _, row in df.iterrows():
        if row["home_team"] == team_name:
            if row["home_score"] > row["away_score"]:
                wins += 1
            elif row["home_score"] == row["away_score"]:
                draws += 1
            else:
                losses += 1

        if row["away_team"] == team_name:
            if row["away_score"] > row["home_score"]:
                wins += 1
            elif row["away_score"] == row["home_score"]:
                draws += 1
            else:
                losses += 1

    points = wins * 3 + draws


    return {
        "team": team_name,
        "matches_played": matches_played,
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "points": points,
        "goals_scored": int(goals_scored),
        "goals_allowed": int(goals_allowed)
    }

    
@app.get("/rankings")
def get_rankings():

    teams = pd.concat([
        df["home_team"],
        df["away_team"]
    ]).unique()

    rankings = []

    for team in teams:
        rankings.append(get_team(team))

    rankings = sorted(
        rankings,
        key=lambda x: (x["points"], x["goals_scored"] - x["goals_allowed"]),
        reverse=True
    )

    return rankings
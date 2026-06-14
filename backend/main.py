from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import requests
from dotenv import load_dotenv

load_dotenv()

FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY")
FOOTBALL_BASE_URL = "https://api.football-data.org/v4"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "results.csv")

df = pd.read_csv(DATA_PATH)

df = df[df["tournament"] == "FIFA World Cup"].copy()

df = df.dropna(subset=["home_score", "away_score"])

df["home_score"] = df["home_score"].astype(int)
df["away_score"] = df["away_score"].astype(int)

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

        matches = len(home_games) + len(away_games)

        results.append({
            "team": team,
            "matches": int(matches),
            "goals_scored": int(goals_scored),
            "goals_allowed": int(goals_allowed)
        })

    results = sorted(
        results,
        key=lambda x: x["goals_scored"],
        reverse=True
    )

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
        team_data = get_team(team)

        if "error" not in team_data:
            rankings.append(team_data)

    rankings = sorted(
        rankings,
        key=lambda x: (
            x.get("points", 0),
            x.get("goals_scored", 0) - x.get("goals_allowed", 0)
        ),
        reverse=True
    )

    return rankings


def football_headers():
    return {
        "X-Auth-Token": FOOTBALL_API_KEY
    }


@app.get("/real-competitions")
def get_real_competitions():
    url = f"{FOOTBALL_BASE_URL}/competitions"

    response = requests.get(url, headers=football_headers())

    return response.json()


@app.get("/real-premier-league")
def get_premier_league():
    url = f"{FOOTBALL_BASE_URL}/competitions/PL"

    response = requests.get(url, headers=football_headers())

    return response.json()


@app.get("/real-premier-league-matches")
def get_premier_league_matches():
    url = f"{FOOTBALL_BASE_URL}/competitions/PL/matches"

    response = requests.get(url, headers=football_headers())

    return response.json()

@app.get("/check-api-key")
def check_api_key():
    return {
        "key_loaded": FOOTBALL_API_KEY is not None,
        "key_length": len(FOOTBALL_API_KEY) if FOOTBALL_API_KEY else 0
    }

@app.get("/real-matches-clean")
def get_real_matches_clean():
    url = f"{FOOTBALL_BASE_URL}/competitions/PL/matches"

    response = requests.get(url, headers=football_headers())
    data = response.json()

    clean_matches = []

    for match in data.get("matches", []):
        clean_matches.append({
            "home_team": match["homeTeam"]["name"],
            "away_team": match["awayTeam"]["name"],
            "home_score": match["score"]["fullTime"]["home"],
            "away_score": match["score"]["fullTime"]["away"],
            "status": match["status"],
            "date": match["utcDate"]
        })

    return clean_matches

@app.get("/world-cup-count")
def world_cup_count():

    wc = df[df["tournament"] == "FIFA World Cup"]

    return {
        "world_cup_matches": len(wc)
    }

@app.get("/test-data")
def test_data():
    return {
        "rows": len(df),
        "columns": list(df.columns),
        "sample": df.head(3).to_dict(orient="records")
    }

@app.get("/top-world-cup-nations")
def top_world_cup_nations():
    teams = pd.concat([
        df["home_team"],
        df["away_team"]
    ]).unique()

    results = []

    for team in teams:
        team_data = get_team(team)

        if "error" not in team_data:
            goal_difference = team_data["goals_scored"] - team_data["goals_allowed"]

            results.append({
                "team": team_data["team"],
                "matches": team_data["matches_played"],
                "wins": team_data["wins"],
                "goals_scored": team_data["goals_scored"],
                "goals_allowed": team_data["goals_allowed"],
                "goal_difference": goal_difference,
                "points": team_data["points"]
            })

    results = sorted(
        results,
        key=lambda x: (x["wins"], x["goal_difference"], x["goals_scored"]),
        reverse=True
    )

    return results[:10]
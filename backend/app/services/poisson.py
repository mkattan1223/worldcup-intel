"""
Poisson score probability grid.
Given expected goals (xG) for home and away, returns an NxN probability matrix.
"""

import numpy as np
from scipy.stats import poisson


def score_probability_grid(
    home_xg: float,
    away_xg: float,
    max_goals: int = 7,
) -> dict:
    """
    Returns a probability matrix P[i][j] = P(home scores i, away scores j).
    Also returns win/draw/loss probabilities and the most likely scorelines.
    """
    home_probs = np.array([poisson.pmf(i, home_xg) for i in range(max_goals + 1)])
    away_probs = np.array([poisson.pmf(j, away_xg) for j in range(max_goals + 1)])

    grid = np.outer(home_probs, away_probs)

    home_win = float(np.sum(np.tril(grid, -1)))
    draw = float(np.sum(np.diag(grid)))
    away_win = float(np.sum(np.triu(grid, 1)))

    flat = grid.flatten()
    top_indices = np.argsort(flat)[::-1][:5]
    top_scorelines = []
    for idx in top_indices:
        h, a = divmod(int(idx), max_goals + 1)
        top_scorelines.append({"home": h, "away": a, "probability": float(grid[h, a])})

    return {
        "grid": grid.tolist(),
        "labels": list(range(max_goals + 1)),
        "home_win_prob": home_win,
        "draw_prob": draw,
        "away_win_prob": away_win,
        "top_scorelines": top_scorelines,
    }

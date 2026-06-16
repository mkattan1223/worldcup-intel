"""
Six Sigma control chart utilities.
Computes UCL/LCL for an individual measurement (I-MR) chart
applied to team performance metrics over time.
"""

import numpy as np
from typing import Sequence


def imr_control_limits(values: Sequence[float]) -> dict:
    """
    Individual and Moving Range (I-MR) chart.
    Returns center line, UCL, LCL, and a list of out-of-control points.
    """
    arr = np.array(values, dtype=float)
    if len(arr) < 2:
        raise ValueError("Need at least 2 data points for I-MR chart")

    mr = np.abs(np.diff(arr))
    mr_bar = float(np.mean(mr))
    x_bar = float(np.mean(arr))

    # d2 constant for n=2 subgroup
    d2 = 1.128
    d3 = 0.853
    D3 = 0.0
    D4 = 3.267

    sigma_hat = mr_bar / d2

    ucl_i = x_bar + 3 * sigma_hat
    lcl_i = x_bar - 3 * sigma_hat
    ucl_mr = D4 * mr_bar
    lcl_mr = D3 * mr_bar

    out_of_control = [
        {"index": i, "value": float(v)}
        for i, v in enumerate(arr)
        if v > ucl_i or v < lcl_i
    ]

    return {
        "values": arr.tolist(),
        "moving_ranges": mr.tolist(),
        "center_line": x_bar,
        "ucl": ucl_i,
        "lcl": lcl_i,
        "mr_center": mr_bar,
        "mr_ucl": ucl_mr,
        "mr_lcl": lcl_mr,
        "sigma": sigma_hat,
        "out_of_control": out_of_control,
    }

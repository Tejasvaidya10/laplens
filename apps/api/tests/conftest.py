"""
Pytest fixtures and configuration
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def mock_telemetry_data():
    """Mock telemetry comparison data"""
    return {
        "driverA": {
            "driver": "VER",
            "lapNumber": 1,
            "lapTime": 90.123,
            "data": [
                {"distance": 0, "speed": 0, "throttle": 0, "brake": 0, "gear": 1},
                {"distance": 100, "speed": 150, "throttle": 100, "brake": 0, "gear": 3},
                {"distance": 200, "speed": 200, "throttle": 100, "brake": 0, "gear": 5},
            ]
        },
        "driverB": {
            "driver": "HAM",
            "lapNumber": 1,
            "lapTime": 90.456,
            "data": [
                {"distance": 0, "speed": 0, "throttle": 0, "brake": 0, "gear": 1},
                {"distance": 100, "speed": 148, "throttle": 100, "brake": 0, "gear": 3},
                {"distance": 200, "speed": 198, "throttle": 100, "brake": 0, "gear": 5},
            ]
        },
        "delta": [
            {"distance": 0, "delta": 0},
            {"distance": 100, "delta": 0.05},
            {"distance": 200, "delta": 0.10},
        ]
    }


@pytest.fixture
def mock_strategy_data():
    """Mock strategy data"""
    return {
        "stints": [
            {
                "driver": "VER",
                "stintNumber": 1,
                "compound": "SOFT",
                "startLap": 1,
                "endLap": 20,
                "laps": 20
            },
            {
                "driver": "VER",
                "stintNumber": 2,
                "compound": "MEDIUM",
                "startLap": 21,
                "endLap": 50,
                "laps": 30
            }
        ],
        "pitStops": [
            {"driver": "VER", "lap": 21, "duration": 2.5}
        ],
        "totalLaps": 50
    }

"""
Tests for API endpoints
"""

import pytest


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert data["version"] == "1.0.0"


def test_seasons_endpoint(client):
    """Test seasons endpoint"""
    response = client.get("/seasons")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check first season has required fields
    season = data[0]
    assert "year" in season
    assert "name" in season


def test_events_endpoint_requires_season(client):
    """Test events endpoint requires season parameter"""
    response = client.get("/events")
    assert response.status_code == 422  # Validation error


def test_events_endpoint_invalid_season(client):
    """Test events endpoint with invalid season"""
    response = client.get("/events?season=1900")
    assert response.status_code == 422  # Validation error (outside range)


def test_sessions_endpoint_requires_params(client):
    """Test sessions endpoint requires parameters"""
    response = client.get("/sessions")
    assert response.status_code == 422
    
    response = client.get("/sessions?season=2024")
    assert response.status_code == 422


def test_drivers_endpoint_requires_params(client):
    """Test drivers endpoint requires parameters"""
    response = client.get("/drivers")
    assert response.status_code == 422


def test_telemetry_compare_requires_body(client):
    """Test telemetry compare requires request body"""
    response = client.post("/telemetry/compare")
    assert response.status_code == 422


def test_telemetry_compare_validation(client):
    """Test telemetry compare validates request body"""
    response = client.post(
        "/telemetry/compare",
        json={
            "season": 2024,
            "event": "Bahrain",
            # Missing required fields
        }
    )
    assert response.status_code == 422


def test_strategy_endpoint_requires_params(client):
    """Test strategy endpoint requires parameters"""
    response = client.get("/strategy")
    assert response.status_code == 422


def test_positions_endpoint_requires_params(client):
    """Test positions endpoint requires parameters"""
    response = client.get("/positions")
    assert response.status_code == 422


def test_track_evolution_endpoint_requires_params(client):
    """Test track evolution endpoint requires parameters"""
    response = client.get("/track-evolution")
    assert response.status_code == 422


def test_saved_analyses_requires_auth(client):
    """Test saved analyses endpoints require authentication"""
    # GET list
    response = client.get("/saved-analyses")
    assert response.status_code == 401
    
    # POST create
    response = client.post(
        "/saved-analyses",
        json={
            "name": "Test",
            "season": 2024,
            "event": "Bahrain",
            "session": "R",
            "driverA": "VER",
            "driverB": "HAM",
        }
    )
    assert response.status_code == 401
    
    # GET single
    response = client.get("/saved-analyses/123")
    assert response.status_code == 401
    
    # DELETE
    response = client.delete("/saved-analyses/123")
    assert response.status_code == 401


def test_rate_limit_headers(client):
    """Test rate limit headers are present"""
    response = client.get("/seasons")
    
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers
    assert "X-RateLimit-Reset" in response.headers

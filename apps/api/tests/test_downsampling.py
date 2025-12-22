"""
Tests for downsampling utilities
"""

import pytest
from app.utils.downsampling import downsample_lttb, downsample_simple


def test_lttb_no_downsampling_needed():
    """Test LTTB when data is already small enough"""
    x = [1, 2, 3, 4, 5]
    y = [10, 20, 15, 25, 30]
    
    indices = downsample_lttb(x, y, target_points=10)
    
    # Should return all indices
    assert indices == [0, 1, 2, 3, 4]


def test_lttb_basic_downsampling():
    """Test basic LTTB downsampling"""
    # Generate 100 points
    x = list(range(100))
    y = [i * 2 for i in range(100)]  # Linear data
    
    indices = downsample_lttb(x, y, target_points=10)
    
    # Should return exactly 10 points
    assert len(indices) == 10
    
    # First and last should always be included
    assert indices[0] == 0
    assert indices[-1] == 99
    
    # Indices should be sorted
    assert indices == sorted(indices)


def test_lttb_preserves_shape():
    """Test LTTB preserves data shape"""
    # Create data with a clear peak
    x = list(range(100))
    y = [0] * 40 + [100] + [0] * 59  # Peak at index 40
    
    indices = downsample_lttb(x, y, target_points=20)
    
    # The peak should be preserved (or close to it)
    peak_preserved = any(39 <= idx <= 41 for idx in indices)
    assert peak_preserved, "Peak should be preserved in downsampled data"


def test_lttb_minimum_points():
    """Test LTTB with minimum target points"""
    x = list(range(100))
    y = [i ** 2 for i in range(100)]
    
    indices = downsample_lttb(x, y, target_points=3)
    
    assert len(indices) == 3
    assert indices[0] == 0
    assert indices[-1] == 99


def test_lttb_empty_data():
    """Test LTTB with empty data"""
    indices = downsample_lttb([], [], target_points=10)
    assert indices == []


def test_lttb_single_point():
    """Test LTTB with single point"""
    indices = downsample_lttb([1], [10], target_points=10)
    assert indices == [0]


def test_downsample_simple():
    """Test simple downsampling helper"""
    data = [
        {"distance": 0, "speed": 0},
        {"distance": 100, "speed": 100},
        {"distance": 200, "speed": 150},
        {"distance": 300, "speed": 200},
        {"distance": 400, "speed": 180},
    ]
    
    # No downsampling needed
    result = downsample_simple(data, target_points=10)
    assert len(result) == 5
    
    # Downsampling needed
    result = downsample_simple(data, target_points=3)
    assert len(result) == 3
    assert result[0]["distance"] == 0
    assert result[-1]["distance"] == 400


def test_downsample_simple_custom_keys():
    """Test simple downsampling with custom keys"""
    data = [
        {"x": i, "y": i * 2}
        for i in range(100)
    ]
    
    result = downsample_simple(data, target_points=10, x_key="x", y_key="y")
    
    assert len(result) == 10
    assert result[0]["x"] == 0
    assert result[-1]["x"] == 99


def test_lttb_maintains_data_integrity():
    """Test that LTTB doesn't modify original indices"""
    x = list(range(50))
    y = [i % 10 for i in range(50)]  # Oscillating pattern
    
    indices = downsample_lttb(x, y, target_points=10)
    
    # All indices should be valid
    assert all(0 <= idx < 50 for idx in indices)
    
    # No duplicate indices
    assert len(indices) == len(set(indices))


def test_lttb_realistic_telemetry():
    """Test LTTB with realistic telemetry-like data"""
    # Simulate speed trace: acceleration, coast, brake
    distances = list(range(0, 5000, 10))  # 0-5000m
    speeds = []
    for d in distances:
        if d < 1000:
            speeds.append(d * 0.3)  # Acceleration
        elif d < 2500:
            speeds.append(300)  # Top speed
        elif d < 3500:
            speeds.append(300 - (d - 2500) * 0.2)  # Braking
        else:
            speeds.append(100)  # Slow section
    
    indices = downsample_lttb(distances, speeds, target_points=100)
    
    assert len(indices) == 100
    
    # Verify important transitions are captured
    # (acceleration zone and braking zone changes)
    downsampled_distances = [distances[i] for i in indices]
    downsampled_speeds = [speeds[i] for i in indices]
    
    # Check we have variation in the data
    speed_range = max(downsampled_speeds) - min(downsampled_speeds)
    assert speed_range > 150, "Should preserve speed variation"

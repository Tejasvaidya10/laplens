"""
Downsampling utilities using Largest-Triangle-Three-Buckets (LTTB) algorithm
"""

from typing import List, Tuple
import math


def downsample_lttb(
    x_data: List[float],
    y_data: List[float],
    target_points: int
) -> List[int]:
    """
    Downsample data using LTTB algorithm.
    
    Returns indices of the points to keep.
    
    The LTTB algorithm preserves the visual shape of the data while
    reducing the number of points. It works by:
    1. Always keeping the first and last points
    2. Dividing remaining points into buckets
    3. For each bucket, selecting the point that forms the largest triangle
       with the selected points from adjacent buckets
    
    Args:
        x_data: X values (e.g., distance)
        y_data: Y values (e.g., speed)
        target_points: Number of points to keep
    
    Returns:
        List of indices to keep
    """
    n = len(x_data)
    
    if n <= target_points or target_points < 3:
        return list(range(n))
    
    # Always keep first and last points
    sampled_indices = [0]
    
    # Bucket size (excluding first and last points)
    bucket_size = (n - 2) / (target_points - 2)
    
    # Previous selected point
    prev_idx = 0
    
    for i in range(target_points - 2):
        # Calculate bucket boundaries
        bucket_start = int(math.floor((i + 0) * bucket_size) + 1)
        bucket_end = int(math.floor((i + 1) * bucket_size) + 1)
        
        # Calculate average point for the next bucket
        next_bucket_start = int(math.floor((i + 1) * bucket_size) + 1)
        next_bucket_end = int(math.floor((i + 2) * bucket_size) + 1)
        next_bucket_end = min(next_bucket_end, n - 1)
        
        # Average of next bucket
        avg_x = sum(x_data[next_bucket_start:next_bucket_end + 1]) / (next_bucket_end - next_bucket_start + 1)
        avg_y = sum(y_data[next_bucket_start:next_bucket_end + 1]) / (next_bucket_end - next_bucket_start + 1)
        
        # Find point in current bucket with largest triangle area
        max_area = -1.0
        max_idx = bucket_start
        
        # Previous point
        prev_x = x_data[prev_idx]
        prev_y = y_data[prev_idx]
        
        for j in range(bucket_start, min(bucket_end + 1, n - 1)):
            # Calculate triangle area using cross product
            area = abs(
                (prev_x - avg_x) * (y_data[j] - prev_y) -
                (prev_x - x_data[j]) * (avg_y - prev_y)
            ) * 0.5
            
            if area > max_area:
                max_area = area
                max_idx = j
        
        sampled_indices.append(max_idx)
        prev_idx = max_idx
    
    # Always include last point
    sampled_indices.append(n - 1)
    
    return sampled_indices


def downsample_simple(
    data: List[dict],
    target_points: int,
    x_key: str = "distance",
    y_key: str = "speed"
) -> List[dict]:
    """
    Downsample a list of dictionaries using LTTB.
    
    Args:
        data: List of data point dictionaries
        target_points: Number of points to keep
        x_key: Key for x values in dictionaries
        y_key: Key for y values in dictionaries
    
    Returns:
        Downsampled list of dictionaries
    """
    if len(data) <= target_points:
        return data
    
    x_data = [d[x_key] for d in data]
    y_data = [d[y_key] for d in data]
    
    indices = downsample_lttb(x_data, y_data, target_points)
    
    return [data[i] for i in indices]

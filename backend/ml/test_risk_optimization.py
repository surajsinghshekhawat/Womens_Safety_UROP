"""
Test script to verify risk scoring optimization
Shows before/after comparison
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.storage import get_incident_count
from app.ml.risk_scoring import calculate_risk_score


def test_risk_optimization():
    """Test optimized risk scoring"""
    print("=" * 60)
    print("Testing Optimized Risk Scoring")
    print("=" * 60)
    
    # Check if data is loaded
    incident_count = get_incident_count()
    
    if incident_count == 0:
        print("Loading data...")
        from app.data.chennai_mock_data import load_chennai_mock_data_into_storage
        load_chennai_mock_data_into_storage(count=5000)
        incident_count = get_incident_count()
        print(f"[OK] Loaded {incident_count} incidents")
    else:
        print(f"[OK] Found {incident_count} incidents")
    
    # Test locations with different expected risk levels
    test_locations = [
        {"name": "Central Station (High Risk)", "lat": 13.0827, "lng": 80.2707},
        {"name": "Marina Beach (High Risk)", "lat": 13.0475, "lng": 80.2825},
        {"name": "Koyambedu Bus Stand (High Risk)", "lat": 13.0710, "lng": 80.1980},
        {"name": "Adyar Residential (Low Risk)", "lat": 13.0067, "lng": 80.2206},
        {"name": "Besant Nagar (Low Risk)", "lat": 12.9990, "lng": 80.2640},
        {"name": "Random Low-Density Area", "lat": 12.9500, "lng": 80.2000},
    ]
    
    print("\nRisk Scores for Test Locations:")
    print("-" * 60)
    
    results = []
    
    for location in test_locations:
        risk_data = calculate_risk_score(location["lat"], location["lng"])
        results.append({
            "name": location["name"],
            **risk_data
        })
        
        print(f"\n{location['name']}:")
        print(f"  Risk Score: {risk_data['risk_score']:.2f}/5.0")
        print(f"  Risk Level: {risk_data['risk_level'].replace('_', ' ').title()}")
        print(f"  Factors:")
        factors = risk_data.get('factors', {})
        print(f"    - Density: {factors.get('incident_density', 0):.3f}")
        print(f"    - Recency: {factors.get('recency', 0):.3f}")
        print(f"    - Severity: {factors.get('severity', 0):.3f}")
        print(f"    - Time Pattern: {factors.get('time_pattern', 0):.3f}")
    
    # Statistics
    print("\n" + "=" * 60)
    print("Risk Score Statistics:")
    print("=" * 60)
    
    risk_scores = [r['risk_score'] for r in results]
    risk_levels = {}
    
    for result in results:
        level = result['risk_level']
        risk_levels[level] = risk_levels.get(level, 0) + 1
    
    print(f"\nScore Range: {min(risk_scores):.2f} - {max(risk_scores):.2f}")
    print(f"Average: {sum(risk_scores) / len(risk_scores):.2f}")
    print(f"Standard Deviation: {((sum((x - sum(risk_scores)/len(risk_scores))**2 for x in risk_scores) / len(risk_scores))**0.5):.2f}")
    
    print(f"\nRisk Level Distribution:")
    for level, count in risk_levels.items():
        print(f"  - {level.replace('_', ' ').title()}: {count}")
    
    # Check variation
    score_range = max(risk_scores) - min(risk_scores)
    if score_range > 2.0:
        print(f"\n[OK] Good variation! Score range: {score_range:.2f}")
    elif score_range > 1.0:
        print(f"\n[WARNING] Moderate variation. Score range: {score_range:.2f}")
    else:
        print(f"\n[WARNING] Low variation. Score range: {score_range:.2f}")
        print("  Consider further optimization")
    
    print("\n" + "=" * 60)
    print("[OK] Risk Scoring Optimization Test Complete!")
    print("=" * 60)


if __name__ == "__main__":
    test_risk_optimization()


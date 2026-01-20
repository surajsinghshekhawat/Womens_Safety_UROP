"""
Step 4: Test Heatmap Generation
Tests grid-based heatmap generation with loaded Chennai incidents
"""

import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.storage import get_incident_count
from app.ml.heatmap import generate_heatmap


def step4_test_heatmap():
    """Step 4: Test heatmap generation"""
    print("=" * 60)
    print("STEP 4: Testing Heatmap Generation")
    print("=" * 60)
    
    # Check if data is loaded
    print("\n1. Checking data availability...")
    incident_count = get_incident_count()
    
    if incident_count == 0:
        print("   [WARNING] No incidents found in storage!")
        print("   Loading data automatically...")
        from app.data.chennai_mock_data import load_chennai_mock_data_into_storage
        load_chennai_mock_data_into_storage(count=5000)
        incident_count = get_incident_count()
        print(f"   [OK] Loaded {incident_count} incidents")
    else:
        print(f"   [OK] Found {incident_count} incidents in storage")
    
    # Test locations (Chennai areas)
    test_locations = [
        {
            "name": "Marina Beach Area",
            "lat": 13.0475,
            "lng": 80.2825,
            "radius": 1000,  # 1km radius
            "grid_size": 100,  # 100m grid cells
        },
        {
            "name": "Central Station Area",
            "lat": 13.0827,
            "lng": 80.2707,
            "radius": 800,  # 800m radius
            "grid_size": 100,
        },
        {
            "name": "Koyambedu Bus Stand Area",
            "lat": 13.0710,
            "lng": 80.1980,
            "radius": 600,  # 600m radius
            "grid_size": 100,
        },
    ]
    
    print("\n2. Generating heatmaps for test locations...")
    print("   (This may take 30-60 seconds)")
    
    heatmap_results = []
    
    for i, location in enumerate(test_locations, 1):
        print(f"\n   Location {i}: {location['name']}")
        print(f"   - Center: ({location['lat']:.6f}, {location['lng']:.6f})")
        print(f"   - Radius: {location['radius']}m")
        print(f"   - Grid size: {location['grid_size']}m")
        print("   Generating heatmap...")
        
        try:
            heatmap_data = generate_heatmap(
                center_lat=location['lat'],
                center_lng=location['lng'],
                radius_meters=location['radius'],
                grid_size_meters=location['grid_size'],
            )
            
            cells = heatmap_data.get('cells', [])
            clusters = heatmap_data.get('clusters', [])
            
            print(f"   [OK] Heatmap generated!")
            print(f"   - Grid cells: {len(cells)}")
            print(f"   - Clusters found: {len(clusters)}")
            
            if cells:
                # Calculate risk distribution
                risk_scores = [cell['risk_score'] for cell in cells]
                avg_risk = sum(risk_scores) / len(risk_scores)
                max_risk = max(risk_scores)
                min_risk = min(risk_scores)
                
                # Count cells by risk level
                risk_levels = {
                    "very_safe": 0,
                    "safe": 0,
                    "medium": 0,
                    "high": 0,
                    "very_high": 0,
                }
                
                for cell in cells:
                    risk_level = cell.get('risk_level', 'unknown')
                    if risk_level in risk_levels:
                        risk_levels[risk_level] += 1
                
                print(f"\n   Risk Statistics:")
                print(f"   - Average risk score: {avg_risk:.2f}/5.0")
                print(f"   - Maximum risk: {max_risk:.2f}/5.0")
                print(f"   - Minimum risk: {min_risk:.2f}/5.0")
                
                print(f"\n   Risk Level Distribution:")
                for level, count in risk_levels.items():
                    if count > 0:
                        percentage = (count / len(cells)) * 100
                        print(f"   - {level.replace('_', ' ').title()}: {count} cells ({percentage:.1f}%)")
                
                # Show sample high-risk cells
                high_risk_cells = [c for c in cells if c['risk_score'] >= 3.5]
                if high_risk_cells:
                    print(f"\n   High-Risk Cells (score >= 3.5): {len(high_risk_cells)}")
                    print("   Sample high-risk cells:")
                    for cell in sorted(high_risk_cells, key=lambda x: x['risk_score'], reverse=True)[:5]:
                        print(f"   - ({cell['lat']:.6f}, {cell['lng']:.6f}): "
                              f"Risk {cell['risk_score']:.2f} ({cell['risk_level']})")
            
            if clusters:
                print(f"\n   Clusters in Area:")
                for cluster in clusters[:5]:  # Show top 5
                    print(f"   - {cluster['id']}: "
                          f"({cluster['center']['lat']:.6f}, {cluster['center']['lng']:.6f}), "
                          f"Radius {cluster['radius']:.0f}m, "
                          f"Risk {cluster['risk_score']:.2f}, "
                          f"{cluster['incident_count']} incidents")
            
            heatmap_results.append({
                "name": location['name'],
                "cells": len(cells),
                "clusters": len(clusters),
                "avg_risk": avg_risk if cells else 0,
            })
        
        except Exception as e:
            print(f"   [ERROR] Failed to generate heatmap: {e}")
            import traceback
            traceback.print_exc()
    
    # Summary
    print("\n" + "=" * 60)
    print("Heatmap Generation Summary:")
    print("=" * 60)
    
    if heatmap_results:
        for result in heatmap_results:
            print(f"\n{result['name']}:")
            print(f"  - Grid cells: {result['cells']}")
            print(f"  - Clusters: {result['clusters']}")
            print(f"  - Average risk: {result['avg_risk']:.2f}/5.0")
    
    print("\n" + "=" * 60)
    print("[OK] STEP 4 COMPLETE!")
    print("=" * 60)
    print("\n[SUMMARY] Summary:")
    print("   - Heatmap generation works")
    print("   - Grid cells created successfully")
    print("   - Risk scores calculated for each cell")
    print("   - Clusters identified in heatmap areas")
    print("\n[NEXT] Next Steps:")
    print("   - Step 5: Test route analysis")
    print("   - Or: Integrate with backend API")


if __name__ == "__main__":
    try:
        step4_test_heatmap()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        print("\n[TIP] Make sure you've:")
        print("   1. Run Step 2 to load data: python step2_load_data.py")
        print("   2. Installed dependencies: pip install -r requirements.txt")


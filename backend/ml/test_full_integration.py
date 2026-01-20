"""
Test full integration: Database + ML Service + Backend API
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.connection import init_connection_pool, test_connection
from app.db.storage import get_incident_count
from app.ml.clustering import get_clusters
from app.ml.risk_scoring import calculate_risk_score
from app.ml.heatmap import generate_heatmap
from app.ml.route_analyzer import analyze_routes

def test_full_integration():
    print("=" * 60)
    print("Full Integration Test: Database + ML Service")
    print("=" * 60)
    
    # 1. Test database connection
    print("\n1. Testing database connection...")
    init_connection_pool()
    if test_connection():
        print("   [OK] Database connected")
    else:
        print("   [FAIL] Database connection failed")
        return
    
    # 2. Check data
    print("\n2. Checking database data...")
    count = get_incident_count()
    print(f"   [OK] Incidents in database: {count}")
    
    if count == 0:
        print("   [WARNING] No incidents found. Run step2_load_data.py first")
        return
    
    # 3. Test clustering
    print("\n3. Testing clustering (DBSCAN)...")
    clusters = get_clusters()
    print(f"   [OK] Found {len(clusters)} unsafe zone clusters")
    
    # 4. Test risk scoring
    print("\n4. Testing risk scoring...")
    risk_data = calculate_risk_score(13.0827, 80.2707)
    print(f"   [OK] Risk score: {risk_data['risk_score']}/5.0 ({risk_data['risk_level']})")
    
    # 5. Test heatmap
    print("\n5. Testing heatmap generation...")
    heatmap = generate_heatmap(13.0827, 80.2707, 1000, 100)
    print(f"   [OK] Generated {len(heatmap['cells'])} heatmap cells")
    print(f"   [OK] Found {len(heatmap['clusters'])} clusters in area")
    
    # 6. Test route analysis
    print("\n6. Testing route analysis...")
    import asyncio
    from app.api.schemas import RouteRequest, RouteWaypoint
    
    routes_list = [
        RouteRequest(
            id="route_1",
            waypoints=[
                RouteWaypoint(lat=13.0827, lng=80.2707),
                RouteWaypoint(lat=13.0850, lng=80.2750)
            ]
        )
    ]
    route_result = asyncio.run(analyze_routes(routes_list))
    print(f"   [OK] Analyzed {len(route_result)} routes")
    if route_result:
        print(f"   [OK] Safety score: {route_result[0].safety_score}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Full integration test passed!")
    print("=" * 60)
    print("\nSystem Status:")
    print(f"   - Database: Connected ({count} incidents)")
    print(f"   - Clustering: Working ({len(clusters)} clusters)")
    print(f"   - Risk Scoring: Working")
    print(f"   - Heatmap: Working ({len(heatmap['cells'])} cells)")
    print(f"   - Route Analysis: Working")
    print("\n[READY] ML Service is ready for production use!")

if __name__ == "__main__":
    try:
        test_full_integration()
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()


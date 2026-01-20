"""
Step 5: Test Route Analysis
Tests route safety analysis with loaded Chennai incidents
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

import asyncio
from app.db.storage import get_incident_count
from app.ml.route_analyzer import analyze_routes
from app.api.schemas import RouteRequest, RouteWaypoint


def step5_test_routes():
    """Step 5: Test route analysis"""
    print("=" * 60)
    print("STEP 5: Testing Route Analysis")
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
    
    # Test routes in Chennai
    print("\n2. Creating test routes...")
    
    # Route 1: Through high-risk area (Central Station)
    route1 = RouteRequest(
        id="route_through_station",
        waypoints=[
            RouteWaypoint(lat=13.0750, lng=80.2600),  # Start: Near Egmore
            RouteWaypoint(lat=13.0827, lng=80.2707),  # Through: Central Station (high risk)
            RouteWaypoint(lat=13.0900, lng=80.2800),  # End: North Chennai
        ]
    )
    
    # Route 2: Around high-risk area (safer alternative)
    route2 = RouteRequest(
        id="route_around_station",
        waypoints=[
            RouteWaypoint(lat=13.0750, lng=80.2600),  # Start: Near Egmore
            RouteWaypoint(lat=13.0800, lng=80.2650),  # Around: Avoids Central Station
            RouteWaypoint(lat=13.0850, lng=80.2750),  # Around: Residential area
            RouteWaypoint(lat=13.0900, lng=80.2800),  # End: North Chennai
        ]
    )
    
    # Route 3: Through Marina Beach area
    route3 = RouteRequest(
        id="route_marina_beach",
        waypoints=[
            RouteWaypoint(lat=13.0400, lng=80.2700),  # Start: South Chennai
            RouteWaypoint(lat=13.0475, lng=80.2825),  # Through: Marina Beach (high risk)
            RouteWaypoint(lat=13.0550, lng=80.2900),  # End: North Marina
        ]
    )
    
    # Route 4: Residential area (low risk)
    route4 = RouteRequest(
        id="route_residential",
        waypoints=[
            RouteWaypoint(lat=13.0000, lng=80.2200),  # Start: Adyar
            RouteWaypoint(lat=13.0100, lng=80.2300),  # Through: Residential
            RouteWaypoint(lat=13.0200, lng=80.2400),  # End: Besant Nagar
        ]
    )
    
    test_routes = [route1, route2, route3, route4]
    
    print(f"   [OK] Created {len(test_routes)} test routes")
    
    # Analyze routes
    print("\n3. Analyzing route safety...")
    print("   (This may take 10-20 seconds)")
    
    try:
        # analyze_routes is async, so we need to await it
        routes_analysis = asyncio.run(analyze_routes(test_routes))
        
        print(f"   [OK] Analysis completed!")
        print(f"   [OK] Analyzed {len(routes_analysis)} routes")
        
        print("\n" + "=" * 60)
        print("Route Analysis Results:")
        print("=" * 60)
        
        for analysis in routes_analysis:
            print(f"\nRoute: {analysis.id}")
            print("-" * 60)
            print(f"  Safety Score: {analysis.safety_score:.3f}/1.0 (higher = safer)")
            print(f"  Risk Score: {analysis.risk_score:.2f}/5.0 (lower = safer)")
            print(f"  Total Distance: {analysis.total_distance:.0f} meters")
            print(f"  Safe Distance: {analysis.safe_distance:.0f} meters")
            
            # Determine safety level
            if analysis.safety_score >= 0.8:
                safety_level = "Very Safe"
            elif analysis.safety_score >= 0.6:
                safety_level = "Safe"
            elif analysis.safety_score >= 0.4:
                safety_level = "Moderate Risk"
            elif analysis.safety_score >= 0.2:
                safety_level = "High Risk"
            else:
                safety_level = "Very High Risk"
            
            print(f"  Safety Level: {safety_level}")
            
            # High-risk segments
            if analysis.high_risk_segments:
                print(f"\n  High-Risk Segments ({len(analysis.high_risk_segments)}):")
                for i, segment in enumerate(analysis.high_risk_segments[:5], 1):  # Show top 5
                    print(f"    {i}. Risk {segment.risk_score:.2f}: "
                          f"({segment.start.lat:.6f}, {segment.start.lng:.6f}) -> "
                          f"({segment.end.lat:.6f}, {segment.end.lng:.6f})")
                if len(analysis.high_risk_segments) > 5:
                    print(f"    ... and {len(analysis.high_risk_segments) - 5} more")
            else:
                print(f"\n  High-Risk Segments: None (all segments are relatively safe)")
        
        # Find recommended route
        if routes_analysis:
            recommended = max(routes_analysis, key=lambda r: r.safety_score)
            print("\n" + "=" * 60)
            print("Recommended Route:")
            print("=" * 60)
            print(f"  Route ID: {recommended.id}")
            print(f"  Safety Score: {recommended.safety_score:.3f}/1.0")
            print(f"  Risk Score: {recommended.risk_score:.2f}/5.0")
            print(f"  Distance: {recommended.total_distance:.0f} meters")
            print(f"  High-Risk Segments: {len(recommended.high_risk_segments)}")
        
        # Comparison
        print("\n" + "=" * 60)
        print("Route Comparison:")
        print("=" * 60)
        
        sorted_routes = sorted(routes_analysis, key=lambda r: r.safety_score, reverse=True)
        
        print("\nRoutes ranked by safety (best to worst):")
        for i, route in enumerate(sorted_routes, 1):
            print(f"  {i}. {route.id}: "
                  f"Safety {route.safety_score:.3f}, "
                  f"Risk {route.risk_score:.2f}, "
                  f"Distance {route.total_distance:.0f}m")
        
    except Exception as e:
        print(f"   [ERROR] Route analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 60)
    print("[OK] STEP 5 COMPLETE!")
    print("=" * 60)
    print("\n[SUMMARY] Summary:")
    print("   - Route analysis works")
    print("   - Safety scores calculated")
    print("   - High-risk segments identified")
    print("   - Route recommendations working")
    print("\n[NEXT] Next Steps:")
    print("   - Integrate with backend API")
    print("   - Connect to mobile app")
    print("   - Test end-to-end flow")


if __name__ == "__main__":
    try:
        step5_test_routes()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        print("\n[TIP] Make sure you've:")
        print("   1. Run Step 2 to load data: python step2_load_data.py")
        print("   2. Installed dependencies: pip install -r requirements.txt")


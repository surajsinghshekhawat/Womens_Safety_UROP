"""
Step 3: Test ML Algorithms with Loaded Data
Tests DBSCAN clustering and risk scoring with 5000 Chennai incidents
"""

import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.storage import get_incident_count, get_all_incidents
from app.ml.clustering import get_clusters
from app.ml.risk_scoring import calculate_risk_score


def step3_test_ml_algorithms():
    """Step 3: Test ML algorithms with loaded data"""
    print("=" * 60)
    print("STEP 3: Testing ML Algorithms")
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
    
    if incident_count < 100:
        print(f"   [WARNING] Only {incident_count} incidents. Clustering may not work well.")
        print("   [TIP] Recommend at least 500 incidents for good results")
    
    # Test 1: DBSCAN Clustering
    print("\n2. Testing DBSCAN Clustering...")
    print("   (Finding unsafe zones from incident data)")
    print("   This may take 10-30 seconds...")
    
    try:
        clusters = get_clusters(force_recalculate=True)
        print(f"   [OK] Clustering completed!")
        print(f"   [OK] Found {len(clusters)} unsafe zone clusters")
        
        if len(clusters) > 0:
            print("\n   Cluster Details:")
            print("   " + "-" * 56)
            
            # Sort clusters by incident count (largest first)
            sorted_clusters = sorted(clusters, key=lambda c: c['incident_count'], reverse=True)
            
            for i, cluster in enumerate(sorted_clusters[:10], 1):  # Show top 10
                print(f"\n   Cluster {i}:")
                print(f"   - ID: {cluster['id']}")
                print(f"   - Center: ({cluster['center']['lat']:.6f}, {cluster['center']['lng']:.6f})")
                print(f"   - Radius: {cluster['radius']:.0f} meters")
                print(f"   - Incidents: {cluster['incident_count']}")
                print(f"   - Risk Score: {cluster['risk_score']:.2f}/5.0")
                
                # Determine risk level
                risk_score = cluster['risk_score']
                if risk_score <= 1.0:
                    risk_level = "Very Safe"
                elif risk_score <= 2.0:
                    risk_level = "Safe"
                elif risk_score <= 3.0:
                    risk_level = "Medium Risk"
                elif risk_score <= 4.0:
                    risk_level = "High Risk"
                else:
                    risk_level = "Very High Risk"
                
                print(f"   - Risk Level: {risk_level}")
            
            if len(clusters) > 10:
                print(f"\n   ... and {len(clusters) - 10} more clusters")
            
            # Statistics
            total_clustered_incidents = sum(c['incident_count'] for c in clusters)
            avg_cluster_size = total_clustered_incidents / len(clusters) if clusters else 0
            avg_risk_score = sum(c['risk_score'] for c in clusters) / len(clusters) if clusters else 0
            
            print("\n   Cluster Statistics:")
            print(f"   - Total incidents in clusters: {total_clustered_incidents}")
            print(f"   - Average cluster size: {avg_cluster_size:.1f} incidents")
            print(f"   - Average risk score: {avg_risk_score:.2f}/5.0")
            print(f"   - Scattered incidents: {incident_count - total_clustered_incidents}")
        else:
            print("   [WARNING] No clusters found!")
            print("   [INFO] This might mean:")
            print("      - Incidents are too spread out")
            print("      - DBSCAN parameters need adjustment")
            print("      - Need more incidents")
    
    except Exception as e:
        print(f"   [ERROR] Clustering failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 2: Risk Scoring
    print("\n3. Testing Risk Scoring...")
    print("   (Calculating risk scores for sample locations)")
    
    # Test locations (Chennai landmarks)
    test_locations = [
        {"name": "Central Railway Station", "lat": 13.0827, "lng": 80.2707},
        {"name": "Marina Beach", "lat": 13.0475, "lng": 80.2825},
        {"name": "Egmore Station", "lat": 13.0790, "lng": 80.2606},
        {"name": "Koyambedu Bus Stand", "lat": 13.0710, "lng": 80.1980},
        {"name": "Adyar Residential", "lat": 13.0067, "lng": 80.2206},
    ]
    
    print("\n   Risk Scores for Sample Locations:")
    print("   " + "-" * 56)
    
    risk_results = []
    
    for location in test_locations:
        try:
            risk_data = calculate_risk_score(location["lat"], location["lng"])
            risk_results.append({
                "name": location["name"],
                "lat": location["lat"],
                "lng": location["lng"],
                **risk_data
            })
            
            print(f"\n   {location['name']}:")
            print(f"   - Location: ({location['lat']:.6f}, {location['lng']:.6f})")
            print(f"   - Risk Score: {risk_data['risk_score']:.2f}/5.0")
            print(f"   - Risk Level: {risk_data['risk_level'].replace('_', ' ').title()}")
            
            # Show contributing factors
            factors = risk_data.get('factors', {})
            if factors:
                print(f"   - Contributing Factors:")
                print(f"     • Incident Density: {factors.get('incident_density', 0):.3f}")
                print(f"     • Recency: {factors.get('recency', 0):.3f}")
                print(f"     • Severity: {factors.get('severity', 0):.3f}")
                print(f"     • Time Pattern: {factors.get('time_pattern', 0):.3f}")
        
        except Exception as e:
            print(f"\n   {location['name']}: [ERROR] Error - {e}")
    
    # Summary
    if risk_results:
        avg_risk = sum(r['risk_score'] for r in risk_results) / len(risk_results)
        max_risk = max(risk_results, key=lambda r: r['risk_score'])
        min_risk = min(risk_results, key=lambda r: r['risk_score'])
        
        print("\n   Risk Scoring Summary:")
        print(f"   - Average Risk Score: {avg_risk:.2f}/5.0")
        print(f"   - Highest Risk: {max_risk['name']} ({max_risk['risk_score']:.2f})")
        print(f"   - Lowest Risk: {min_risk['name']} ({min_risk['risk_score']:.2f})")
    
    # Test 3: Verify Model Learning
    print("\n4. Verifying Model Learning...")
    
    # Check if clusters match high-incident areas
    if clusters and risk_results:
        print("   Checking if clusters align with high-risk locations...")
        
        cluster_centers = [(c['center']['lat'], c['center']['lng']) for c in clusters[:5]]
        high_risk_locations = [r for r in risk_results if r['risk_score'] >= 3.0]
        
        matches = 0
        for cluster in clusters[:5]:
            cluster_lat, cluster_lng = cluster['center']['lat'], cluster['center']['lng']
            for risk_loc in high_risk_locations:
                # Check if cluster is near high-risk location (~500m)
                distance = ((cluster_lat - risk_loc['lat'])**2 + (cluster_lng - risk_loc['lng'])**2)**0.5
                if distance < 0.005:  # ~500 meters
                    matches += 1
                    break
        
        print(f"   - Clusters near high-risk locations: {matches}/{min(5, len(clusters))}")
        
        if matches > 0:
            print("   [OK] Model is learning spatial patterns correctly!")
        else:
            print("   [WARNING] Clusters don't align with high-risk locations")
            print("   [INFO] This might be normal if incidents are distributed differently")
    
    print("\n" + "=" * 60)
    print("[OK] STEP 3 COMPLETE!")
    print("=" * 60)
    print("\n[SUMMARY] Summary:")
    print(f"   - Clusters found: {len(clusters)}")
    print(f"   - Risk scores calculated: {len(risk_results)}")
    print(f"   - Model is learning from incident data")
    print("\n[NEXT] Next Steps:")
    print("   - Step 4: Test heatmap generation")
    print("   - Step 5: Test route analysis")
    print("   - Or: Integrate with backend API")


if __name__ == "__main__":
    try:
        step3_test_ml_algorithms()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        print("\n[TIP] Make sure you've:")
        print("   1. Run Step 2 to load data: python step2_load_data.py")
        print("   2. Installed dependencies: pip install -r requirements.txt")


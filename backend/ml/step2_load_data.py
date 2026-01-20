"""
Step 2: Load Chennai Mock Data into Storage
Loads 5000 app user incidents and verifies storage
"""

import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.data.chennai_mock_data import load_chennai_mock_data_into_storage
from app.db.storage import get_incident_count, get_all_incidents, get_incidents


def step2_load_data():
    """Step 2: Load 5000 Chennai incidents into storage"""
    print("=" * 60)
    print("STEP 2: Loading Chennai Mock Data into Storage")
    print("=" * 60)
    
    # Clear any existing data first
    print("\n1. Clearing existing data...")
    from app.db.storage import clear_incidents
    clear_incidents()
    print("   [OK] Storage cleared")
    
    # Load 5000 incidents
    print("\n2. Generating and loading 5000 Chennai incidents...")
    print("   (This may take 10-30 seconds)")
    count_loaded = load_chennai_mock_data_into_storage(count=5000)
    
    print(f"\n   [OK] Loaded {count_loaded} incidents")
    
    # Verify storage
    print("\n3. Verifying storage...")
    stored_count = get_incident_count()
    print(f"   [OK] Storage contains {stored_count} incidents")
    
    if stored_count != count_loaded:
        print(f"   [WARNING] Count mismatch! Expected {count_loaded}, got {stored_count}")
    else:
        print("   [OK] Count matches!")
    
    # Get sample incidents
    print("\n4. Sample incidents:")
    all_incidents = get_all_incidents()
    if len(all_incidents) > 0:
        sample = all_incidents[0]
        print(f"   Sample incident:")
        print(f"   - ID: {sample['id']}")
        print(f"   - Location: ({sample['latitude']:.6f}, {sample['longitude']:.6f})")
        print(f"   - Type: {sample['type']}")
        print(f"   - Severity: {sample['severity']}")
        print(f"   - Category: {sample.get('category', 'N/A')}")
        print(f"   - Timestamp: {sample['timestamp']}")
        print(f"   - Verified: {sample['verified']}")
    
    # Statistics
    print("\n5. Incident Statistics:")
    
    # Type distribution
    panic_count = sum(1 for i in all_incidents if i['type'] == 'panic_alert')
    report_count = sum(1 for i in all_incidents if i['type'] == 'community_report')
    print(f"   - Panic Alerts: {panic_count} ({panic_count/stored_count*100:.1f}%)")
    print(f"   - Community Reports: {report_count} ({report_count/stored_count*100:.1f}%)")
    
    # Severity distribution
    severity_counts = {}
    for incident in all_incidents:
        sev = incident['severity']
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
    
    print(f"\n   Severity Distribution:")
    for sev in sorted(severity_counts.keys()):
        count = severity_counts[sev]
        percentage = (count / stored_count) * 100
        print(f"   - Severity {sev}: {count} incidents ({percentage:.1f}%)")
    
    # Verified distribution
    verified_count = sum(1 for i in all_incidents if i.get('verified', False))
    unverified_count = stored_count - verified_count
    print(f"\n   Verification Status:")
    print(f"   - Verified: {verified_count} ({verified_count/stored_count*100:.1f}%)")
    print(f"   - Unverified: {unverified_count} ({unverified_count/stored_count*100:.1f}%)")
    
    # Location bounds
    if len(all_incidents) > 0:
        lats = [i['latitude'] for i in all_incidents]
        lngs = [i['longitude'] for i in all_incidents]
        print(f"\n   Location Coverage:")
        print(f"   - Latitude range: {min(lats):.6f} to {max(lats):.6f}")
        print(f"   - Longitude range: {min(lngs):.6f} to {max(lngs):.6f}")
        print(f"   - Chennai area: ~426 km²")
        print(f"   - Density: ~{stored_count/426:.2f} incidents per km²")
    
    # Test filtering
    print("\n6. Testing data retrieval...")
    
    # Test location filter
    test_lat, test_lng = 13.0827, 80.2707  # Central Station area
    radius_degrees = 0.009  # ~1km
    nearby = get_incidents(
        lat_min=test_lat - radius_degrees,
        lat_max=test_lat + radius_degrees,
        lng_min=test_lng - radius_degrees,
        lng_max=test_lng + radius_degrees,
    )
    print(f"   - Incidents near Central Station (~1km radius): {len(nearby)}")
    
    print("\n" + "=" * 60)
    print("[OK] STEP 2 COMPLETE!")
    print("=" * 60)
    print("\n[SUMMARY] Summary:")
    print(f"   - Total incidents loaded: {stored_count}")
    print(f"   - Data ready for ML model training")
    print(f"   - Next step: Test ML algorithms (Step 3)")
    print("\n[TIP] You can now test:")
    print("   - Clustering: from app.ml.clustering import get_clusters")
    print("   - Risk scoring: from app.ml.risk_scoring import calculate_risk_score")


if __name__ == "__main__":
    try:
        step2_load_data()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        print("\n[TIP] Make sure you've:")
        print("   1. Installed dependencies: pip install -r requirements.txt")
        print("   2. Activated virtual environment")
        print("   3. Run from backend/ml directory")


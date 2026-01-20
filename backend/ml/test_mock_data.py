"""
Simple test script to verify Chennai mock data generator works
Run this to test Step 1
"""

import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.data.chennai_mock_data import generate_chennai_incidents

def test_mock_data_generation():
    """Test that mock data generates correctly"""
    print("🧪 Testing Chennai Mock Data Generator...")
    print("=" * 50)
    
    # Generate 10 incidents for testing
    print("\n1. Generating 10 test incidents...")
    incidents = generate_chennai_incidents(count=10, start_date_days_ago=30)
    
    print(f"✅ Generated {len(incidents)} incidents")
    
    # Check incident structure
    print("\n2. Checking incident structure...")
    sample = incidents[0]
    print(f"   Sample incident:")
    print(f"   - ID: {sample.id}")
    print(f"   - Location: ({sample.latitude}, {sample.longitude})")
    print(f"   - Type: {sample.type}")
    print(f"   - Severity: {sample.severity}")
    print(f"   - Category: {sample.category}")
    print(f"   - Timestamp: {sample.timestamp}")
    print(f"   - Verified: {sample.verified}")
    
    # Check types distribution
    print("\n3. Checking incident types...")
    panic_count = sum(1 for i in incidents if i.type == "panic_alert")
    report_count = sum(1 for i in incidents if i.type == "community_report")
    print(f"   - Panic Alerts: {panic_count}")
    print(f"   - Community Reports: {report_count}")
    
    # Check severity distribution
    print("\n4. Checking severity distribution...")
    severity_counts = {}
    for incident in incidents:
        severity_counts[incident.severity] = severity_counts.get(incident.severity, 0) + 1
    for sev in sorted(severity_counts.keys()):
        print(f"   - Severity {sev}: {severity_counts[sev]} incidents")
    
    print("\n" + "=" * 50)
    print("✅ Mock data generator test passed!")
    print("\nNext: Test loading data into storage")

if __name__ == "__main__":
    test_mock_data_generation()




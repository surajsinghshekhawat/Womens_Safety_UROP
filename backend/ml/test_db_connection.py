"""
Test database connection
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.db.connection import test_connection, init_connection_pool
from app.db.storage import get_incident_count, add_incident
from app.api.schemas import IncidentRequest
from datetime import datetime, timezone

def test_db():
    print("=" * 60)
    print("Testing Database Connection")
    print("=" * 60)
    
    # Test connection
    print("\n1. Testing database connection...")
    init_connection_pool()
    if test_connection():
        print("   [OK] Database connection successful!")
    else:
        print("   [ERROR] Database connection failed!")
        return
    
    # Test incident count
    print("\n2. Checking incident count...")
    count = get_incident_count()
    print(f"   [OK] Current incidents in database: {count}")
    
    # Test adding incident
    print("\n3. Testing incident insertion...")
    test_incident = IncidentRequest(
        id="test_incident_001",
        latitude=13.0827,
        longitude=80.2707,
        timestamp=datetime.now(timezone.utc),
        type="community_report",
        severity=3,
        category="test",
        verified=False,
        user_id="test_user"
    )
    
    try:
        add_incident(test_incident)
        print("   [OK] Incident added successfully!")
        
        # Verify count increased
        new_count = get_incident_count()
        print(f"   [OK] New incident count: {new_count}")
        
        if new_count == count + 1:
            print("   [OK] Count matches!")
        else:
            print(f"   [WARNING] Count mismatch! Expected {count + 1}, got {new_count}")
    except Exception as e:
        print(f"   [ERROR] Failed to add incident: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("[OK] Database test complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_db()




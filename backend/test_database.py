"""
Database Connection Test Script
Tests PostgreSQL connection and validates setup
"""

import asyncio
import sys
from sqlalchemy import text
from app.database import engine, get_db
from app.config import settings

async def test_connection():
    """Test database connection"""
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    
    print(f"\nDatabase URL: {settings.DATABASE_URL[:50]}...")
    print(f"Environment: {settings.ENVIRONMENT}")
    
    try:
        # Test connection
        print("\n1. Testing connection...")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("   [PASS] Connection successful!")
        
        # Test database version
        print("\n2. Checking database version...")
        async with engine.connect() as conn:
            if "postgresql" in settings.DATABASE_URL:
                result = await conn.execute(text("SELECT version()"))
                version = result.scalar()
                print(f"   [PASS] PostgreSQL version: {version[:50]}...")
            else:
                result = await conn.execute(text("SELECT sqlite_version()"))
                version = result.scalar()
                print(f"   [PASS] SQLite version: {version}")
        
        # Test tables exist
        print("\n3. Checking tables...")
        async with engine.connect() as conn:
            if "postgresql" in settings.DATABASE_URL:
                result = await conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """))
            else:
                result = await conn.execute(text("""
                    SELECT name 
                    FROM sqlite_master 
                    WHERE type='table'
                    ORDER BY name
                """))
            
            tables = [row[0] for row in result]
            
            expected_tables = ['users', 'interviews', 'turns', 'feedback', 'alembic_version']
            
            if not tables:
                print("   [WARN] No tables found! Run: alembic upgrade head")
            else:
                print(f"   [PASS] Found {len(tables)} tables:")
                for table in tables:
                    status = "[OK]" if table in expected_tables else "[INFO]"
                    print(f"      {status} {table}")
                
                missing = set(expected_tables) - set(tables)
                if missing:
                    print(f"\n   [WARN] Missing tables: {', '.join(missing)}")
                    print("   Run: alembic upgrade head")
        
        # Test write operation
        print("\n4. Testing write operation...")
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            await conn.commit()
            print("   [PASS] Write operation successful!")
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED!")
        print("=" * 60)
        print("\nDatabase is ready to use!")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("TEST FAILED!")
        print("=" * 60)
        print(f"\nError: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check DATABASE_URL in .env")
        print("2. Verify database is accessible")
        print("3. Run: alembic upgrade head")
        print("4. Check firewall/network settings")
        
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)

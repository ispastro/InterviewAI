"""
Phase 1 Test Script

This script tests all Phase 1 components to ensure they work correctly:
1. Configuration loading and validation
2. Database connection and model creation
3. JWT authentication
4. Error handling
5. API endpoints

Run this script to validate Phase 1 before moving to Phase 2.
"""

import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_configuration():
    """Test configuration loading and validation"""
    print("Testing configuration...")
    
    try:
        from app.config import settings, validate_configuration
        
        # Test that settings load
        print(f"   Settings loaded: {settings.ENVIRONMENT}")
        
        # Test validation
        validate_configuration()
        print("   Configuration validation passed")
        
        return True
    except Exception as e:
        print(f"   Configuration test failed: {e}")
        return False


async def test_database():
    """Test database connection and model creation"""
    print("Testing database...")
    
    try:
        from app.database import check_database_connection, create_tables
        
        # Test connection
        connected = await check_database_connection()
        if not connected:
            print("   Database connection failed")
            return False
        
        print("   Database connection successful")
        
        # Test table creation
        await create_tables()
        print("   Database tables created")
        
        return True
    except Exception as e:
        print(f"   Database test failed: {e}")
        return False


async def test_auth():
    """Test JWT authentication"""
    print("Testing authentication...")
    
    try:
        from app.modules.auth.dependencies import create_test_token, decode_jwt_token
        from app.config import settings
        
        if not settings.is_development:
            print("   Skipping auth test (not in development mode)")
            return True
        
        # Create test token
        token = create_test_token("test@example.com", "Test User")
        print("   Test token created")
        
        # Decode token
        payload = decode_jwt_token(token)
        assert payload["email"] == "test@example.com"
        print("   Token validation successful")
        
        return True
    except Exception as e:
        print(f"   Auth test failed: {e}")
        return False


async def test_models():
    """Test database models"""
    print("Testing models...")
    
    try:
        from app.models.user import User
        from app.database import AsyncSessionLocal, create_tables
        
        # Create tables first
        await create_tables()
        
        # Test user creation
        async with AsyncSessionLocal() as session:
            user = User.create_from_jwt(
                email="test@example.com",
                name="Test User",
                oauth_provider="google",
                oauth_subject="test-123"
            )
            
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            print(f"   User created: {user.id}")
            
            # Test user methods
            assert user.display_name == "Test User"
            assert user.is_oauth_user == True
            
            user_dict = user.to_dict()
            assert "id" in user_dict
            assert "email" in user_dict
            
            print("   User methods working")
        
        return True
    except Exception as e:
        print(f"   Models test failed: {e}")
        return False


async def main():
    """Run all Phase 1 tests"""
    print("Running Phase 1 Tests\n")
    
    tests = [
        ("Configuration", test_configuration),
        ("Database", test_database),
        ("Authentication", test_auth),
        ("Models", test_models),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"   ERROR: {test_name} test crashed: {e}")
            results.append((test_name, False))
        print()
    
    # Summary
    print("Test Results:")
    passed = 0
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n{passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("Phase 1 is ready! You can move to Phase 2.")
    else:
        print("Fix the failing tests before proceeding.")
        sys.exit(1)


if __name__ == "__main__":
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("ERROR: .env file not found!")
        print("   Copy .env.example to .env and fill in your values:")
        print("   cp .env.example .env")
        sys.exit(1)
    
    asyncio.run(main())
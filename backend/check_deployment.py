"""
Pre-Deployment Checklist for Heroku
Validates that everything is ready for deployment
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if Path(filepath).exists():
        print(f"[PASS] {description}: {filepath}")
        return True
    else:
        print(f"[FAIL] {description} MISSING: {filepath}")
        return False

def check_env_var(var_name):
    """Check if environment variable is set"""
    value = os.getenv(var_name)
    if value and value != "":
        print(f"[PASS] {var_name}: Set")
        return True
    else:
        print(f"[WARN] {var_name}: Not set (will need to set on Heroku)")
        return True  # Not critical for local check

def main():
    print("=" * 60)
    print("HEROKU DEPLOYMENT READINESS CHECK")
    print("=" * 60)
    
    all_checks_passed = True
    
    # Check required files
    print("\nChecking Required Files:")
    all_checks_passed &= check_file_exists("Procfile", "Procfile")
    all_checks_passed &= check_file_exists("runtime.txt", "Runtime specification")
    all_checks_passed &= check_file_exists("requirements.txt", "Dependencies")
    all_checks_passed &= check_file_exists("alembic.ini", "Alembic config")
    all_checks_passed &= check_file_exists("app/main.py", "Main application")
    
    # Check environment variables (local)
    print("\nChecking Environment Variables (Local):")
    check_env_var("GROQ_API_KEY")
    check_env_var("DATABASE_URL")
    check_env_var("JWT_SECRET")
    check_env_var("UPSTASH_REDIS_REST_URL")
    check_env_var("UPSTASH_REDIS_REST_TOKEN")
    
    # Check Python version
    print("\nChecking Python Version:")
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"   Current: Python {python_version}")
    
    with open("runtime.txt", "r") as f:
        heroku_python = f.read().strip().replace("python-", "")
    print(f"   Heroku: Python {heroku_python}")
    
    if python_version.startswith("3.11") or python_version.startswith("3.12"):
        print("   [PASS] Compatible version")
    else:
        print("   [WARN] Version mismatch (should work but may have issues)")
    
    # Check Procfile content
    print("\nChecking Procfile:")
    with open("Procfile", "r") as f:
        procfile_content = f.read()
    
    if "web:" in procfile_content and "uvicorn" in procfile_content:
        print("   [PASS] Web process defined")
    else:
        print("   [FAIL] Web process not properly defined")
        all_checks_passed = False
    
    if "release:" in procfile_content and "alembic" in procfile_content:
        print("   [PASS] Release process defined (migrations)")
    else:
        print("   [WARN] Release process not defined (migrations won't run automatically)")
    
    # Check requirements.txt
    print("\nChecking Dependencies:")
    with open("requirements.txt", "r") as f:
        requirements = f.read()
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "asyncpg",
        "alembic",
        "groq",
        "redis",
        "upstash-redis"
    ]
    
    for package in required_packages:
        if package in requirements:
            print(f"   [PASS] {package}")
        else:
            print(f"   [FAIL] {package} MISSING")
            all_checks_passed = False
    
    # Check git status
    print("\nGit Status:")
    try:
        import subprocess
        result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
        if result.returncode == 0:
            if result.stdout.strip():
                print("   [WARN] Uncommitted changes:")
                print(result.stdout)
                print("   Commit changes before deploying!")
            else:
                print("   [PASS] No uncommitted changes")
        else:
            print("   [WARN] Not a git repository or git not installed")
    except Exception as e:
        print(f"   [WARN] Could not check git status: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    if all_checks_passed:
        print("ALL CRITICAL CHECKS PASSED!")
        print("\nReady to deploy to Heroku!")
        print("\nNext steps:")
        print("1. heroku login")
        print("2. heroku create interviewme-api")
        print("3. heroku config:set [ENV_VARS]")
        print("4. git push heroku main")
    else:
        print("SOME CHECKS FAILED!")
        print("\nFix the issues above before deploying.")
    print("=" * 60)
    
    return 0 if all_checks_passed else 1

if __name__ == "__main__":
    sys.exit(main())

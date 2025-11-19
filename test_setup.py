#!/usr/bin/env python3
"""
Test script to verify Valorant Analytics setup
"""

import os
import sys
from pathlib import Path

def test_file_structure():
    """Test if all required files exist"""
    print("🔍 Testing file structure...")
    
    required_files = [
        "backend/app.py",
        "frontend/app.py", 
        "frontend/team_player_app.py",
        "launcher.py",
        "requirements.txt",
        "README.md"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"   ✅ {file_path}")
    
    if missing_files:
        print(f"   ❌ Missing files: {missing_files}")
        return False
    else:
        print("   ✅ All required files present")
        return True

def test_imports():
    """Test if required packages can be imported"""
    print("\n📦 Testing package imports...")
    
    packages = [
        ("flask", "Flask"),
        ("streamlit", "Streamlit"),
        ("plotly", "Plotly"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy"),
        ("requests", "Requests")
    ]
    
    missing_packages = []
    for package, name in packages:
        try:
            __import__(package)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n   📝 Install missing packages: pip install {' '.join(missing_packages)}")
        return False
    else:
        print("   ✅ All required packages available")
        return True

def test_data_files():
    """Test if data files exist"""
    print("\n📊 Testing data files...")
    
    data_dir = Path("backend/data")
    if not data_dir.exists():
        print("   ❌ backend/data directory not found")
        return False
    
    csv_files = list(data_dir.glob("*.csv"))
    if not csv_files:
        print("   ❌ No CSV files found in backend/data")
        return False
    
    print(f"   ✅ Found {len(csv_files)} CSV files:")
    for csv_file in csv_files:
        print(f"      - {csv_file.name}")
    
    return True

def main():
    print("🟪 Valorant Analytics Setup Test")
    print("=" * 40)
    
    tests = [
        test_file_structure,
        test_imports,
        test_data_files
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 40)
    if all(results):
        print("🎉 All tests passed! Setup is ready.")
        print("\n🚀 Next steps:")
        print("   1. Run: python backend/app.py (in separate terminal)")
        print("   2. Run: streamlit run launcher.py")
        print("   3. Choose your analytics experience!")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        print("\n📝 Quick fix:")
        print("   pip install -r requirements.txt")

if __name__ == "__main__":
    main()

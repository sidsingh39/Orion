import os
import sys

# Ensure we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Explicitly load from backend/.env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

try:
    # Try importing the client setup from the codebase
    from src.db.supabase import supabase
    
    print(f"✅ Supabase Client Initialized")
    print(f"URL: {supabase.supabase_url}")
    
    # Try a lightweight network call to verify credentials work
    # Attempting to list buckets is usually a safe read-only test if Storage is enabled
    # Or just getting project settings/health if possible.
    # Since we might have the Service Role key, let's try to get a non-existent table to check connectivity
    # or just trust the client creation if it validates URL format.
    
    # Let's try to list buckets (Storage) which is common
    try:
        buckets = supabase.storage.list_buckets()
        print("✅ Connection Verified: Successfully listed storage buckets")
    except Exception as e:
        print(f"⚠️  Client initialized, but simplified network test failed (This might be a permissions issue, or Storage not enabled): {e}")
        # Fallback test: Auth check (verify service role key acts as admin?)
        # For now, if we get here, the URL/Key formats are likely correct at least.

except ValueError as e:
    print("❌ Configuration Error: Missing Supabase Credentials in .env")
    print(f"Details: {e}")
except Exception as e:
    print(f"❌ Unexpected Error: {e}")

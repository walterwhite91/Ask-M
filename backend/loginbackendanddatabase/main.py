import os
from fastapi import FastAPI, HTTPException, Header
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS (Cross-Origin Resource Sharing)
# This allows your frontend (Vercel/Localhost) to make requests to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables.")

# Create Supabase client with Service Role key (to bypass RLS for administrative tasks)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@app.get("/")
async def root():
    return {"message": "Python Backend is Running"}

@app.post("/auth/verify")
async def verify_user(authorization: str = Header(None)):
    """
    Receives a JWT from the frontend, verifies it with Supabase,
    and ensures the user exists in the 'profiles' table.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    # Extract token from 'Bearer <token>'
    token = authorization.replace("Bearer ", "")
    
    try:
        # 1. Verify the JWT with Supabase Auth
        # This confirms the user is logged in and the token is valid
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # 2. Extract profile details from the user object
        # User metadata contains info from Google OAuth (name, avatar, etc.)
        metadata = user.user_metadata or {}
        user_id = user.id
        email = user.email
        full_name = metadata.get("full_name") or metadata.get("name", "")
        avatar_url = metadata.get("avatar_url") or metadata.get("picture", "")

        # 3. Sync with 'profiles' table in the database
        # We use 'upsert' to create the record if it doesn't exist, or update it if it does.
        profile_data = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "avatar_url": avatar_url
        }
        
        # Note: 'upsert' works because 'id' is our primary key tied to auth.users.id
        result = supabase.table("profiles").upsert(profile_data).execute()
        
        return {
            "status": "success",
            "message": "User verified and profile synchronized",
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name
            }
        }

    except Exception as e:
        # Log the error for debugging
        print(f"Verification Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
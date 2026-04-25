# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/api/health")
# def health():
#     return {"status": "ok"}


# -----

# from fastapi import FastAPI
# from azure.storage.blob import BlobServiceClient
# import os
# import uuid
# from datetime import datetime

# app = FastAPI()

# # Initialize Blob client
# connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
# blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# CONTAINER_NAME = "fastapi-data"

# @app.get("/api/health")
# def health():
#     return {"status": "ok"}


# @app.post("/api/upload")
# def upload_data(data: dict):
#     try:
#         # Create container if not exists
#         container_client = blob_service_client.get_container_client(CONTAINER_NAME)
#         if not container_client.exists():
#             container_client.create_container()

#         # Create unique blob name
#         blob_name = f"data-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4()}.json"

#         # Convert data to string
#         content = str(data)

#         # Upload
#         blob_client = container_client.get_blob_client(blob_name)
#         blob_client.upload_blob(content)

#         return {
#             "message": "Uploaded successfully",
#             "blob_name": blob_name
#         }

#     except Exception as e:
#         return {"error": str(e)}


# ----------------------------------------

# import os
# import hmac
# import hashlib
# import time
# import uuid
# import json
# from typing import Optional, Any
# from datetime import datetime

# import jwt
# from fastapi import FastAPI, Header, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, root_validator
# from azure.storage.blob import BlobServiceClient

# # ---------------------------------------------------------------------------
# # CONFIG
# # ---------------------------------------------------------------------------
# SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
# SHARED_SECRET = os.getenv("SHARED_SECRET", "CHANGE_ME_IN_PRODUCTION")

# JWT_ALGORITHM = "HS256"
# JWT_EXPIRY_SECONDS = 900000  # keep same as your existing logic

# REACT_APP_URL = os.getenv("REACT_APP_URL", "")

# WHITELISTED_ENVIRONMENTS: dict[str, list[str]] = {
#     "DEV": ["100", "200"],
#     "QAS": ["100"],
#     "PRD": ["100"],
# }

# # ---------------------------------------------------------------------------
# # AZURE BLOB CONFIG
# # ---------------------------------------------------------------------------
# AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
# CONTAINER_NAME = os.getenv("SESSION_CONTAINER", "sessions")

# if not AZURE_STORAGE_CONNECTION_STRING:
#     raise Exception("AZURE_STORAGE_CONNECTION_STRING is not set")

# blob_service_client = BlobServiceClient.from_connection_string(
#     AZURE_STORAGE_CONNECTION_STRING
# )

# container_client = blob_service_client.get_container_client(CONTAINER_NAME)

# # ---------------------------------------------------------------------------
# # FASTAPI APP
# # ---------------------------------------------------------------------------
# app = FastAPI(
#     title="SAP Analytics Layer",
#     version="2.0.0",
#     docs_url=None,
#     redoc_url=None,
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------------------------------------------------------------------
# # MODELS
# # ---------------------------------------------------------------------------
# class AuthRequest(BaseModel):
#     sap_sid: str
#     sap_client: str
#     sap_user: str
#     timestamp: int
#     hmac_sig: str


# class SessionCreateRequest(BaseModel):
#     raw_data: Optional[list] = None
#     rows: Optional[list] = None
#     data: Optional[list] = None
#     dashboard: str = "cof_dashboard"
#     filters: dict = {}

#     @root_validator(pre=True)
#     def normalize_raw_data(cls, values):
#         if not values.get("raw_data"):
#             for key in ("rows", "data"):
#                 if values.get(key):
#                     values["raw_data"] = values[key]
#                     break
#         return values


# # ---------------------------------------------------------------------------
# # HELPER FUNCTIONS
# # ---------------------------------------------------------------------------
# def verify_hmac(sap_sid: str, sap_client: str, timestamp: int, sig: str) -> bool:
#     msg = f"{sap_sid}{sap_client}{timestamp}".encode()
#     expected = hmac.new(
#         SHARED_SECRET.encode(), msg, hashlib.sha256
#     ).hexdigest()
#     return hmac.compare_digest(expected, sig.lower())


# def decode_jwt(authorization: Optional[str]) -> dict:
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

#     token = authorization.split(" ", 1)[1]

#     try:
#         return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token expired")
#     except jwt.InvalidTokenError as exc:
#         raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


# # -------------------- BLOB HELPERS --------------------
# def _blob_name(session_id: str) -> str:
#     return f"{session_id}.json"


# def save_session(session_id: str, data: dict):
#     blob_client = container_client.get_blob_client(_blob_name(session_id))
#     blob_client.upload_blob(json.dumps(data), overwrite=True)


# def get_session(session_id: str) -> Optional[dict]:
#     blob_client = container_client.get_blob_client(_blob_name(session_id))
#     if not blob_client.exists():
#         return None
#     data = blob_client.download_blob().readall()
#     return json.loads(data)


# # ---------------------------------------------------------------------------
# # ROUTES
# # ---------------------------------------------------------------------------
# @app.get("/api/health")
# def health():
#     return {
#         "status": "ok",
#         "timestamp": int(time.time()),
#         "version": "2.0.0"
#     }


# @app.post("/api/auth/token")
# def get_token(req: AuthRequest):
#     now = int(time.time())

#     # Replay protection
#     if abs(now - req.timestamp) > 300:
#         raise HTTPException(status_code=401, detail="Request timestamp too old")

#     # HMAC validation
#     if not verify_hmac(req.sap_sid, req.sap_client, req.timestamp, req.hmac_sig):
#         raise HTTPException(status_code=401, detail="Invalid HMAC signature")

#     # Whitelist validation
#     allowed = WHITELISTED_ENVIRONMENTS.get(req.sap_sid.upper(), [])
#     if req.sap_client not in allowed:
#         raise HTTPException(
#             status_code=403,
#             detail=f"SAP environment {req.sap_sid}/{req.sap_client} not allowed",
#         )

#     payload = {
#         "sap_sid": req.sap_sid.upper(),
#         "sap_client": req.sap_client,
#         "sap_user": req.sap_user,
#         "iat": now,
#         "exp": now + JWT_EXPIRY_SECONDS,
#     }

#     token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

#     return {
#         "access_token": token,
#         "token_type": "Bearer",
#         "expires_in": JWT_EXPIRY_SECONDS,
#     }


# @app.post("/api/session/create")
# def session_create(
#     req: SessionCreateRequest,
#     authorization: Optional[str] = Header(None),
# ):
#     claims = decode_jwt(authorization)

#     if not req.raw_data:
#         raise HTTPException(status_code=400, detail="raw_data is required")

#     session_id = str(uuid.uuid4())

#     # ---------------- YOUR EXISTING LOGIC ----------------
#     result = calculate_cof_dashboard(req.filters or {}, req.raw_data)
#     result_ai = calculate_cof_dashboard_insights(req.filters or {}, req.raw_data)

#     session_data = {
#         "raw_data": req.raw_data,
#         "dashboard": req.dashboard,
#         "filters": req.filters,
#         "result": result,
#         "result_ai": result_ai,
#         "sap_sid": claims["sap_sid"],
#         "sap_user": claims["sap_user"],
#         "created_at": int(time.time()),
#         "expires_at": claims["exp"],
#     }

#     # Save in Blob
#     save_session(session_id, session_data)

#     token = authorization.split(" ")[1]

#     frontend_url = (
#         f"{REACT_APP_URL}"
#         f"?token={token}"
#         f"&sid={claims['sap_sid']}"
#         f"&client={claims['sap_client']}"
#         f"&dashboard={req.dashboard}"
#         f"&session_id={session_id}"
#     )

#     return {
#         "session_id": session_id,
#         "frontend_url": frontend_url,
#         "row_count": len(req.raw_data),
#         "expires_in": claims["exp"] - int(time.time()),
#     }


# # ---------------------------------------------------------------------------
# # PLACEHOLDER CALCULATION FUNCTIONS (KEEP YOUR ORIGINAL FULL LOGIC HERE)
# # ---------------------------------------------------------------------------
# def calculate_cof_dashboard(filters: dict, raw_data: list):
#     # KEEP YOUR ORIGINAL IMPLEMENTATION
#     return {
#         "status": "success",
#         "message": "COF dashboard calculated",
#         "records": len(raw_data),
#     }


# def calculate_cof_dashboard_insights(filters: dict, raw_data: list):
#     # KEEP YOUR ORIGINAL IMPLEMENTATION
#     return {
#         "status": "success",
#         "message": "AI insights generated",
#         "records": len(raw_data),
#     }

# ------------------2nd iteration with Azure Functions------------------

import os
import hmac
import hashlib
import time
import uuid
import json
from typing import Optional

import jwt
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, root_validator
from azure.storage.blob import BlobServiceClient

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
SHARED_SECRET = os.getenv("SHARED_SECRET")

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 900000

REACT_APP_URL = os.getenv("REACT_APP_URL")

WHITELISTED_ENVIRONMENTS = {
    "DEV": ["100", "200"],
    "QAS": ["100"],
    "PRD": ["100"],
}

# ---------------------------------------------------------------------------
# AZURE BLOB
# ---------------------------------------------------------------------------
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = os.getenv("SESSION_CONTAINER", "sessions")

blob_service_client = BlobServiceClient.from_connection_string(
    AZURE_STORAGE_CONNECTION_STRING
)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

# ---------------------------------------------------------------------------
# APP
# ---------------------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------
class AuthRequest(BaseModel):
    sap_sid: str
    sap_client: str
    sap_user: str
    timestamp: int
    hmac_sig: str


class SessionCreateRequest(BaseModel):
    raw_data: Optional[list] = None
    rows: Optional[list] = None
    data: Optional[list] = None
    dashboard: str = "cof_dashboard"
    filters: dict = {}

    @root_validator(pre=True)
    def normalize(cls, values):
        if not values.get("raw_data"):
            for k in ["rows", "data"]:
                if values.get(k):
                    values["raw_data"] = values[k]
        return values


class DataQueryRequest(BaseModel):
    session_id: Optional[str] = None


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def verify_hmac(sid, client, timestamp, sig):
    msg = f"{sid}{client}{timestamp}".encode()
    expected = hmac.new(
        SHARED_SECRET.encode(), msg, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, sig.lower())


def decode_jwt(auth):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(401, "Invalid token")

    token = auth.split(" ")[1]
    return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])


def blob_name(session_id):
    return f"{session_id}.json"


def save_session(session_id, data):
    blob = container_client.get_blob_client(blob_name(session_id))
    blob.upload_blob(json.dumps(data), overwrite=True)


def get_session(session_id):
    blob = container_client.get_blob_client(blob_name(session_id))
    if not blob.exists():
        return None
    return json.loads(blob.download_blob().readall())


# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/token")
def get_token(req: AuthRequest):
    now = int(time.time())

    if abs(now - req.timestamp) > 300:
        raise HTTPException(401, "Replay attack")

    if not verify_hmac(req.sap_sid, req.sap_client, req.timestamp, req.hmac_sig):
        raise HTTPException(401, "Invalid HMAC")

    allowed = WHITELISTED_ENVIRONMENTS.get(req.sap_sid.upper(), [])
    if req.sap_client not in allowed:
        raise HTTPException(403, "Not allowed")

    payload = {
        "sap_sid": req.sap_sid,
        "sap_client": req.sap_client,
        "sap_user": req.sap_user,
        "iat": now,
        "exp": now + JWT_EXPIRY_SECONDS,
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

    return {"access_token": token}


# @app.post("/api/session/create")
# def session_create(req: SessionCreateRequest, authorization: Optional[str] = Header(None)):
#     claims = decode_jwt(authorization)

#     if not req.raw_data:
#         raise HTTPException(400, "raw_data required")

#     session_id = str(uuid.uuid4())

#     result = calculate_cof_dashboard(req.raw_data)
#     result_ai = calculate_cof_dashboard_insights(req.raw_data)

#     session_data = {
#         "result": result,
#         "result_ai": result_ai,
#         "created_at": int(time.time()),
#         "expires_at": claims["exp"],
#     }

#     save_session(session_id, session_data)

#     token = authorization.split(" ")[1]

#     return {
#         "session_id": session_id,
#         "frontend_url": f"{REACT_APP_URL}?token={token}&session_id={session_id}",
#     }

@app.post("/api/session/create")
def session_create(
    req: SessionCreateRequest,
    authorization: Optional[str] = Header(None),
):
    # 🔐 Validate JWT
    claims = decode_jwt(authorization)

    # ❗ Validate input
    if not req.raw_data or not isinstance(req.raw_data, list):
        raise HTTPException(
            status_code=400,
            detail="raw_data must be a non-empty list",
        )

    # 🆔 Generate session ID
    session_id = str(uuid.uuid4())

    # ⏱ Current time
    now = int(time.time())

    # -------------------------------
    # 🔥 STEP 1: Perform calculations
    # -------------------------------
    try:
        result = calculate_cof_dashboard(req.raw_data)
        result_ai = calculate_cof_dashboard_insights(req.raw_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Calculation failed: {str(e)}",
        )

    # -------------------------------
    # 💾 STEP 2: Prepare session data
    # -------------------------------
    session_data = {
        "session_id": session_id,
        "sap_sid": claims.get("sap_sid"),
        "sap_user": claims.get("sap_user"),
        "dashboard": req.dashboard,
        "filters": req.filters,

        # ✅ Store raw for future flexibility (IMPORTANT)
        "raw_data": req.raw_data,

        # ✅ Store computed responses
        "result": result,
        "result_ai": result_ai,

        # metadata
        "created_at": now,
        "expires_at": claims.get("exp"),
    }

    # -------------------------------
    # ☁️ STEP 3: Save to Blob Storage
    # -------------------------------
    try:
        blob_client = container_client.get_blob_client(f"{session_id}.json")

        blob_client.upload_blob(
            json.dumps(session_data),
            overwrite=True,
            content_type="application/json"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store session in blob: {str(e)}",
        )

    # -------------------------------
    # 🔗 STEP 4: Prepare frontend URL
    # -------------------------------
    token = authorization.split(" ")[1]

    frontend_url = (
        f"{REACT_APP_URL}"
        f"?token={token}"
        f"&session_id={session_id}"
        f"&sid={claims.get('sap_sid')}"
        f"&client={claims.get('sap_client')}"
        f"&dashboard={req.dashboard}"
    )

    # -------------------------------
    # ✅ RESPONSE
    # -------------------------------
    return {
        "session_id": session_id,
        "frontend_url": frontend_url,
        "row_count": len(req.raw_data),
        "expires_in": claims.get("exp") - now if claims.get("exp") else None,
    }

@app.post("/api/data/query")
def data_query(req: DataQueryRequest, authorization: Optional[str] = Header(None)):
    decode_jwt(authorization)

    session = get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Session expired")

    return session["result"]


@app.post("/data/query/ai")
def data_query_ai(req: DataQueryRequest, authorization: Optional[str] = Header(None)):
    decode_jwt(authorization)

    session = get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Session expired")

    return session["result_ai"]


# ---------------------------------------------------------------------------
# CALCULATION ENGINE
# ---------------------------------------------------------------------------
def calculate_cof_dashboard(raw_data):
    total_closing = 0
    total_accrual = 0
    total_rate = 0

    product_mix = {}
    rate_split = {"Fixed": 0, "Floating": 0}
    portfolio_split = {}

    for row in raw_data:
        closing = float(row.get("Closing Amt", 0))
        accrual = float(row.get("Wt Int Amt-EIR", 0))
        rate = float(row.get("Avg Rate - EIR", 0))

        total_closing += closing
        total_accrual += accrual
        total_rate += rate

        ptype = row.get("Prd Type Desc", "Unknown")
        product_mix[ptype] = product_mix.get(ptype, 0) + closing

        rtype = row.get("Rate Type", "Unknown")
        if rtype in rate_split:
            rate_split[rtype] += closing

        portfolio = row.get("Portfolio Desc", "Unknown")
        portfolio_split[portfolio] = portfolio_split.get(portfolio, 0) + closing

    count = len(raw_data)
    avg_rate = total_rate / count if count else 0

    return {
        "overview": {
            "kpis": {
                "Closing Balance": {"Title": total_closing},
                "Monthly Accural": {"Title": total_accrual},
                "Avg Eir Rate": {"Title": round(avg_rate, 2)},
                "Total Closing": {"Title": total_closing},
            },
            "Charts": {
                "Product Type Mix": product_mix,
                "Summary Metrics": {
                    "Total Book": total_closing,
                    "Wtd Avg EIR": avg_rate,
                    "Total Accrual": total_accrual,
                    "Active Lines": count
                },
                "Rate & Mix Snapshot": {
                    "Fixed Rate": rate_split["Fixed"],
                    "Floating Rate": rate_split["Floating"],
                    "Avg Exit Rate": avg_rate,
                    "Avg Coupon/Yield": avg_rate,
                    "2026_Maturities": 0,
                    "Peak_Maturity": 0
                },
                "Portfolio & Rate Type Split": {
                    "Portfolio": portfolio_split,
                    "Rate Type": rate_split
                }
            },
            "Table": [{
                "Period": total_closing,
                "Closing": total_closing,
                "Accural": total_accrual,
                "Avg Eir": avg_rate,
                "Count": count
            }]
        }
    }


def calculate_cof_dashboard_insights(raw_data):
    return {
        "insights": [
            "Floating exposure dominates portfolio",
            "Average rate stable",
            "Portfolio concentrated in secured liabilities"
        ]
    }
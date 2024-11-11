import json
import logging
import glob
import hashlib
import string
import random
import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from os import path

app = FastAPI()

# URL Constants
BASE_URL_VJ = "https://below.black/sync/vj/"
BASE_URL_SCENO = "https://below.black/sync/"

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("app")


class Event(BaseModel):
    name: str
    day: int
    month: int
    year: int


class Login(BaseModel):
    username: str
    password: str


whitelist = {"POST /auth", "GET /events", "GET /vj", "GET /sceno"}


@app.middleware("http")
async def check_auth_header(request: Request, call_next):
    call = f"{request.method.upper()} {request.url.path}".replace("/api", "")

    if request.method.upper() == "OPTIONS":
        return await call_next(request)  # Let CORS middleware handle OPTIONS

    if call in whitelist or (
        request.headers.get("token", "").startswith("T")
        and path.exists(f"data/tokens/{request.headers['token']}")
    ):
        return await call_next(request)

    return JSONResponse("Unauthorized", status_code=403)


@app.put("/api/event")
@app.delete("/api/event")
def modify_event(event: Event, request: Request):
    mode = "PUT" if request.method == "PUT" else "DELETE"
    with open("data/events.json", "r+") as f:
        events = json.load(f)
        if mode == "DELETE":
            events = [
                e
                for e in events
                if not (
                    e["name"] == event.name
                    and e["date"] == f"{event.day:02} {event.month:02} {event.year}"
                )
            ]
        else:
            events.append(
                {
                    "name": event.name,
                    "date": f"{event.day:02} {event.month:02} {event.year}",
                }
            )
        f.seek(0)
        json.dump(events, f)
        f.truncate()
    return {"success": True}


@app.get("/api/events")
def get_events():
    with open("data/events.json") as f:
        events = json.load(f)
        events.sort(key=lambda x: datetime.datetime.strptime(x["date"], "%d %m %Y"))
    return events


@app.get("/api/vj")
def get_vj_files():
    files = sorted(
        [f for f in glob.glob("/tmp/sync/vj/*") if f.split(".")[-1].lower() in ("jpg", "png")],
        key=lambda x: int(x.split("/")[-1].split(".")[0])
    )
    return [f"{BASE_URL_VJ}{f.split('/')[-1]}" for f in files if not f.endswith(".txt")]


@app.get("/api/sceno")
def get_scenes():
    folders = sorted(glob.glob("/tmp/sync/sceno_*"), reverse=True, key=lambda x: int(x.split("_")[1]))
    scenes = {}

    for folder in folders:
        files = glob.glob(f"{folder}/*")
        images = sorted(
            [
                f"{BASE_URL_SCENO}{folder.split('/')[-1]}/{f.split('/')[-1]}"
                for f in files
                if f.split(".")[-1].lower() in ("jpg", "png")
            ]
        )

        if images:
            description, copyright = "", ""
            for f in files:
                filename = f.split("/")[-1]
                if filename == "description.txt":
                    with open(f) as file:
                        description = file.read().strip()
                elif filename == "copyright.txt":
                    with open(f) as file:
                        copyright = file.read().strip()

            scenes[folder.split("/")[-1]] = {
                "img": images,
                "description": description,
                "copyright": copyright,
            }

    return scenes


@app.post("/api/auth")
def authenticate_user(login: Login):
    with open("data/users.json") as f:
        users = json.load(f)
        token = "T" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=16)
        )

        if (
            users.get(login.username)
            == hashlib.sha256(login.password.encode("utf-8")).hexdigest()
        ):
            with open(f"data/tokens/{token}", "w") as token_file:
                token_file.write(login.username)
            return {"token": token}

    return JSONResponse(status_code=401, content="Unauthorized")

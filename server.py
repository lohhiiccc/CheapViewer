from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import mss
from lib.IOControler.IOController import Controller
import time

controller = Controller()
app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIRECTORY = "./uploads"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}

@app.get("/get-image/{filename}")
def get_image(filename: str):
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

@app.get("/screenshot/")
def take_screenshot():
    screenshot_path = os.path.join(UPLOAD_DIRECTORY, "screenshot.png")
    with mss.mss() as sct:
        sct.shot(output=screenshot_path)
    return FileResponse(screenshot_path)

last_time = time.time()

@app.get("/mouse/move/{x}/{y}")
def mouse_move(x: int, y: int):
    global last_time
    if (time.time() - last_time < 0.1):
        return {"info": "Mouse move ignored due to rate limiting"}
    try:
        controller.mouse_move(x, y)
        last_time = time.time()
        return {"info": f"Mouse moved to ({x}, {y})"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/resolution/")
def resolution():
    x, y = controller.get_screen_resolution()
    return {"width": x, "height": y}


@app.get("/mouse/click/{x}/{y}/{button}")
def mouse_click(x: int, y: int, button: int):
    controller.mouse_move(x, y)
    controller.mouse_click(button)


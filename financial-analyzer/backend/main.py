from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import uuid
import time
import json
import asyncio
from pathlib import Path
from typing import AsyncGenerator

from config import config
from services.file_handler import file_handler
from services.multi_stage_analyzer import create_multi_stage_analyzer
from services.warren_buffett_chat import create_warren_buffett_chat

app = FastAPI(title="Financial Analyzer API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize multi-stage analyzer (7 institutional-grade stages)
multi_stage_analyzer = create_multi_stage_analyzer(config.ANTHROPIC_API_KEY)

# Initialize Warren Buffett chat service
warren_chat = create_warren_buffett_chat(config.ANTHROPIC_API_KEY)

# Create upload directory
os.makedirs(config.TEMP_UPLOAD_DIR, exist_ok=True)

# In-memory storage for uploaded files and analyses
uploaded_files = {}
analysis_cache = {}  # Store analyses for chat access


class AnalyzeRequest(BaseModel):
    file_id: str
    user_query: str


class ChatRequest(BaseModel):
    file_id: str
    question: str
    chat_history: list = []


@app.get("/")
def read_root():
    return {
        "message": "Financial Analyzer API",
        "endpoints": ["/api/upload", "/api/analyze", "/api/chat"]
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file (audio, video, or image)
    Returns: file_id, file_type, file_size, original_filename
    """
    try:
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > config.get_max_file_size_bytes():
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {config.MAX_FILE_SIZE_MB}MB"
            )

        # Get file extension
        filename = file.filename
        extension = Path(filename).suffix

        # Check if file type is supported
        if not config.is_supported_file(extension):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {extension}"
            )

        # Generate unique file ID
        file_id = str(uuid.uuid4())
        file_type = config.get_file_type(extension)

        # Save file
        file_path = os.path.join(config.TEMP_UPLOAD_DIR, f"{file_id}{extension}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Store file metadata
        uploaded_files[file_id] = {
            "file_id": file_id,
            "file_path": file_path,
            "file_type": file_type,
            "file_size": file_size,
            "original_filename": filename,
            "extension": extension
        }

        print(f"File uploaded: {filename} ({file_type}, {file_size} bytes)")

        return {
            "file_id": file_id,
            "file_type": file_type,
            "file_size": file_size,
            "original_filename": filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def analyze_file(request: AnalyzeRequest):
    """
    Analyze an uploaded file with Claude
    Body: { file_id: str, user_query: str }
    Returns: { analysis: str, processing_time: float }
    """
    try:
        start_time = time.time()

        # Check if file exists
        if request.file_id not in uploaded_files:
            raise HTTPException(status_code=404, detail="File not found")

        file_info = uploaded_files[request.file_id]
        file_path = file_info["file_path"]
        file_type = file_info["file_type"]

        print(f"Analyzing {file_type} file: {file_info['original_filename']}")

        # Prepare context for Claude
        context = {
            "user_query": request.user_query
        }

        # Process based on file type
        if file_type == "audio":
            # Extract transcription
            print("Extracting audio transcription...")
            transcription = file_handler.extract_audio_transcription(file_path)
            context["transcription"] = transcription

        elif file_type == "video":
            # Extract transcription and frames with timestamps for cross-verification
            print("Extracting video transcription with timestamps...")
            transcription = file_handler.extract_audio_transcription(file_path)
            context["transcription"] = transcription

            print("Extracting video frames with timestamps (2 fps for detailed analysis)...")
            frames_with_metadata = file_handler.extract_video_frames(file_path, fps=2)

            # Extract just the base64 data for frames while keeping timestamp info
            frames_base64 = [f['data'] for f in frames_with_metadata]
            frame_timestamps = [f['timestamp'] for f in frames_with_metadata]

            context["frames"] = frames_base64
            context["frame_timestamps"] = frame_timestamps
            print(f"✓ Extracted {len(frames_base64)} high-quality frames with timestamps for cross-verification")

        elif file_type == "image":
            # Extract text via OCR
            print("Extracting text from image...")
            ocr_text = file_handler.extract_text_from_image(file_path)
            context["ocr_text"] = ocr_text

            # Convert image to base64
            image_base64 = file_handler.image_to_base64(file_path)
            context["image_base64"] = image_base64

        # Analyze with multi-stage analyzer (7 institutional-grade stages)
        print("🎯 Starting 7-stage deep analysis...")
        result = multi_stage_analyzer.analyze(context)
        analysis = result["analysis"]
        processing_time = result["processing_time"]

        # Store analysis in cache for chat access
        analysis_cache[request.file_id] = {
            "analysis": analysis,
            "context": context,
            "file_info": file_info,
            "timestamp": time.time()
        }

        return {
            "analysis": analysis,
            "processing_time": processing_time
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-stream")
async def analyze_file_stream(request: AnalyzeRequest):
    """
    Analyze avec streaming SSE pour progression en temps réel
    Body: { file_id: str, user_query: str }
    Returns: Server-Sent Events stream
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # Check if file exists
            if request.file_id not in uploaded_files:
                yield f"data: {json.dumps({'type': 'error', 'message': 'File not found'})}\n\n"
                return

            file_info = uploaded_files[request.file_id]
            file_path = file_info["file_path"]
            file_type = file_info["file_type"]

            # Emit start event
            yield f"data: {json.dumps({'type': 'start', 'message': 'Préparation de l\\'analyse...'})}\n\n"
            await asyncio.sleep(0.1)

            print(f"Analyzing {file_type} file: {file_info['original_filename']}")

            # Prepare context
            context = {"user_query": request.user_query}

            # Process based on file type
            if file_type == "audio":
                yield f"data: {json.dumps({'type': 'processing', 'message': 'Extraction de la transcription audio...'})}\n\n"
                await asyncio.sleep(0.1)
                transcription = file_handler.extract_audio_transcription(file_path)
                context["transcription"] = transcription

            elif file_type == "video":
                yield f"data: {json.dumps({'type': 'processing', 'message': 'Extraction de la transcription vidéo...'})}\n\n"
                await asyncio.sleep(0.1)
                transcription = file_handler.extract_audio_transcription(file_path)
                context["transcription"] = transcription

                yield f"data: {json.dumps({'type': 'processing', 'message': 'Extraction des frames vidéo...'})}\n\n"
                await asyncio.sleep(0.1)
                frames_with_metadata = file_handler.extract_video_frames(file_path, fps=2)
                frames_base64 = [f['data'] for f in frames_with_metadata]
                frame_timestamps = [f['timestamp'] for f in frames_with_metadata]
                context["frames"] = frames_base64
                context["frame_timestamps"] = frame_timestamps

            elif file_type == "image":
                yield f"data: {json.dumps({'type': 'processing', 'message': 'Extraction du texte de l\\'image...'})}\n\n"
                await asyncio.sleep(0.1)
                ocr_text = file_handler.extract_text_from_image(file_path)
                context["ocr_text"] = ocr_text
                image_base64 = file_handler.image_to_base64(file_path)
                context["image_base64"] = image_base64

            # Progress callback for SSE
            async def progress_callback(progress_data):
                event_data = {
                    'type': 'progress',
                    'stage': progress_data['stage'],
                    'total': progress_data['total'],
                    'name': progress_data['name'],
                    'status': progress_data['status'],
                    'progress_pct': progress_data['progress_pct']
                }
                yield f"data: {json.dumps(event_data)}\n\n"
                await asyncio.sleep(0.1)

            # Wrapper to make callback async-compatible
            progress_events = []
            def sync_progress_callback(data):
                progress_events.append(data)

            # Run analysis in executor to not block
            import concurrent.futures
            loop = asyncio.get_event_loop()

            def run_analysis():
                return multi_stage_analyzer.analyze(context, progress_callback=sync_progress_callback)

            # Start analysis
            analysis_task = loop.run_in_executor(None, run_analysis)

            # Stream progress events as they come
            while not analysis_task.done():
                if progress_events:
                    event_data = progress_events.pop(0)
                    yield f"data: {json.dumps({'type': 'progress', **event_data})}\n\n"
                await asyncio.sleep(0.2)

            # Get final result
            result = await analysis_task

            # Stream any remaining progress events
            while progress_events:
                event_data = progress_events.pop(0)
                yield f"data: {json.dumps({'type': 'progress', **event_data})}\n\n"
                await asyncio.sleep(0.1)

            analysis = result["analysis"]
            processing_time = result["processing_time"]

            # Store in cache for chat
            analysis_cache[request.file_id] = {
                "analysis": analysis,
                "context": context,
                "file_info": file_info,
                "timestamp": time.time()
            }

            # Emit completion event
            yield f"data: {json.dumps({'type': 'complete', 'analysis': analysis, 'processing_time': processing_time})}\n\n"

        except Exception as e:
            print(f"❌ Error in streaming analysis: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/api/chat")
async def chat_with_warren(request: ChatRequest):
    """
    Chat avec Warren Buffett au sujet de l'analyse
    Body: { file_id: str, question: str, chat_history: list }
    Returns: { response: str }
    """
    try:
        # Check if analysis exists for this file
        if request.file_id not in analysis_cache:
            raise HTTPException(
                status_code=404,
                detail="Analyse non trouvée. Veuillez d'abord analyser le fichier."
            )

        # Récupérer l'analyse du cache
        cached_data = analysis_cache[request.file_id]
        analysis = cached_data["analysis"]
        context = cached_data.get("context", {})

        print(f"💬 Chat question: {request.question[:100]}...")

        # Appeler le service de chat Warren Buffett
        response = warren_chat.chat(
            question=request.question,
            analysis=analysis,
            file_context=context,
            chat_history=request.chat_history
        )

        print(f"✓ Chat response generated ({len(response)} chars)")

        return {
            "response": response
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

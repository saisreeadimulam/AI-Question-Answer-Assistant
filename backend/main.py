import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if not os.environ.get("GEMINI_API_KEY"):
    print("Warning: GEMINI_API_KEY environment variable is not set in backend/.env")


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from typing import List, Optional
from app.rag.ingestion import process_pdf, process_documents
from app.agent.react_agent import get_agent_executor

app = FastAPI(title="AI Q&A System API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/upload")
async def upload_document(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None)
):
    upload_files: List[UploadFile] = []
    if files:
        upload_files.extend(files)
    if file:
        upload_files.append(file)

    if not upload_files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    result = await process_documents(upload_files)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result

import asyncio

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Streams the agent's thought process and final answer.
    Yields instant SSE handshake frame followed by tool execution and LLM response chunks.
    Includes an automatic 3-attempt fail-safe retry loop for first-attempt Q&A execution.
    """
    async def generate():
        # INSTANT HANDSHAKE: Send immediate initial state chunk to flush headers & prevent browser stream timeouts
        yield f"data: {json.dumps({'type': 'state', 'state': 'searching'})}\n\n"

        fallback_models = ["models/gemini-3.5-flash-lite", "models/gemini-3.5-flash", "models/gemini-2.5-flash"]
        max_attempts = len(fallback_models)
        attempt = 0
        success = False
        last_error = None

        while attempt < max_attempts and not success:
            current_model = fallback_models[attempt]
            attempt += 1
            try:
                agent_executor = get_agent_executor(model_name=current_model)
                chunks_emitted = 0

                async for event in agent_executor.astream_events(
                    {"messages": [("user", request.message)], "input": request.message},
                    version="v2"
                ):
                    kind = event["event"]

                    if kind == "on_tool_start":
                        yield f"data: {json.dumps({'type': 'state', 'state': 'searching'})}\n\n"

                    elif kind == "on_tool_end":
                        yield f"data: {json.dumps({'type': 'state', 'state': 'analyzing'})}\n\n"

                    elif kind == "on_chat_model_stream":
                        chunk = event["data"]["chunk"]
                        if chunk.content:
                            content_text = chunk.content
                            if isinstance(content_text, list):
                                content_text = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content_text])
                            
                            if content_text:
                                chunks_emitted += 1
                                yield f"data: {json.dumps({'type': 'state', 'state': 'generating'})}\n\n"
                                yield f"data: {json.dumps({'type': 'chunk', 'content': str(content_text)})}\n\n"

                success = True
                yield f"data: {json.dumps({'type': 'done'})}\n\n"

            except Exception as e:
                last_error = e
                print(f"Chat stream attempt {attempt}/{max_attempts} ({current_model}) error: {e}")
                if attempt < max_attempts:
                    yield f"data: {json.dumps({'type': 'state', 'state': 'searching'})}\n\n"
                    await asyncio.sleep(0.5)

        if not success:
            yield f"data: {json.dumps({'type': 'error', 'message': str(last_error)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

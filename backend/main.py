import os
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PyPDF2 import PdfReader
from litellm import completion  # Assuming `litellm` is a wrapper for GPT-3/4 API
from requests_html import AsyncHTMLSession
from bs4 import BeautifulSoup
import requests
import logging

# Environment variables
model = os.environ.get("LLM_MODEL", "gpt-3.5-turbo-16k")
chunk_size = int(os.environ.get("CHUNK_SIZE", 10000))

# Initialize FastAPI app
app = FastAPI()

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# -------- Text Splitting Utility -------- #
def split_text(text, max_length=10000):
    paragraphs = text.split("\n")
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    chunks = []
    current_chunk = ""

    for p in paragraphs:
        if len(current_chunk) + len(p) <= max_length:
            current_chunk += f"{p} "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = p

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


# -------- PDF Text Extraction -------- #
def extract_pdf_text(file_path):
    text_array = []
    reader = PdfReader(file_path)
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_array.append(text)
    return text_array


# -------- URL Scraping Utility -------- #
async def scrape_url_content(url, render_js=False):
    try:
        if not render_js:
            # Static page scraping
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                logger.error(
                    f"Failed to fetch the URL: {url} - Status Code: {response.status_code}"
                )
                raise HTTPException(status_code=400, detail="Failed to fetch the URL.")
            soup = BeautifulSoup(response.content, "html.parser")
            paragraphs = soup.find_all("p")
            text = " ".join([p.get_text() for p in paragraphs])
            return text.split("\n") if text else []

        # JS rendering with requests_html
        session = AsyncHTMLSession()
        response = await session.get(url)
        await response.html.arender(timeout=90, sleep=2)

        text = " ".join([elem.text for elem in response.html.find("p")])
        return text.split("\n") if text else []

    except Exception as e:
        logger.error(f"Error scraping URL: {url} - {str(e)}")
        return []


# -------- GPT Summarization -------- #
def call_gpt_api(prompt, additional_messages=None):
    messages = [
        {"role": "system", "content": "You are an expert summarizer."},
        {"role": "user", "content": prompt},
    ]
    if additional_messages:
        messages.extend(additional_messages)

    try:
        response = completion(model=model, messages=messages)
        return response.choices[0].message["content"].strip()
    except Exception as e:
        logger.error(f"Error in GPT API call: {str(e)}")
        return "Error in generating summary"


# -------- Summarization Function -------- #
def summarize(text_array):
    def create_chunks(paragraphs, chunk_size=10000):
        chunks = []
        chunk = ""
        for paragraph in paragraphs:
            if len(chunk) + len(paragraph) < chunk_size:
                chunk += paragraph + " "
            else:
                chunks.append(chunk.strip())
                chunk = paragraph + " "
        if chunk:
            chunks.append(chunk.strip())
        return chunks

    text_chunks = create_chunks(text_array)
    summaries = []

    for chunk in text_chunks:
        summary = call_gpt_api(f"Summarize:\n{chunk}")
        summaries.append(summary)

    return " ".join(summaries)


# -------- Request Models -------- #
class SummaryRequest(BaseModel):
    text: str


class ScrapeRequest(BaseModel):
    url: str
    render_js: bool = False


# -------- API Endpoints -------- #


# --- Scraping Endpoint --- #
@app.post("/scrape")
async def scrape_url(request: ScrapeRequest):
    """
    Scrape content from a URL.
    This endpoint scrapes the textual content from a URL (supports static and dynamic pages).
    """
    try:
        text_array = await scrape_url_content(request.url, render_js=request.render_js)
        if not text_array:
            raise HTTPException(status_code=400, detail="Unable to scrape the URL")
        return {"content": "\n".join(text_array)}
    except Exception as e:
        logger.error(f"Error scraping URL content: {str(e)}")
        raise HTTPException(status_code=500, detail="Error scraping URL content.")


# --- Summarization Endpoint --- #
@app.post("/summarize")
async def summarize_text(request: SummaryRequest):
    """
    Summarize a given text.
    This endpoint accepts a string of text and returns a summarized version.
    """
    try:
        text_array = split_text(request.text)
        summary = summarize(text_array)
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        raise HTTPException(status_code=500, detail="Error summarizing text.")


# --- Summarize PDF Endpoint --- #
@app.post("/summarize/pdf")
async def summarize_pdf(file: UploadFile = File(...)):
    """
    Extract and summarize text from a PDF file.
    This endpoint accepts a PDF file, extracts the text, and returns a summarized version.
    """
    try:
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        text_array = extract_pdf_text(file_path)
        summary = summarize(text_array)
        os.remove(file_path)
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing PDF.")

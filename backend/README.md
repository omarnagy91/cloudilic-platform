### **Backend API Documentation**

#### **Environment Setup**:
- **Environment Variables**:
  - `LLM_MODEL`: The language model to use (default: `"gpt-3.5-turbo-16k"`).
  - `CHUNK_SIZE`: The chunk size for splitting text (default: `10000`).

#### **API Endpoints**:

1. **Scrape URL Endpoint**:
   - **URL**: `/scrape`
   - **Method**: `POST`
   - **Description**: Scrapes content from a given URL.
   - **Request**:
     ```json
     {
       "url": "https://example.com",
       "render_js": false  // Optional; defaults to false
     }
     ```
   - **Response**:
     ```json
     {
       "content": "Scraped text content from the URL..."
     }
     ```

2. **Summarize Text Endpoint**:
   - **URL**: `/summarize`
   - **Method**: `POST`
   - **Description**: Summarizes a block of text.
   - **Request**:
     ```json
     {
       "text": "Long text that needs summarization..."
     }
     ```
   - **Response**:
     ```json
     {
       "summary": "Shortened summarized text..."
     }
     ```

3. **Summarize PDF Endpoint**:
   - **URL**: `/summarize/pdf`
   - **Method**: `POST`
   - **Description**: Summarizes the content of an uploaded PDF file.
   - **Request**:
     - PDF file uploaded as multipart form data.
   - **Response**:
     ```json
     {
       "summary": "Summarized content from the PDF..."
     }
     ```

4. **Error Handling**:
   - All endpoints return `500` status code on failure with a `detail` field describing the error.
   - Example error response:
     ```json
     {
       "detail": "Error message describing the issue"
     }
     ```

#### **How the API Works**:
1. **Scraping**:
   - The `/scrape` endpoint scrapes content from the provided URL and returns raw text. This can be passed to the summarization service if needed.

2. **Summarization**:
   - The `/summarize` endpoint accepts raw text and returns a summarized version.
   - The `/summarize/pdf` endpoint handles PDF files, extracting and summarizing their text content.


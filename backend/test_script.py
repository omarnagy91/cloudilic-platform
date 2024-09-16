import pytest
import httpx
from main import scrape_url_content

BASE_URL = "http://127.0.0.1:8000"  # Update this if necessary


@pytest.mark.asyncio
async def test_scrape_url():
    """
    Test the `/scrape` endpoint to ensure URL scraping functionality works.
    """
    async with httpx.AsyncClient() as client:
        # URL to scrape (replace with any valid URL)
        test_url = "https://en.wikipedia.org/wiki/FastAPI"

        # Send a POST request to scrape the URL (as a JSON payload)
        response = await client.post(
            f"{BASE_URL}/scrape",
            json={
                "url": test_url,
                "render_js": False,
            },  # render_js set to False for non-JS page
            timeout=90,  # Increase the timeout for potentially slow scraping operations
        )

        # Print the response to check the scraped content
        print(response.json())

        # Assert that the request was successful
        assert response.status_code == 200

        # Parse the response JSON
        data = response.json()

        # Check if the content key exists in the response and that it is not empty
        assert "content" in data
        assert data["content"] != ""


@pytest.mark.asyncio
async def test_summarize_text():
    """
    Test the `/summarize` endpoint for text summarization.
    """
    async with httpx.AsyncClient() as client:
        # Scrape content for summarization
        url = "https://en.wikipedia.org/wiki/FastAPI"
        scraped_text = await scrape_url_content(url)
        text_to_summarize = "\n".join(scraped_text)

        # Send a POST request with the scraped text to be summarized
        response = await client.post(
            f"{BASE_URL}/summarize",
            json={"text": text_to_summarize},
            timeout=90,  # Increase the timeout to 90 seconds (for heavier load)
        )

        # Print response to check the content
        print(response.json())

        # Assert that the request was successful
        assert response.status_code == 200

        # Parse the response JSON
        data = response.json()

        # Check if the summary key exists in the response and that it is not empty
        assert "summary" in data
        assert data["summary"] != ""


@pytest.mark.asyncio
async def test_summarize_pdf():
    """
    Test the `/summarize/pdf` endpoint for PDF summarization.
    """
    async with httpx.AsyncClient() as client:
        # Open a sample PDF file (replace with an actual test file path)
        file_path = "path/to/test_file.pdf"

        # Send a POST request to summarize the PDF file
        with open(file_path, "rb") as pdf_file:
            response = await client.post(
                f"{BASE_URL}/summarize/pdf",
                files={"file": ("test_file.pdf", pdf_file, "application/pdf")},
                timeout=90,  # Increase timeout for file uploads
            )

            # Print the response to see any error messages
            print(response.json())

            # Assert that the request was successful
            assert response.status_code == 200

            # Parse the response JSON
            data = response.json()

            # Check if the summary key exists in the response and that it is not empty
            assert "summary" in data
            assert data["summary"] != ""

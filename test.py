from requests_html import HTMLSession
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse

def get_all_text_elements(element):
    unwanted_tags = {"script", "style", "noscript"}
    
    collected_text = ""
    
    for tag in element.find("*"):
        if tag.tag not in unwanted_tags and tag.text:
            collected_text += f" {tag.text.strip()}"
    
    return collected_text.strip()

app = FastAPI()

@app.get("/link")
async def read_item(link: str,response_class : PlainTextResponse):
    try:
        # URL is already decoded when passed as a query parameter
        session = HTMLSession()
        r = session.get(link)
        
        item = r.html
        
        return get_all_text_elements(item)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing URL: {str(e)}")


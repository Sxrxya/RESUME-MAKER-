"""PDF generation using Playwright and verification using PyMuPDF."""
import asyncio
import os
import sys
import threading
from typing import Optional


async def _generate_pdf_async(html_content: str, output_path: str) -> str:
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        # Wait extra for font loading
        await page.wait_for_timeout(2000)
        
        await page.pdf(
            path=output_path,
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
        )
        await browser.close()
    
    return output_path


def generate_pdf_sync(html_content: str, output_path: str) -> str:
    """Generate PDF synchronously, handling Streamlit's event loop."""
    try:
        import nest_asyncio
        nest_asyncio.apply()
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(_generate_pdf_async(html_content, output_path))
    except (RuntimeError, ImportError):
        # Run in a separate thread if event loop issues
        result = [None]
        exception = [None]
        
        def run():
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result[0] = loop.run_until_complete(_generate_pdf_async(html_content, output_path))
                loop.close()
            except Exception as e:
                exception[0] = e
        
        thread = threading.Thread(target=run)
        thread.start()
        thread.join(timeout=60)
        
        if exception[0]:
            raise exception[0]
        return result[0]


def verify_pdf(pdf_path: str) -> dict:
    """Verify generated PDF meets requirements."""
    result = {
        "valid": True,
        "page_count": 0,
        "width": 0,
        "height": 0,
        "has_content": False,
        "errors": []
    }
    
    try:
        import fitz
        doc = fitz.open(pdf_path)
        result["page_count"] = len(doc)
        
        if len(doc) != 1:
            result["valid"] = False
            result["errors"].append(f"Expected 1 page, got {len(doc)}")
        
        if len(doc) > 0:
            page = doc[0]
            rect = page.rect
            result["width"] = round(rect.width, 2)
            result["height"] = round(rect.height, 2)
            
            # Check dimensions (A4: ~595x842, allow tolerance)
            if abs(rect.width - 595.28) > 10 or abs(rect.height - 841.89) > 10:
                result["errors"].append(f"Page dimensions {rect.width:.0f}x{rect.height:.0f} don't match A4 (595x842)")
            
            # Check for content
            text = page.get_text()
            images = page.get_images()
            if text.strip() or images:
                result["has_content"] = True
            else:
                result["errors"].append("No content detected in PDF")
        
        doc.close()
        
        if result["errors"]:
            result["valid"] = False
            
    except ImportError:
        result["errors"].append("PyMuPDF not installed for verification")
    except Exception as e:
        result["valid"] = False
        result["errors"].append(f"Verification error: {str(e)}")
    
    return result

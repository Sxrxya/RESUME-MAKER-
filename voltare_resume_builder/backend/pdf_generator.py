"""PDF generation using Playwright and verification using PyMuPDF."""
import os
import sys
import threading


def _generate_pdf(html_content: str, output_path: str) -> str:
    if sys.platform == "win32":
        import asyncio
        try:
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        except Exception:
            pass

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page()
            page.set_content(html_content, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(1000)
            page.pdf(
                path=output_path,
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                prefer_css_page_size=True,
            )
        finally:
            browser.close()

    return output_path


def generate_pdf_sync(html_content: str, output_path: str) -> str:
    """Generate a PDF in an isolated thread with Proactor event loop on Windows."""
    result = []
    errors = []

    def run():
        if sys.platform == "win32":
            import asyncio
            try:
                asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
                loop = asyncio.ProactorEventLoop()
                asyncio.set_event_loop(loop)
            except Exception:
                pass

        try:
            result.append(_generate_pdf(html_content, output_path))
        except Exception as error:
            errors.append(error)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    thread.join(timeout=90)

    if thread.is_alive():
        raise TimeoutError("PDF generation timed out after 90 seconds")
    if errors:
        error = errors[0]
        raise RuntimeError(f"PDF generation failed ({type(error).__name__}): {error}") from error
    if not result:
        raise RuntimeError("PDF generation ended without returning an output path")

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

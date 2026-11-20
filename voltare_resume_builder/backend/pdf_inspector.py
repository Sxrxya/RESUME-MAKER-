"""PDF inspection utilities for Voltare resume builder."""
import os
from typing import Optional


def inspect_pdf(pdf_path: str) -> dict:
    """Inspect a PDF file and return layout information."""
    try:
        import fitz
    except ImportError:
        return {"error": "PyMuPDF not installed"}
    
    doc = fitz.open(pdf_path)
    page = doc[0]
    rect = page.rect
    
    info = {
        "page_count": len(doc),
        "width_pts": round(rect.width, 2),
        "height_pts": round(rect.height, 2),
        "width_inches": round(rect.width / 72, 2),
        "height_inches": round(rect.height / 72, 2),
        "orientation": "portrait" if rect.height > rect.width else "landscape",
    }
    
    # Extract images
    images = page.get_images(full=True)
    info["images"] = [{
        "xref": img[0],
        "width": img[2],
        "height": img[3],
        "colorspace": img[5],
    } for img in images]
    
    # Extract image placements
    img_info = page.get_image_info(xrefs=True)
    info["image_placements"] = [{
        "xref": ii["xref"],
        "bbox": list(ii["bbox"]),
        "width": ii["width"],
        "height": ii["height"],
    } for ii in img_info]
    
    doc.close()
    return info


def extract_watermark(pdf_path: str, output_path: str) -> Optional[str]:
    """Extract the watermark image from the PDF."""
    try:
        import fitz
    except ImportError:
        return None
    
    doc = fitz.open(pdf_path)
    page = doc[0]
    images = page.get_images(full=True)
    
    if images:
        xref = images[0][0]
        pix = fitz.Pixmap(doc, xref)
        if pix.n > 4:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        pix.save(output_path)
        doc.close()
        return output_path
    
    doc.close()
    return None

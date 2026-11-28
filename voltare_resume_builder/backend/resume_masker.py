"""
Resume Masking Engine for Voltare Resume Builder
Supports PDF and DOCX anonymization while strictly preserving original
document formatting, layout, fonts, and structure.

Masking Requirements:
- Phone Number: Mask the last 5 digits (e.g. 9876543210 -> 98765XXXXX, +91 98765 43210 -> +91 98765 XXXXX)
- LinkedIn Profile: Keep the LinkedIn label and mask the remaining field content.
- Email Address: Mask username before @, preserve domain (e.g. akashkumar@gmail.com -> XXXXXXXXXX@gmail.com)
- GitHub Profile: Keep "Git" and mask the remaining field content.
"""

import io
import os
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

import docx
import fitz
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml.ns import qn

# Regular expression patterns for personal identifiable information (PII)
EMAIL_PATTERN = re.compile(
    r'\b([A-Za-z0-9._%+-]+)(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b',
    re.IGNORECASE
)

LINKEDIN_PATTERN = re.compile(
    r'((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/|linkedin(?=\/))([^\s|,;]*)',
    re.IGNORECASE
)

GITHUB_PATTERN = re.compile(
    r'((?:https?:\/\/)?(?:www\.)?github\.com\/|github(?=\/))([^\s|,;]*)',
    re.IGNORECASE
)

MASKED_LINK_REDIRECT_URL = "https://www.voltare.in/"

# Phone pattern matching domestic and international formats with optional separators
PHONE_PATTERN = re.compile(
    r'(\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,5}(?:[-.\s]?\d{1,5})?'
)

YEAR_RANGE_PATTERN = re.compile(
    r'\s*(?:19|20)\d{2}(?:[\s.,/\-\u2013\u2014\u2212]*(?:(?:19|20)\d{2}|\d{2}))*\s*'
)


def mask_phone_number(val: str) -> str:
    """Mask the last 5 digits of each phone number."""
    digits = [i for i, c in enumerate(val) if c.isdigit()]
    if len(digits) >= 7:
        to_mask = set(digits[-5:])
        return ''.join('X' if i in to_mask else c for i, c in enumerate(val))
    return val


def is_year_range(val: str) -> bool:
    """Keep education and employment year ranges out of phone masking."""
    return bool(YEAR_RANGE_PATTERN.fullmatch(val))


def mask_email_address(user: str, domain: str) -> str:
    """Mask the entire username portion before @ with matching count of X."""
    mask_len = max(len(user), 8)
    return ('X' * len(user)) + domain


def mask_linkedin_url(prefix: str, user: str, suffix: str) -> str:
    """Keep the LinkedIn label visible and mask the rest of the profile field."""
    masked_length = max(len(prefix) + len(user) + len(suffix) - len("LinkedIn"), 0)
    return f"LinkedIn{'X' * masked_length}"


def mask_github_url(prefix: str, user: str, suffix: str) -> str:
    """Keep only "Git" visible and mask the rest of the profile field."""
    masked_length = max(len(prefix) + len(user) + len(suffix) - len("Git"), 0)
    return f"Git{'X' * masked_length}"


def mask_text_content(text: str) -> Tuple[str, Dict[str, int]]:
    """
    Apply masking to plain text content and return masked text + stats.
    """
    stats = {
        "emails": 0,
        "linkedin_profiles": 0,
        "github_profiles": 0,
        "phone_numbers": 0,
        "total_masked": 0,
    }

    # 1. Mask Emails
    def replace_email(m):
        stats["emails"] += 1
        stats["total_masked"] += 1
        return mask_email_address(m.group(1), m.group(2))

    text = EMAIL_PATTERN.sub(replace_email, text)

    # 2. Mask LinkedIn
    def replace_li(m):
        stats["linkedin_profiles"] += 1
        stats["total_masked"] += 1
        return mask_linkedin_url(m.group(1), m.group(2), "")

    text = LINKEDIN_PATTERN.sub(replace_li, text)

    # 3. Mask GitHub
    def replace_gh(m):
        stats["github_profiles"] += 1
        stats["total_masked"] += 1
        return mask_github_url(m.group(1), m.group(2), "")

    text = GITHUB_PATTERN.sub(replace_gh, text)

    # 4. Mask Phone Numbers
    def replace_phone(m):
        val = m.group(0).strip()
        if is_year_range(val):
            return val
        masked = mask_phone_number(val)
        if masked != val:
            stats["phone_numbers"] += 1
            stats["total_masked"] += 1
            return masked
        return val

    text = PHONE_PATTERN.sub(replace_phone, text)

    return text, stats


def find_maskable_entities(text: str) -> List[Tuple[str, str, str]]:
    """
    Identify all maskable entities in text: returns list of (entity_type, original_text, masked_text).
    """
    entities = []

    # Emails
    for m in EMAIL_PATTERN.finditer(text):
        raw = m.group(0)
        masked = mask_email_address(m.group(1), m.group(2))
        entities.append(("email", raw, masked))

    # LinkedIn
    for m in LINKEDIN_PATTERN.finditer(text):
        raw = m.group(0)
        masked = mask_linkedin_url(m.group(1), m.group(2), "")
        entities.append(("linkedin", raw, masked))

    # GitHub
    for m in GITHUB_PATTERN.finditer(text):
        raw = m.group(0)
        masked = mask_github_url(m.group(1), m.group(2), "")
        entities.append(("github", raw, masked))

    # Phone Numbers
    for m in PHONE_PATTERN.finditer(text):
        raw = m.group(0).strip()
        if is_year_range(raw):
            continue
        masked = mask_phone_number(raw)
        if masked != raw:
            entities.append(("phone", raw, masked))

    # Sort longer matches first to avoid partial replacements
    entities.sort(key=lambda x: len(x[1]), reverse=True)
    return entities


def _find_pdf_text_rects(page, text: str) -> List[fitz.Rect]:
    """Find text split across PDF spans when PyMuPDF's direct search misses it."""
    rects = []
    page_dict = page.get_text("rawdict")
    for block in page_dict.get("blocks", []):
        for line in block.get("lines", []):
            chars = [
                char
                for span in line.get("spans", [])
                for char in span.get("chars", [])
            ]
            line_text = "".join(char.get("c", "") for char in chars)
            start = 0
            while True:
                start = line_text.find(text, start)
                if start < 0:
                    break
                matched_chars = chars[start:start + len(text)]
                if len(matched_chars) == len(text):
                    rects.append(fitz.Rect(
                        min(char["bbox"][0] for char in matched_chars),
                        min(char["bbox"][1] for char in matched_chars),
                        max(char["bbox"][2] for char in matched_chars),
                        max(char["bbox"][3] for char in matched_chars),
                    ))
                start += len(text)
    return rects


def mask_pdf(file_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
    """
    Mask sensitive information and redirect external links while preserving PDF layout.
    """
    stats = {
        "emails": 0,
        "linkedin_profiles": 0,
        "github_profiles": 0,
        "phone_numbers": 0,
        "total_masked": 0,
    }

    doc = fitz.open(stream=file_bytes, filetype="pdf")
    external_links_by_page = {
        page.number: [link for link in page.get_links() if link.get("uri")]
        for page in doc
    }

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        page_text = page.get_text()
        entities = find_maskable_entities(page_text)

        if entities:
            # Get detailed font and span layout dictionary for precise font matching
            page_dict = page.get_text("dict")
            spans_by_text = []
            for block in page_dict.get("blocks", []):
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        spans_by_text.append(span)

            for ent_type, original, masked in entities:
                # Search for the original text rects
                rects = page.search_for(original)
                if not rects:
                    rects = _find_pdf_text_rects(page, original)
                if not rects:
                    # Fallback: search without leading/trailing punctuation or trimmed
                    trimmed = original.strip()
                    if trimmed != original:
                        rects = page.search_for(trimmed)
                        if not rects:
                            rects = _find_pdf_text_rects(page, trimmed)

                if not rects:
                    continue

                # Find matching span font details if available
                fontname = "helv"
                fontsize = None
                text_color = (0.1, 0.1, 0.1)

                for s in spans_by_text:
                    if original in s.get("text", "") or s.get("text", "") in original:
                        s_font = s.get("font", "").lower()
                        if any(x in s_font for x in ["times", "serif", "georgia", "garamond"]):
                            fontname = "times-roman"
                        elif any(x in s_font for x in ["courier", "mono", "consolas"]):
                            fontname = "couri"
                        else:
                            fontname = "helv"

                        fontsize = s.get("size")
                        color_int = s.get("color", 0)
                        r = ((color_int >> 16) & 255) / 255.0
                        g = ((color_int >> 8) & 255) / 255.0
                        b = (color_int & 255) / 255.0
                        text_color = (r, g, b)
                        break

                for r in rects:
                    # 1. Redact the original text area cleanly with white background fill
                    page.add_redact_annot(r, fill=(1, 1, 1))

                page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

                # 2. Draw masked replacement text at exact coordinate baseline
                for r in rects:
                    use_fontsize = fontsize or max(r.height * 0.78, 8.0)
                    baseline_y = r.y1 - max((r.height - use_fontsize) / 2.0, 1.5)
                    point = fitz.Point(r.x0, baseline_y)

                    try:
                        page.insert_text(
                            point,
                            masked,
                            fontsize=use_fontsize,
                            fontname=fontname,
                            color=text_color
                        )
                    except Exception:
                        # Fallback to standard helvetica
                        page.insert_text(point, masked, fontsize=use_fontsize, color=text_color)

                # Update statistics
                if ent_type == "email":
                    stats["emails"] += len(rects)
                elif ent_type == "linkedin":
                    stats["linkedin_profiles"] += len(rects)
                elif ent_type == "github":
                    stats["github_profiles"] += len(rects)
                elif ent_type == "phone":
                    stats["phone_numbers"] += len(rects)
                stats["total_masked"] += len(rects)

    # Redactions can remove overlapping link annotations, so restore and redirect
    # every external link captured from the original output copy.
    for page in doc:
        original_links = external_links_by_page.get(page.number, [])
        for original_link in original_links:
            original_rect = original_link["from"]
            matching_link = next(
                (
                    link for link in page.get_links()
                    if link.get("uri") and link.get("from") == original_rect
                ),
                None,
            )
            if matching_link:
                matching_link["uri"] = MASKED_LINK_REDIRECT_URL
                page.update_link(matching_link)
            else:
                page.insert_link({
                    "kind": fitz.LINK_URI,
                    "from": original_rect,
                    "uri": MASKED_LINK_REDIRECT_URL,
                })

    output_stream = doc.tobytes(deflate=True)
    doc.close()
    return output_stream, stats


def _paragraph_text_nodes(p):
    return list(p._p.iter(qn("w:t")))


def _set_text_node_value(node, text: str) -> None:
    node.text = text
    space_attr = qn("xml:space")
    if text[:1].isspace() or text[-1:].isspace():
        node.set(space_attr, "preserve")
    else:
        node.attrib.pop(space_attr, None)


def mask_paragraph(p, entities: List[Tuple[str, str, str]]) -> int:
    """
    Mask entities across normal and hyperlink runs while preserving run formatting.
    """
    text_nodes = _paragraph_text_nodes(p)
    if not text_nodes:
        return 0

    masked_count = 0
    for ent_type, original, masked in entities:
        while True:
            node_texts = [node.text or "" for node in text_nodes]
            paragraph_text = "".join(node_texts)
            start = paragraph_text.find(original)
            if start < 0:
                break
            end = start + len(original)

            offsets = []
            offset = 0
            for value in node_texts:
                offsets.append((offset, offset + len(value)))
                offset += len(value)

            start_node = next(
                i for i, (_, node_end) in enumerate(offsets) if node_end > start
            )
            end_node = next(
                i for i, (node_start, _) in enumerate(offsets) if node_start < end <= offsets[i][1]
            )
            start_offset = start - offsets[start_node][0]
            end_offset = end - offsets[end_node][0]

            if start_node == end_node:
                value = node_texts[start_node]
                _set_text_node_value(
                    text_nodes[start_node],
                    value[:start_offset] + masked + value[end_offset:],
                )
            else:
                _set_text_node_value(
                    text_nodes[start_node],
                    node_texts[start_node][:start_offset] + masked,
                )
                for index in range(start_node + 1, end_node):
                    _set_text_node_value(text_nodes[index], "")
                _set_text_node_value(text_nodes[end_node], node_texts[end_node][end_offset:])
            masked_count += 1

    return masked_count


def mask_docx(file_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
    """
    Mask sensitive information and redirect external links while preserving DOCX structure.
    """
    stats = {
        "emails": 0,
        "linkedin_profiles": 0,
        "github_profiles": 0,
        "phone_numbers": 0,
        "total_masked": 0,
    }

    doc = docx.Document(io.BytesIO(file_bytes))

    # Collect all text from document to find entities
    full_text_chunks = []
    for p in doc.paragraphs:
        full_text_chunks.append("".join(node.text or "" for node in _paragraph_text_nodes(p)))
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    full_text_chunks.append("".join(node.text or "" for node in _paragraph_text_nodes(p)))
    for s in doc.sections:
        for p in s.header.paragraphs:
            full_text_chunks.append("".join(node.text or "" for node in _paragraph_text_nodes(p)))
        for p in s.footer.paragraphs:
            full_text_chunks.append("".join(node.text or "" for node in _paragraph_text_nodes(p)))

    combined_text = "\n".join(full_text_chunks)
    entities = find_maskable_entities(combined_text)

    if entities:
        # 1. Process standard body paragraphs
        for p in doc.paragraphs:
            masked_count = mask_paragraph(p, entities)
            stats["total_masked"] += masked_count

        # 2. Process table cells
        for t in doc.tables:
            for row in t.rows:
                for cell in row.cells:
                    for p in cell.paragraphs:
                        masked_count = mask_paragraph(p, entities)
                        stats["total_masked"] += masked_count

        # 3. Process headers and footers
        for s in doc.sections:
            for p in s.header.paragraphs:
                masked_count = mask_paragraph(p, entities)
                stats["total_masked"] += masked_count
            for p in s.footer.paragraphs:
                masked_count = mask_paragraph(p, entities)
                stats["total_masked"] += masked_count

        # Count per entity type from entities list
        for ent_type, _, _ in entities:
            if ent_type == "email":
                stats["emails"] += 1
            elif ent_type == "linkedin":
                stats["linkedin_profiles"] += 1
            elif ent_type == "github":
                stats["github_profiles"] += 1
            elif ent_type == "phone":
                stats["phone_numbers"] += 1

    # Redirect every external hyperlink in the output copy, including those on
    # pages or in documents without any text that required masking.
    for part in doc.part.package.iter_parts():
        for relationship in part.rels.values():
            if relationship.reltype == RT.HYPERLINK and relationship.is_external:
                relationship._target = MASKED_LINK_REDIRECT_URL

    out_io = io.BytesIO()
    doc.save(out_io)
    out_io.seek(0)
    return out_io.getvalue(), stats


def mask_resume_file(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Main entry point for processing a resume file (PDF or DOCX).
    Produces masked content and generates the masked filename preserving original name + _Masked.
    """
    name_root, ext = os.path.splitext(filename)
    ext_lower = ext.lower()
    masked_filename = f"{name_root}_Masked{ext}"

    if ext_lower == ".pdf":
        masked_bytes, stats = mask_pdf(file_bytes)
    elif ext_lower in [".docx", ".doc"]:
        masked_bytes, stats = mask_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Only PDF and DOCX formats are supported.")

    file_id = uuid.uuid4().hex

    return {
        "success": True,
        "file_id": file_id,
        "original_filename": filename,
        "masked_filename": masked_filename,
        "file_type": ext_lower.replace(".", "").upper(),
        "original_size": len(file_bytes),
        "masked_size": len(masked_bytes),
        "stats": stats,
        "masked_bytes": masked_bytes,
    }

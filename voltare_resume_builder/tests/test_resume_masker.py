import io
import os
import sys

import fitz
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend import api_server
from backend.resume_masker import (
    _find_pdf_text_rects,
    mask_docx,
    mask_pdf,
    mask_text_content,
)

REDIRECT_URL = "https://www.voltare.in/"


def _create_pdf(text):
    document = fitz.open()
    page = document.new_page(width=1000, height=300)
    page.insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


def _insert_pdf_link(page, label, target, y):
    page.insert_text((72, y), label)
    page.insert_link({
        "kind": fitz.LINK_URI,
        "from": page.search_for(label)[0],
        "uri": target,
    })


def _add_hyperlink(paragraph, text, target):
    relationship_id = paragraph.part.relate_to(
        target, RT.HYPERLINK, is_external=True
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), relationship_id)
    run = OxmlElement("w:r")
    text_node = OxmlElement("w:t")
    text_node.text = text
    run.append(text_node)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def test_pdf_masks_phone_email_and_profile_urls():
    original = (
        "Education: 2021-2025, 2021 2025, 2018.2020, 2018 - 2020  "
        "Email: alex@example.com  Phone: +1 415 555 2671  "
        "LinkedIn: linkedin.com/in/alex-smith  GitHub: github.com/alexsmith"
    )

    masked_bytes, stats = mask_pdf(_create_pdf(original))
    document = fitz.open(stream=masked_bytes, filetype="pdf")
    masked_text = document[0].get_text()
    document.close()

    assert "alex@example.com" not in masked_text
    assert "XXXX@example.com" in masked_text
    assert "+1 415 555 2671" not in masked_text
    assert "+1 415 55X XXXX" in masked_text
    assert "2021-2025" in masked_text
    assert "2021 2025" in masked_text
    assert "2018.2020" in masked_text
    assert "2018 - 2020" in masked_text
    assert "linkedin.com/in/alex-smith" not in masked_text
    assert "github.com/alexsmith" not in masked_text
    assert "LinkedInXXXXXXXXXX" in masked_text
    assert "GitXXXXXXXXXX" in masked_text
    assert stats["emails"] == 1
    assert stats["linkedin_profiles"] == 1
    assert stats["github_profiles"] == 1
    assert stats["phone_numbers"] == 1


def test_pdf_span_fallback_locates_profile_url():
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "linkedin.com/in/", fontname="helv")
    x = 72 + fitz.get_text_length("linkedin.com/in/", fontname="helv")
    page.insert_text((x, 72), "alex-smith", fontname="hebo")

    rects = _find_pdf_text_rects(page, "linkedin.com/in/alex-smith")
    document.close()

    assert len(rects) == 1
    assert rects[0].width > 0


def test_pdf_redirects_all_external_links_including_pages_without_pii():
    document = fitz.open()
    link_only_page = document.new_page(width=1000, height=300)
    _insert_pdf_link(link_only_page, "Portfolio", "https://portfolio.example/", 72)
    contact_page = document.new_page(width=1000, height=300)
    contact_page.insert_text((72, 72), "alex@example.com")
    _insert_pdf_link(
        contact_page,
        "linkedin.com/in/alex",
        "https://linkedin.example/alex",
        100,
    )
    source_bytes = document.tobytes()
    document.close()

    masked_bytes, _ = mask_pdf(source_bytes)
    original = fitz.open(stream=source_bytes, filetype="pdf")
    masked = fitz.open(stream=masked_bytes, filetype="pdf")
    original_uris = [
        link["uri"]
        for page in original
        for link in page.get_links()
    ]
    masked_uris = [
        link["uri"]
        for page in masked
        for link in page.get_links()
    ]

    assert original_uris == [
        "https://portfolio.example/",
        "https://linkedin.example/alex",
    ]
    assert masked_uris == [REDIRECT_URL, REDIRECT_URL]
    assert "Portfolio" in masked[0].get_text()
    assert "LinkedIn" in masked[1].get_text()
    original.close()
    masked.close()


def test_linkedin_and_github_shorthand_keep_only_requested_labels():
    original = "Linkedin/Akashkumarsingh.o|Github/Ak26creator"

    masked, stats = mask_text_content(original)

    linkedin, github = masked.split("|")
    assert linkedin == f"LinkedIn{'X' * len('/Akashkumarsingh.o')}"
    assert github == f"Git{'X' * len('hub/Ak26creator')}"
    assert stats["linkedin_profiles"] == 1
    assert stats["github_profiles"] == 1


def test_year_ranges_are_not_masked_as_phone_numbers():
    original = (
        "Education: 2021-2025, 2021 2025, 2018.2020, 2018 - 2020 "
        "| Phone: +1 415 555 2671"
    )

    masked, stats = mask_text_content(original)

    assert "2021-2025" in masked
    assert "2021 2025" in masked
    assert "2018.2020" in masked
    assert "2018 - 2020" in masked
    assert "+1 415 555 2671" not in masked
    assert "+1 415 55X XXXX" in masked
    assert stats["phone_numbers"] == 1


def test_docx_masks_visible_urls_and_hyperlink_targets():
    document = Document()
    paragraph = document.add_paragraph()
    paragraph.add_run(
        "Education: 2021-2025, 2021 2025, 2018.2020, 2018 - 2020  "
        "Email: alex@example.com  Phone: +1 415 555 2671  "
    )
    paragraph.add_run("LinkedIn: linkedin.com/in/")
    paragraph.add_run("alex-smith  GitHub: github.com/alexsmith")
    _add_hyperlink(
        paragraph,
        "https://linkedin.com/in/alex-smith",
        "https://linkedin.com/in/alex-smith",
    )
    paragraph.add_run(" ")
    _add_hyperlink(paragraph, "Portfolio", "https://portfolio.example/profile")
    source = io.BytesIO()
    document.save(source)

    masked_bytes, stats = mask_docx(source.getvalue())
    masked_document = Document(io.BytesIO(masked_bytes))
    text = "".join(
        node.text or ""
        for paragraph in masked_document.paragraphs
        for node in paragraph._p.iter(qn("w:t"))
    )
    link_targets = [
        relationship.target_ref
        for relationship in masked_document.part.rels.values()
        if relationship.reltype == RT.HYPERLINK
    ]
    original_document = Document(io.BytesIO(source.getvalue()))
    original_link_targets = [
        relationship.target_ref
        for relationship in original_document.part.rels.values()
        if relationship.reltype == RT.HYPERLINK
    ]

    assert "alex@example.com" not in text
    assert "2021-2025" in text
    assert "2021 2025" in text
    assert "2018.2020" in text
    assert "2018 - 2020" in text
    assert "linkedin.com/in/alex-smith" not in text
    assert "github.com/alexsmith" not in text
    assert "Portfolio" in text
    assert f"LinkedIn{'X' * (len('linkedin.com/in/alex-smith') - len('LinkedIn'))}" in text
    assert f"Git{'X' * (len('github.com/alexsmith') - len('Git'))}" in text
    assert link_targets == [REDIRECT_URL, REDIRECT_URL]
    assert original_link_targets == [
        "https://linkedin.com/in/alex-smith",
        "https://portfolio.example/profile",
    ]
    assert stats["emails"] == 1
    assert stats["linkedin_profiles"] >= 1
    assert stats["github_profiles"] == 1
    assert stats["phone_numbers"] == 1


def test_docx_redirects_hyperlinks_without_other_maskable_content():
    document = Document()
    paragraph = document.add_paragraph()
    _add_hyperlink(paragraph, "Personal website", "https://candidate.example")
    source = io.BytesIO()
    document.save(source)

    masked_bytes, stats = mask_docx(source.getvalue())
    masked_document = Document(io.BytesIO(masked_bytes))
    original_document = Document(io.BytesIO(source.getvalue()))
    masked_targets = [
        relationship.target_ref
        for relationship in masked_document.part.rels.values()
        if relationship.reltype == RT.HYPERLINK
    ]
    original_targets = [
        relationship.target_ref
        for relationship in original_document.part.rels.values()
        if relationship.reltype == RT.HYPERLINK
    ]

    assert masked_targets == [REDIRECT_URL]
    assert original_targets == ["https://candidate.example"]
    assert masked_document.paragraphs[0].text == "Personal website"
    assert stats["total_masked"] == 0


def test_admin_can_permanently_remove_processed_resume():
    original = (
        "Education: 2021-2025, 2021 2025, 2018.2020, 2018 - 2020  "
        "Email: alex@example.com  Phone: +1 415 555 2671  "
        "LinkedIn: linkedin.com/in/alex-smith  GitHub: github.com/alexsmith"
    )
    client = TestClient(api_server.app)
    upload_response = client.post(
        "/api/admin/mask-resumes",
        files={"files": ("resume.pdf", _create_pdf(original), "application/pdf")},
    )

    assert upload_response.status_code == 200
    result = upload_response.json()["results"][0]
    assert result["status"] == "success"
    assert result["stats"]["linkedin_profiles"] == 1
    assert result["stats"]["github_profiles"] == 1

    download_response = client.get(result["download_url"])
    assert download_response.status_code == 200
    downloaded = fitz.open(stream=download_response.content, filetype="pdf")
    downloaded_text = downloaded[0].get_text()
    downloaded.close()
    assert "alex@example.com" not in downloaded_text
    assert "2021-2025" in downloaded_text
    assert "2021 2025" in downloaded_text
    assert "2018.2020" in downloaded_text
    assert "2018 - 2020" in downloaded_text
    assert "XXXX@example.com" in downloaded_text
    assert "+1 415 555 2671" not in downloaded_text
    assert "+1 415 55X XXXX" in downloaded_text
    assert "linkedin.com/in/alex-smith" not in downloaded_text
    assert "github.com/alexsmith" not in downloaded_text
    assert "LinkedInXXXXXXXXXX" in downloaded_text
    assert "GitXXXXXXXXXX" in downloaded_text

    file_id = result["file_id"]
    stored_path = api_server.MASKED_STORE[file_id]["path"]
    delete_response = client.delete(f"/api/admin/masked-resumes/{file_id}")

    assert delete_response.status_code == 200
    assert delete_response.json()["success"] is True
    assert not os.path.exists(stored_path)
    assert file_id not in api_server.MASKED_STORE
    assert client.get(result["download_url"]).status_code == 404


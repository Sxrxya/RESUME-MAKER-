"""Tests for watermark extraction and presence."""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from backend.watermark_extractor import (
    get_watermark_path,
    get_watermark_base64,
    verify_watermark_exists,
    get_watermark_info,
)


class TestWatermark(unittest.TestCase):
    def test_watermark_path_exists(self):
        path = get_watermark_path()
        self.assertTrue(os.path.exists(path), f"Watermark not found at {path}")

    def test_watermark_exists_check(self):
        self.assertTrue(verify_watermark_exists())

    def test_watermark_base64_non_empty(self):
        b64 = get_watermark_base64()
        self.assertGreater(len(b64), 100, "Base64 watermark should be substantial")

    def test_watermark_info(self):
        info = get_watermark_info()
        self.assertTrue(info["exists"])
        self.assertGreater(info["width"], 500)
        self.assertGreater(info["height"], 500)

    def test_watermark_is_png(self):
        path = get_watermark_path()
        with open(path, "rb") as f:
            header = f.read(8)
        # PNG magic bytes
        self.assertEqual(header[:4], b'\x89PNG')


if __name__ == "__main__":
    unittest.main()

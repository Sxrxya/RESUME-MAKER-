import os
import sys

pkg = os.path.abspath(os.path.join(os.path.dirname(__file__), "voltare_resume_builder"))
if pkg not in sys.path:
    sys.path.insert(0, pkg)

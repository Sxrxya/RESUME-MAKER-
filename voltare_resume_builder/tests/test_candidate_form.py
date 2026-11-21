import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from frontend.candidate_form import (
    SAMPLE_CANDIDATE_DATA,
    init_form_data,
    load_sample_data,
)


class FakeStreamlit:
    def __init__(self, session_state=None):
        self.session_state = session_state or {}


class TestFormInitialization(unittest.TestCase):
    def test_new_form_starts_empty(self):
        st = FakeStreamlit()

        init_form_data(st)

        for key in SAMPLE_CANDIDATE_DATA:
            self.assertEqual(st.session_state[key], "")

    def test_initialization_clears_legacy_samples_but_keeps_user_entries(self):
        state = dict(SAMPLE_CANDIDATE_DATA)
        state["first_name"] = "Asha"
        st = FakeStreamlit(state)

        init_form_data(st)

        self.assertEqual(st.session_state["first_name"], "Asha")
        self.assertEqual(st.session_state["second_name"], "")

    def test_explicit_sample_load_is_preserved(self):
        st = FakeStreamlit()

        load_sample_data(st)
        init_form_data(st)

        self.assertEqual(st.session_state["first_name"], SAMPLE_CANDIDATE_DATA["first_name"])


if __name__ == "__main__":
    unittest.main()

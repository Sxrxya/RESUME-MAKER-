"""Reusable UI components for Voltare resume builder."""
import json
import os

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")


def _load_field_limits():
    path = os.path.join(CONFIG_DIR, "field_limits.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


FIELD_LIMITS = _load_field_limits()


def limited_text_input(st, key, label, max_chars, required=False, placeholder="", value=None):
    """Text input with character limit enforcement and counter display."""
    display_label = f"{label} {'🔴' if required else ''}"

    if key not in st.session_state:
        st.session_state[key] = value if value is not None else ""

    input_value = st.text_input(
        display_label,
        max_chars=max_chars,
        placeholder=placeholder,
        key=key,
    )

    current = len(input_value)
    remaining = max_chars - current

    if remaining <= 5 and remaining > 0:
        css_class = "char-counter warning"
    elif remaining <= 0:
        css_class = "char-counter danger"
    else:
        css_class = "char-counter"

    st.markdown(
        f'<div class="{css_class}">{current} / {max_chars} characters ({remaining} remaining)</div>',
        unsafe_allow_html=True,
    )

    return input_value


def limited_text_area(st, key, label, max_chars, max_lines=None, required=False,
                      placeholder="", value=None, height=80):
    """Text area with character limit enforcement and counter display."""
    display_label = f"{label} {'🔴' if required else ''}"

    if key not in st.session_state:
        st.session_state[key] = value if value is not None else ""

    input_value = st.text_area(
        display_label,
        max_chars=max_chars,
        placeholder=placeholder,
        height=height,
        key=key,
    )

    current = len(input_value)
    remaining = max_chars - current

    if remaining <= 10 and remaining > 0:
        css_class = "char-counter warning"
    elif remaining <= 0:
        css_class = "char-counter danger"
    else:
        css_class = "char-counter"

    counter_text = f"{current} / {max_chars} characters ({remaining} remaining)"
    if max_lines:
        estimated_lines = (
            max(1, sum(max(1, -(-len(line) // 90)) for line in input_value.split("\n")))
            if input_value
            else 0
        )
        counter_text += f" | ~{estimated_lines}/{max_lines} lines"
        if estimated_lines > max_lines:
            css_class = "char-counter danger"

    st.markdown(
        f'<div class="{css_class}">{counter_text}</div>',
        unsafe_allow_html=True,
    )

    return input_value


def section_header(st, title, description=None):
    """Render a styled section header."""
    st.markdown(f"### {title}")
    if description:
        st.markdown(f"*{description}*")
    st.markdown('<hr class="section-divider">', unsafe_allow_html=True)


def validation_message(st, message, is_error=True):
    """Show styled validation message."""
    css_class = "validation-error" if is_error else "validation-success"
    st.markdown(f'<div class="{css_class}">{message}</div>', unsafe_allow_html=True)

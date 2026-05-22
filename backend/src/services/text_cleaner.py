import re


def clean_extracted_text(text: str) -> str:

    if not text:
        return ""

    # remove repeated spaces
    text = re.sub(r"[ \t]+", " ", text)

    # remove excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # remove broken unicode garbage
    text = text.replace("�", "")

    # fix common OCR mistakes
    replacements = {
        "DEPARTEMEN": "DEPARTMENT",
        "ENGUNIE": "ENGINEERING",
        "Perm Assessiive": "Term Assessment",
        "Semir": "Seminar",
        "Cojrdinator": "Coordinator",
        "Supe ison": "Supervision",
    }

    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)

    # strip lines
    lines = []

    for line in text.splitlines():

        cleaned = line.strip()

        if len(cleaned) < 2:
            continue

        lines.append(cleaned)

    return "\n".join(lines)
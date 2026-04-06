import re


OFFICIAL_KEYWORDS = [
    "Registrar",
    "Dean",
    "Controller of Examination",
    "Department",
    "Official",
    "Notice",
    "Circular",
    "University",
    "College",
    "Faculty",
    "Principal",
    "Office",
    "Institute",
    "Coordinator",
    "Examination"
]


SUSPICIOUS_WORDS = [
    "guys",
    "maybe",
    "probably",
    "heard",
    "forwarded",
    "unconfirmed"
]


def verify_document_content(content: str, uploader_role: str = "student"):
    trust_score = 0
    flags = []

    # -----------------------------------------
    # 1. Uploader Role Weight
    # -----------------------------------------
    if uploader_role == "admin":
        trust_score += 35
    elif uploader_role == "faculty":
        trust_score += 25
    elif uploader_role == "student":
        trust_score += 10
        flags.append("Student-uploaded content requires caution")

    # -----------------------------------------
    # 2. Official Keyword Detection
    # -----------------------------------------
    keyword_matches = [
        word for word in OFFICIAL_KEYWORDS
        if word.lower() in content.lower()
    ]

    trust_score += len(keyword_matches) * 5

    if len(keyword_matches) >= 4:
        trust_score += 10

    if not keyword_matches:
        flags.append("No official institutional keywords found")

    # -----------------------------------------
    # 3. Date Detection
    # -----------------------------------------
    date_pattern = r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"
    dates = re.findall(date_pattern, content)

    if dates:
        trust_score += 10
    else:
        flags.append("No valid date found")

    # -----------------------------------------
    # 4. Suspicious Language Detection
    # -----------------------------------------
    suspicious_found = [
        word for word in SUSPICIOUS_WORDS
        if word.lower() in content.lower()
    ]

    if suspicious_found:
        trust_score -= len(suspicious_found) * 10
        flags.append("Suspicious informal wording detected")

    # -----------------------------------------
    # 5. Structure Check
    # -----------------------------------------
    word_count = len(content.split())

    if word_count > 30:
        trust_score += 10
    else:
        flags.append("Document too short for reliable verification")

    # -----------------------------------------
    # 6. Signature / Authority Indicators
    # -----------------------------------------
    authority_markers = [
        "Head",
        "Coordinator",
        "Signature",
        "HOD",
        "Approved"
    ]

    authority_found = [
        marker for marker in authority_markers
        if marker.lower() in content.lower()
    ]

    if authority_found:
        trust_score += 10

    # -----------------------------------------
    # 7. Cap Score
    # -----------------------------------------
    trust_score = max(0, min(trust_score, 100))

    # -----------------------------------------
    # 8. Final Verification
    # -----------------------------------------
    verified = trust_score >= 50

    # -----------------------------------------
    # 9. Trust Message Categories
    # -----------------------------------------
    if trust_score >= 80:
        message = f"Verified reference • Trust score: {trust_score}%"
    elif trust_score >= 50:
        message = f"Use with caution • Trust score: {trust_score}%"
    else:
        message = f"Warning: low-confidence reference • Trust score: {trust_score}%"

    return {
        "verified": verified,
        "trust_score": trust_score,
        "flags": flags,
        "message": message
    }
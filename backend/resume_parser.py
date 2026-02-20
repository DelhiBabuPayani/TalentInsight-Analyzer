import spacy
from PyPDF2 import PdfReader
from docx import Document
import re

nlp = spacy.load("en_core_web_sm")
nlp.max_length = 2000000   # FIXES crash

SKILLS = [
    # ===== IT / TECH =====
    "python","java","c","c++","javascript","react","angular","vue",
    "html","css","node","django","flask","fastapi","sql","mysql","postgresql",
    "mongodb","docker","kubernetes","aws","azure","git","github",
    "machine learning","deep learning","data science","nlp","excel",

    # ===== SOFT SKILLS =====
    "communication","teamwork","leadership","problem solving","time management",
    "customer service","sales","marketing","support","bpo","call center",

    # ===== MEDICAL =====
    "patient care","clinical assessment","diagnosis","emergency care",
    "nursing","iv cannulation","ecg","wound dressing","basic life support","bls",

    # ===== COMMERCE =====
    "accounting","tally","gst","taxation","finance","auditing","bookkeeping",

    # ===== MANAGEMENT =====
    "human resource","hr","recruitment","training","operations","business analysis",

    # ===== ENGINEERING =====
    "mechanical","electrical","electronics","civil","automobile","production",
    "maintenance","machining","welding","cnc","plc","scada",

    # ===== EDUCATION =====
    "teaching","lesson planning","classroom management","curriculum development",

    # ===== BASIC =====
    "basic computer skills","data entry","ms word","ms excel","typing"
]

# ================= FILE TEXT EXTRACTION =================

def extract_text_from_pdf(path):
    text = ""
    reader = PdfReader(path)
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(path):
    doc = Document(path)
    return "\n".join([p.text for p in doc.paragraphs])

# ================= ENTITY EXTRACTION =================

def extract_entities(text):
    original_text = text
    text_lower = text.lower()

    found = set()

    # ---------- SKILLS (YOUR LOGIC - UNCHANGED) ----------
    for skill in SKILLS:
        if re.search(rf"\b{skill}\b", text_lower):
            found.add(skill)

    # ---------- EMAIL ----------
    email_match = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", original_text)
    email = email_match[0] if email_match else ""

    # ---------- PHONE ----------
    phone_match = re.findall(r"\+?\d[\d\s\-]{8,15}", original_text)
    phone = phone_match[0] if phone_match else ""

    # ---------- NLP DOC ----------
    doc = nlp(original_text)

    # ---------- NAME ----------
    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    # ---------- LOCATION ----------
    location = ""
    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC"]:
            location = ent.text
            break

    # ---------- COMPANY (ORG) ----------
    companies = []
    for ent in doc.ents:
        if ent.label_ == "ORG":
            companies.append(ent.text)

    # ---------- DESIGNATION ----------
    designation = ""
    role_keywords = ["developer", "engineer", "analyst", "manager", "designer", "consultant", "tester", "architect", "doctor", "nurse", "teacher"]
    for line in original_text.split("\n"):
        for role in role_keywords:
            if role in line.lower():
                designation = line.strip()
                break
        if designation:
            break

    # ---------- EDUCATION ----------
    education = []
    edu_keywords = ["b.e", "b.tech", "m.tech", "m.e", "bsc", "msc", "bca", "mca", "phd", "mba", "degree", "diploma"]
    for line in original_text.split("\n"):
        if any(edu in line.lower() for edu in edu_keywords):
            education.append(line.strip())

    # ---------- EXPERIENCE ----------
    experience = []
    exp_keywords = ["experience", "worked", "working", "intern", "internship", "years"]
    for line in original_text.split("\n"):
        if any(exp in line.lower() for exp in exp_keywords):
            experience.append(line.strip())

    # ---------- PROJECTS ----------
    projects = []
    project_keywords = ["project", "developed", "built", "implemented"]
    for line in original_text.split("\n"):
        if any(p in line.lower() for p in project_keywords):
            projects.append(line.strip())

    # ---------- CERTIFICATIONS ----------
    certifications = []
    cert_keywords = ["certification", "certified", "certificate"]
    for line in original_text.split("\n"):
        if any(c in line.lower() for c in cert_keywords):
            certifications.append(line.strip())

    # ---------- LANGUAGES ----------
    languages = []
    language_keywords = ["english", "hindi", "tamil", "telugu", "kannada", "french", "german"]
    for lang in language_keywords:
        if re.search(rf"\b{lang}\b", text_lower):
            languages.append(lang)

    # ---------- ACHIEVEMENTS ----------
    achievements = []
    achieve_keywords = ["award", "won", "achievement", "rank", "prize"]
    for line in original_text.split("\n"):
        if any(a in line.lower() for a in achieve_keywords):
            achievements.append(line.strip())

    # ---------- SUMMARY ----------
    summary = ""
    lines = [l.strip() for l in original_text.split("\n") if l.strip()]
    if lines:
        summary = lines[0]   # usually first line is profile summary

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "designation": designation,
        "location": location,
        "companies": companies,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "languages": languages,
        "achievements": achievements,
        "summary": summary,
        "skills": list(found)   # YOUR ORIGINAL LOGIC PRESERVED
    }

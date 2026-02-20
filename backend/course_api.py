import requests

RAPIDAPI_KEY = "b91b1b8828msh11842ea4de649b7p10bb80jsn3c7bb8aa8ba8"
RAPIDAPI_HOST = "udemy-paid-courses-for-free-api.p.rapidapi.com"


def fetch_courses_for_skill(skill: str):
    """
    Fetch courses dynamically based on skill.
    Does NOT change your existing flow, only improves extraction.
    """

    url = "https://udemy-paid-courses-for-free-api.p.rapidapi.com/rapidapi/courses/search?page=1&page_size=10&query=python"

    querystring = {
        "query": skill,        # 🔥 dynamic skill search
        "page": "1",
        "page_size": "10"
    }

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=15)

        print("COURSE API STATUS:", response.status_code)
        print("COURSE API SKILL QUERY:", skill)

        if response.status_code != 200:
            print("COURSE API NON-200 RESPONSE:", response.text)
            return []

        data = response.json()

        # Some APIs return 'data', some 'results'
        results = data.get("results") or data.get("data") or []

        courses = []

        for item in results:
            course = {
                # ===== BASIC (your original fields) =====
                "title": item.get("title"),
                "url": item.get("url"),
                "image": item.get("image"),
                "price": item.get("price"),

                # ===== EXTENDED FIELDS (safe get) =====
                "headline": item.get("headline") or item.get("short_description"),
                "description": item.get("description") or item.get("long_description"),
                "rating": item.get("rating") or item.get("avg_rating"),
                "num_reviews": item.get("num_reviews") or item.get("reviews"),
                "instructor": item.get("instructor") or item.get("instructor_name"),
                "language": item.get("language"),
                "level": item.get("level") or item.get("difficulty"),
                "last_update": item.get("last_update") or item.get("last_updated"),
                "category": item.get("category"),
                "original_price": item.get("original_price"),
                "discount_price": item.get("discount_price"),
                "is_free": item.get("is_free"),

                # ===== LEARNING DETAILS =====
                "what_you_will_learn": item.get("what_you_will_learn") or item.get("learning_objectives"),
                "requirements": item.get("requirements"),
                "curriculum": item.get("curriculum"),
                "duration": item.get("duration"),
                "lectures": item.get("lectures"),
                "quizzes": item.get("quizzes"),
                "assignments": item.get("assignments"),

                # ===== META =====
                "source": "Udemy (RapidAPI)",
                "skill_searched": skill
            }

            courses.append(course)

        return courses

    except Exception as e:
        print("COURSE API ERROR:", str(e))
        return []

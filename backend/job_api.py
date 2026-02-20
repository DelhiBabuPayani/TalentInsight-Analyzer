import requests

RAPID_API_KEY = "b91b1b8828msh11842ea4de649b7p10bb80jsn3c7bb8aa8ba8"

def fetch_jobs_from_api(query):
    # ✅ USE SEARCH ENDPOINT (not job-details)
    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    params = {
        "query": query,
        "page": "1",
        "num_pages": "1"
    }

    response = requests.get(url, headers=headers, params=params, timeout=15)

    print("JOB API STATUS:", response.status_code)
    print("JOB API RESPONSE:", response.text[:1000])

    data = response.json()

    jobs = []

    for item in data.get("data", []):
        jobs.append({
            "title": item.get("job_title", ""),
            "company": item.get("employer_name", ""),
            "description": item.get("job_description", ""),
            "apply_url": item.get("job_apply_link", ""),

            "job_id": item.get("job_id"),
            "employer_logo": item.get("employer_logo"),
            "employer_website": item.get("employer_website"),

            "location": item.get("job_city"),
            "state": item.get("job_state"),
            "country": item.get("job_country"),

            "employment_type": item.get("job_employment_type"),
            "workplace_type": item.get("job_workplace_type"),

            "min_salary": item.get("job_min_salary"),
            "max_salary": item.get("job_max_salary"),
            "salary_currency": item.get("job_salary_currency"),
            "salary_period": item.get("job_salary_period"),

            "posted_at": item.get("job_posted_at_datetime_utc"),
            "publisher": item.get("job_publisher"),
        })

    return jobs

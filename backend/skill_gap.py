def calculate_skill_gap(user_skills, job_skills):
    missing = []
    for skill in job_skills:
        if skill not in user_skills:
            missing.append(skill)
    return missing

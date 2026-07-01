POOL = {
    "Transport": ["Drive less and walk or cycle for short trips.", "Use public transport instead of a private car.",
                  "Carpool with colleagues to cut commute emissions."],
    "Electricity": ["Install LED bulbs to cut electricity use.", "Switch to a renewable energy provider.",
                     "Unplug idle electronics to save power."],
    "Food": ["Reduce meat consumption a few days a week.", "Choose locally sourced, seasonal food.",
              "Minimize air travel where possible."],
    "Shopping": ["Avoid unnecessary shopping and impulse buys.", "Buy second-hand or refurbished items.",
                  "Increase recycling and reuse of materials."],
}
GENERIC = ["Track your footprint monthly to stay accountable.", "Offset unavoidable emissions through verified programs."]


def generate_recommendations(breakdown_pct: dict) -> list:
    ranked = sorted(breakdown_pct, key=breakdown_pct.get, reverse=True)
    recs = []
    for category in ranked:
        recs.extend(POOL.get(category, []))
    recs.extend(GENERIC)
    # Deduplicate while preserving order, return at least 5
    seen, ordered = set(), []
    for r in recs:
        if r not in seen:
            ordered.append(r)
            seen.add(r)
    return ordered[:8] if len(ordered) >= 5 else ordered

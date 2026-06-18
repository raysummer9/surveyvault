#!/usr/bin/env python3
"""Generate supabase migration for 18 Platinum-tier deep surveys (50 questions each). Run from repo root."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# $18–$20 USD reward → cents
REWARDS_CENTS = [1800, 1850, 1900, 1950, 2000, 1825, 1875, 1925, 1975, 1810, 1860, 1910, 1960, 1990, 1830, 1880, 1930, 1980]

EST_MINUTES = [48, 50, 46, 52, 49, 47, 51, 48, 50, 49, 46, 52, 48, 50, 47, 51, 49, 48]

SURVEYS: list[dict] = [
    # Technology ×2
    {
        "slug": "platinum-tech-ai-ethics-judgment",
        "title": "Judgment in the Age of Intelligent Systems",
        "description": "Reflect on how AI shapes decisions at work and home—where you trust it, where you resist, and what you owe others when machines recommend.",
        "category": "Technology",
    },
    {
        "slug": "platinum-tech-privacy-trust-surveillance",
        "title": "Privacy, Surveillance, and Trust in Everyday Apps",
        "description": "Explore tensions between convenience, personalization, and the data you give away—without simplistic for/against framing.",
        "category": "Technology",
    },
    # Lifestyle ×2
    {
        "slug": "platinum-life-identity-routine-meaning",
        "title": "Routine, Identity, and What Feels Non-Negotiable",
        "description": "Examine how your habits express values, and where friction between ‘should’ and ‘want’ actually shows up.",
        "category": "Lifestyle",
    },
    {
        "slug": "platinum-life-boundaries-rest-social-energy",
        "title": "Boundaries, Rest, and Social Energy",
        "description": "Think through how you recover, say no, and protect attention in a world that rewards constant availability.",
        "category": "Lifestyle",
    },
    # Finance ×2
    {
        "slug": "platinum-finance-values-long-term-tradeoffs",
        "title": "Money, Values, and Long-Term Tradeoffs",
        "description": "Discuss saving, spending, and generosity when goals conflict—security vs. experience, present vs. future self.",
        "category": "Finance",
    },
    {
        "slug": "platinum-finance-vulnerability-resilience",
        "title": "Financial Vulnerability and Quiet Resilience",
        "description": "Honor uncertainty, irregular income, or setbacks without shame—focus on coping strategies and structural luck.",
        "category": "Finance",
    },
    # Health ×2
    {
        "slug": "platinum-health-embodied-narratives",
        "title": "Embodied Health and the Stories We Carry",
        "description": "Connect body signals, medical narratives, and identity—how labels help or constrain your sense of wellbeing.",
        "category": "Health",
    },
    {
        "slug": "platinum-health-mental-load-stigma-access",
        "title": "Mental Load, Stigma, and Access to Care",
        "description": "Reflect on barriers to support, self-judgment, and what ‘getting help’ actually requires in your context.",
        "category": "Health",
    },
    # Food & Beverages ×2
    {
        "slug": "platinum-food-culture-ethics-identity",
        "title": "Food, Culture, Ethics, and Belonging",
        "description": "Explore how meals encode identity, tradition, and moral tension—especially when values clash at the table.",
        "category": "Food & Beverages",
    },
    {
        "slug": "platinum-food-sustainability-vs-convenience",
        "title": "Sustainability vs. Convenience on Your Plate",
        "description": "Weigh environmental awareness against time, cost, and access—without assuming a single ‘right’ answer.",
        "category": "Food & Beverages",
    },
    # Travel ×2
    {
        "slug": "platinum-travel-transformation-consumption",
        "title": "Travel as Transformation or Consumption?",
        "description": "Interrogate what you seek from movement—rest, status, novelty, empathy—and what you leave behind.",
        "category": "Travel",
    },
    {
        "slug": "platinum-travel-mobility-justice-climate",
        "title": "Mobility, Justice, and Climate Consciousness",
        "description": "Connect flying, driving, and public transit to fairness, emissions, and who bears the costs.",
        "category": "Travel",
    },
    # Education ×2
    {
        "slug": "platinum-edu-credentials-curiosity",
        "title": "Credentials, Curiosity, and What Learning Is For",
        "description": "Question the link between degrees, competence, and joy in learning—especially as work changes.",
        "category": "Education",
    },
    {
        "slug": "platinum-edu-authority-lifelong-skills",
        "title": "Authority in Teaching and Skills That Compound",
        "description": "Reflect on who you trust to teach, informal learning, and skills you wish schools prioritized.",
        "category": "Education",
    },
    # Environment ×2
    {
        "slug": "platinum-env-intergenerational-responsibility",
        "title": "Intergenerational Responsibility and the Living World",
        "description": "Think beyond slogans: obligations to future humans and non-human life when systems move slowly.",
        "category": "Environment",
    },
    {
        "slug": "platinum-env-local-action-systemic-change",
        "title": "Local Action and the Limits of Individual Virtue",
        "description": "Navigate guilt, hope, and agency—when personal choices matter vs. when only policy-scale change will do.",
        "category": "Environment",
    },
    # Media ×1
    {
        "slug": "platinum-media-attention-truth-narrative",
        "title": "Attention, Truth, and Narrative Power",
        "description": "Examine how algorithms, outrage, and storytelling shape what you believe—and doubt.",
        "category": "Media",
    },
    # Automotive ×1
    {
        "slug": "platinum-auto-mobility-cities-future-driving",
        "title": "Mobility, Cities, and the Future of Driving",
        "description": "Consider cars as freedom, burden, and design choice—equity, safety, and electrification in real cities.",
        "category": "Automotive",
    },
]


def slug_prefix(slug: str) -> str:
    return re.sub(r"[^a-z0-9]", "", slug)[:24]


def build_fifty_questions(short: str) -> list[dict]:
    """50 substantive questions: mix scenario choice + reflective text. `short` is a 2–4 word theme hint."""
    qs: list[dict] = []
    idx = 0

    def cid() -> str:
        nonlocal idx
        idx += 1
        return f"{short}_{idx:02d}"

    # --- Opening: orientation (8 choice) ---
    stems_open = [
        (
            "When you think about this topic in your own life, how often does it feel emotionally ‘loaded’ rather than neutral?",
            ["Almost always", "Often", "Sometimes", "Rarely", "Almost never"],
        ),
        (
            "How much do your answers here depend on your current life stage (care, dependents, income, health)?",
            ["A great deal", "Quite a bit", "Somewhat", "A little", "Hardly at all"],
        ),
        (
            "Do you usually seek out disagreement on this topic, or prefer communities that largely agree with you?",
            ["Seek disagreement", "Mix of both", "Prefer agreement", "Avoid the topic", "Not sure"],
        ),
        (
            "Which best describes your relationship to ‘expert’ voices on this topic?",
            ["I defer to them", "I weigh them against experience", "I’m skeptical by default", "I ignore them", "It varies wildly"],
        ),
        (
            "If you had to choose, is this topic more about individual choices or systems and institutions?",
            ["Mostly individual", "Lean individual", "Even split", "Lean systems", "Mostly systems"],
        ),
        (
            "How comfortable are you admitting uncertainty or changing your mind publicly about this?",
            ["Very comfortable", "Somewhat", "Neutral", "Uncomfortable", "I avoid it"],
        ),
        (
            "When resources are scarce (time, money, attention), how do you usually decide what to protect first?",
            ["Family or close ties", "Health or rest", "Work or income", "Principles or causes", "Something else"],
        ),
        (
            "How much does fear of being judged shape what you say about this topic in ordinary conversation?",
            ["A great deal", "Quite a bit", "Somewhat", "A little", "Not much"],
        ),
    ]
    for lab, opts in stems_open:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    # --- Reflective text (6) ---
    text_prompts_a = [
        "Describe a recent moment when this topic forced you to choose between two values you both care about. What did you pick, and what did it cost?",
        "What is one widely repeated opinion about this topic that you think is too simple? What nuance is usually missing?",
        "If someone you respect disagreed with you on this, what is the strongest version of their argument you could offer on their behalf?",
        "What would ‘good enough’ look like for you on this topic in the next year—not perfection, but meaningful progress?",
        "Who benefits most from the status quo in this area, and who pays the highest hidden costs? Answer in your own words.",
        "What question are you still genuinely unsure about—and why haven’t you resolved it yet?",
    ]
    for lab in text_prompts_a:
        qs.append({"id": cid(), "type": "text", "label": lab})

    # --- Middle: tradeoffs & scenarios (18 choice) ---
    stems_mid = [
        (
            "You can improve one thing in this domain with serious effort, or help three people in a smaller way. Which pulls you?",
            ["The deep single improvement", "The broader smaller help", "I’d try to combine", "Refuse the frame", "Depends on who is affected"],
        ),
        (
            "A policy change would help many strangers but slightly inconvenience you weekly. Support it?",
            ["Yes, strongly", "Yes, cautiously", "Need more detail", "Probably not", "No"],
        ),
        (
            "You discover a habit of yours has unintended harm you didn’t see before. What’s your first instinct?",
            ["Change quickly", "Research more", "Feel guilty", "Rationalize", "Talk to someone"],
        ),
        (
            "How much do you weigh future people (you’ll never meet) in decisions that affect this topic today?",
            ["A lot", "Some", "Unsure how to", "Rarely", "Not consciously"],
        ),
        (
            "When brands or leaders speak on this topic, what erodes your trust fastest?",
            ["Vague virtue signaling", "Data overreach", "Hypocrisy", "Fear messaging", "Overpromising"],
        ),
        (
            "If you could only protect one—honesty, kindness, or effectiveness—which do you lean on when they conflict here?",
            ["Honesty", "Kindness", "Effectiveness", "Refuse to rank", "Situational blend"],
        ),
        (
            "Do you experience this topic more as a private inner struggle or a public political fight?",
            ["Mostly private", "More private", "Both equally", "More public", "Mostly public"],
        ),
        (
            "How often do you update your views based on new evidence vs. doubling down?",
            ["Update often", "Sometimes update", "Slow to update", "Rarely update", "Depends on the source"],
        ),
        (
            "Which risk worries you more in this area: being exploited, or missing an opportunity to help?",
            ["Being exploited", "Missing help", "Both equally", "Neither—different fears", "Not sure"],
        ),
        (
            "When you feel powerless here, what do you usually do with that feeling?",
            ["Channel it into action", "Numb or distract", "Talk it through", "Blame systems", "Sit with it quietly"],
        ),
        (
            "Would you rather be remembered as principled or pragmatic on this topic?",
            ["Principled", "Pragmatic", "Both—contextual", "Neither matters to me", "I don’t think in those terms"],
        ),
        (
            "How much does your answer depend on where you live (country, city, infrastructure)?",
            ["Completely", "Quite a bit", "Moderately", "Somewhat", "Hardly"],
        ),
        (
            "If your 18-year-old self disagreed with your current view, who would you listen to harder?",
            ["Younger self (idealism)", "Current self (experience)", "Neither—merge the tension", "I can’t imagine", "Depends on the issue"],
        ),
        (
            "When you see others suffer in this domain, how often do you feel complicit in systems you participate in?",
            ["Often", "Sometimes", "Rarely", "I reject guilt framing", "I oscillate"],
        ),
        (
            "Pick the tension that feels most alive for you right now:",
            ["Freedom vs. safety", "Speed vs. care", "Truth vs. harmony", "Growth vs. limits", "Individual vs. collective"],
        ),
        (
            "How do you react when someone uses moral language (‘you should’) about this topic?",
            ["Open if empathetic", "Defensive", "Curious about their story", "Dismissive if preachy", "Depends who says it"],
        ),
        (
            "If you had to teach a 20-minute class on this topic, what would you refuse to oversimplify?",
            ["Causes", "Tradeoffs", "Who is hurt", "Solutions", "History"],
        ),
        (
            "Which lens do you trust least when people analyze this topic?",
            ["Pure economics", "Pure morality", "Pure tech optimism", "Pure nostalgia", "Pure outrage"],
        ),
    ]
    for lab, opts in stems_mid:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    # --- More text (6) ---
    text_prompts_b = [
        "Name one assumption people make about ‘people like you’ in this topic that is often wrong or incomplete.",
        "What is a constructive disagreement you wish more people could have about this—without collapsing into teams?",
        "If you could ask one question to the most powerful decision-maker in this space, what would it be—and why?",
        "What would you want researchers to measure that they rarely measure today?",
        "Describe a time you changed your behavior here—not because you were shamed, but because something clicked.",
        "What is one thing you wish institutions (employers, schools, governments) understood about everyday lived experience here?",
    ]
    for lab in text_prompts_b:
        qs.append({"id": cid(), "type": "text", "label": lab})

    # --- Closing: integration (12 choice) ---
    stems_close = [
        (
            "After reflecting, how clear is your own position on this topic?",
            ["Very clear", "Somewhat clear", "Mixed", "Uncertain", "Intentionally open"],
        ),
        (
            "Would you want a close friend to challenge you on this more often, less often, or about the same?",
            ["More often", "About the same", "Less often", "Depends on how they do it", "Not sure"],
        ),
        (
            "How likely are you to seek new information on this in the next month?",
            ["Very likely", "Likely", "Maybe", "Unlikely", "Very unlikely"],
        ),
        (
            "Do you feel more hopeful, more concerned, or about the same compared to a year ago?",
            ["More hopeful", "About the same", "More concerned", "Both hopeful and concerned", "I avoid comparing"],
        ),
        (
            "If you could fund one type of project in this area, what would you pick?",
            ["Education", "Infrastructure", "Research", "Direct aid", "Advocacy"],
        ),
        (
            "How much does community (online or offline) matter for how you think about this topic?",
            ["Essential", "Important", "Moderate", "Minor", "I think alone"],
        ),
        (
            "Would you rather improve your own situation first, or work on collective change first?",
            ["Own situation", "Collective change", "Both in parallel", "Refuse the split", "Context-dependent"],
        ),
        (
            "How often do you translate reflection into concrete next steps?",
            ["Often", "Sometimes", "Rarely", "I resist planning", "I over-plan"],
        ),
        (
            "What would make you disengage entirely from caring about this topic?",
            ["Burnout", "Cynicism", "Competing priorities", "I can’t imagine", "Already happened sometimes"],
        ),
        (
            "How much do you want decision-makers to read honest, nuanced survey answers like yours?",
            ["A lot—please share themes", "Some—aggregate only", "Little—privacy first", "Unsure", "No—too risky"],
        ),
        (
            "Does thinking this through leave you with more compassion, more urgency, or more ambivalence?",
            ["More compassion", "More urgency", "More ambivalence", "Mix of all three", "Something else"],
        ),
        (
            "Final calibration: how representative do you think your answers are of people in situations very different from yours?",
            ["Very representative", "Somewhat", "Not very", "I doubt it", "I actively don’t know"],
        ),
    ]
    for lab, opts in stems_close:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    assert len(qs) == 50, len(qs)
    return qs


def main() -> None:
    if len(SURVEYS) != 18:
        print("Expected 18 surveys", file=sys.stderr)
        sys.exit(1)

    out: list[str] = []
    out.append(
        """-- 18 Platinum-tier deep-dive surveys ($18–$20 reward), all content categories, 50 questions each.
-- Thoughtful scenario + reflection mix (not generic Likert grids). Idempotent on slug.

"""
    )

    for i, s in enumerate(SURVEYS):
        sp = slug_prefix(s["slug"])
        questions = build_fifty_questions(sp)
        payload = json.dumps(questions, ensure_ascii=False)
        reward = REWARDS_CENTS[i]
        minutes = EST_MINUTES[i]
        cat = s["category"].replace("'", "''")
        title = s["title"].replace("'", "''")
        desc = s["description"].replace("'", "''")
        slug = s["slug"]

        out.append(f"""insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  '{slug}',
  '{title}',
  '{desc}',
  {reward},
  {minutes},
  $json${payload}$json$::jsonb,
  true,
  '{cat}',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

""")

    path = Path(__file__).resolve().parent.parent / "supabase" / "migrations" / "20260411_seed_platinum_deep_surveys.sql"
    path.write_text("".join(out), encoding="utf-8")
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()

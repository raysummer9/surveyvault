#!/usr/bin/env python3
"""Generate supabase migration for 72 Gold-tier surveys (35 questions each, $4–$5). Run from repo root."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# $4–$5 USD → cents (varied across surveys)
REWARDS_CENTS = [
    400, 425, 450, 475, 500, 410, 440, 465, 490, 405, 435, 460, 485, 415, 445, 470, 495, 420, 450, 480,
    400, 430, 455, 500, 408, 438, 468, 498, 412, 442, 472, 402, 432, 462, 492, 418, 448, 478, 404, 434,
    464, 494, 422, 452, 482, 406, 436, 466, 496, 414, 444, 474, 424, 454, 484, 416, 446, 476, 426, 456,
    486, 428, 458, 488, 401, 431, 461, 491, 409, 439, 469, 499,
]

EST_MINUTES = [
    22, 24, 23, 25, 26, 22, 24, 25, 23, 26, 22, 24, 25, 23, 24, 26, 22, 25, 24, 23,
    26, 22, 24, 25, 23, 26, 22, 24, 25, 23, 24, 26, 22, 25, 24, 23, 26, 22, 24, 25,
    23, 26, 22, 24, 25, 23, 24, 26, 22, 25, 24, 23, 26, 22, 24, 25, 23, 26, 22, 24,
    25, 23, 24, 26, 22, 25, 24, 23, 26, 22, 24, 25,
]


def _tech() -> list[dict]:
    return [
        {
            "slug": "gold-tech-ai-workflows-judgment",
            "title": "AI Tools at Work: Judgment and Delegation",
            "description": "Share how you use or avoid AI for tasks—where it saves time, where you override it, and what you still own yourself.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-privacy-settings-habits",
            "title": "Privacy Settings and Everyday Habits",
            "description": "Reflect on permissions, defaults, and what you actually read before tapping ‘allow’.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-attention-notifications-focus",
            "title": "Notifications, Focus, and Digital Friction",
            "description": "Explore what pulls your attention and what small design choices help or harm your day.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-smart-home-comfort-tradeoffs",
            "title": "Smart Home, Comfort, and Tradeoffs",
            "description": "Discuss convenience, cost, and trust when your space gets more connected.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-learning-online-skills",
            "title": "Learning Online: Courses, Tutorials, and Practice",
            "description": "How you pick formats, stay motivated, and judge quality in a sea of content.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-gaming-identity-communities",
            "title": "Games, Identity, and Online Communities",
            "description": "Think about play as social life, competition, and how you set boundaries.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-support-access-digital-divide",
            "title": "Tech Support, Access, and the Digital Divide",
            "description": "Honest look at who gets help, who gets left behind, and what ‘simple’ really means.",
            "category": "Technology",
        },
        {
            "slug": "gold-tech-future-work-collaboration",
            "title": "Collaboration Tools and the Future of Work",
            "description": "Async vs. real-time, documentation culture, and what makes remote teamwork feel fair.",
            "category": "Technology",
        },
    ]


def _lifestyle() -> list[dict]:
    return [
        {
            "slug": "gold-life-morning-energy-routine",
            "title": "Mornings, Energy, and Small Rituals",
            "description": "How you start the day, what actually helps, and what you wish was easier.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-fitness-body-narrative",
            "title": "Fitness, Body, and the Story You Tell",
            "description": "Goals, comparison, and compassion—without assuming a single ‘healthy’ look.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-social-boundaries-energy",
            "title": "Social Energy and Boundaries",
            "description": "Say yes, say no, recover—how you protect time for people who matter.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-home-nesting-comfort",
            "title": "Home, Nesting, and Feeling ‘At Ease’",
            "description": "Space, clutter, aesthetics, and what makes a place feel like yours.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-style-self-expression",
            "title": "Style, Expression, and First Impressions",
            "description": "Clothes, grooming, and how much performance vs. comfort you want in public.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-sleep-recovery-rhythm",
            "title": "Sleep, Recovery, and Daily Rhythm",
            "description": "What disrupts rest, what helps, and how work or care loads collide with bedtime.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-hobbies-creative-time",
            "title": "Hobbies, Creative Time, and Guilt",
            "description": "Making room for play when productivity culture is loud.",
            "category": "Lifestyle",
        },
        {
            "slug": "gold-life-relationships-conflict-repair",
            "title": "Close Relationships: Conflict and Repair",
            "description": "Arguments, apologies, and patterns you are trying to change.",
            "category": "Lifestyle",
        },
    ]


def _finance() -> list[dict]:
    return [
        {
            "slug": "gold-finance-budgeting-real-life",
            "title": "Budgeting When Life Is Irregular",
            "description": "Income swings, surprise bills, and tools or rules that actually stick.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-saving-goals-tradeoffs",
            "title": "Saving Goals and Everyday Tradeoffs",
            "description": "Emergency funds, fun money, and negotiating with your future self.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-debt-stigma-strategy",
            "title": "Debt, Stigma, and Strategy",
            "description": "How you talk to yourself about debt and what would help without shame.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-investing-risk-comfort",
            "title": "Investing, Risk, and Comfort Zones",
            "description": "What you avoid, what you trust, and how much volatility you can sleep with.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-housing-rent-buy-stress",
            "title": "Housing Costs and Big Decisions",
            "description": "Rent vs. buy framing, location tradeoffs, and family or roommate dynamics.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-talking-money-partners",
            "title": "Talking About Money with Partners or Family",
            "description": "Transparency, power, and recurring tensions—without idealizing ‘open’ conversations.",
            "category": "Finance",
        },
        {
            "slug": "gold-finance-financial-education-gaps",
            "title": "What School Didn’t Teach About Money",
            "description": "Skills you learned late, scams you dodged, and advice you’d give younger you.",
            "category": "Finance",
        },
    ]


def _health() -> list[dict]:
    return [
        {
            "slug": "gold-health-prevention-screenings-stories",
            "title": "Prevention, Screenings, and the Stories We Hear",
            "description": "Trust, fear, and access—what nudges you to act or delay.",
            "category": "Health",
        },
        {
            "slug": "gold-health-chronic-visibility-fatigue",
            "title": "Chronic Conditions, Visibility, and Fatigue",
            "description": "Work, relationships, and explaining (or not explaining) what you live with.",
            "category": "Health",
        },
        {
            "slug": "gold-health-mental-support-stigma",
            "title": "Mental Health Support and Stigma",
            "description": "Therapy, meds, community—what helped, what hurt, what you wish was normalized.",
            "category": "Health",
        },
        {
            "slug": "gold-health-food-movement-gentleness",
            "title": "Food, Movement, and Gentle Expectations",
            "description": "Nutrition noise, exercise shame, and finding a sustainable path.",
            "category": "Health",
        },
        {
            "slug": "gold-health-sleep-stress-body-signals",
            "title": "Sleep, Stress, and Listening to Your Body",
            "description": "Signals you ignore, habits you defend, and what would actually change things.",
            "category": "Health",
        },
        {
            "slug": "gold-health-care-navigation-costs",
            "title": "Navigating Care: Referrals, Costs, and Advocating for Yourself",
            "description": "Insurance puzzles, second opinions, and when you feel dismissed.",
            "category": "Health",
        },
        {
            "slug": "gold-health-aging-family-caregiving",
            "title": "Aging, Family, and Caregiving Load",
            "description": "Roles, guilt, boundaries, and resources you wish existed.",
            "category": "Health",
        },
    ]


def _food() -> list[dict]:
    return [
        {
            "slug": "gold-food-cooking-time-budget",
            "title": "Cooking at Home: Time, Budget, and Joy",
            "description": "Meal planning reality, shortcuts you accept, and meals that feel worth it.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-dining-out-social-ritual",
            "title": "Dining Out as Treat, Ritual, or Default",
            "description": "Restaurants, delivery, and when food is about more than calories.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-culture-tradition-table",
            "title": "Culture, Tradition, and the Table",
            "description": "Recipes, holidays, and belonging—especially when diets or beliefs diverge.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-labels-ethics-access",
            "title": "Labels, Ethics, and Access",
            "description": "Organic, local, fair—what you prioritize when price and time push back.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-beverages-caffeine-alcohol",
            "title": "What You Drink: Energy, Social Ease, and Limits",
            "description": "Coffee, tea, alcohol, soda—habits, culture, and health without moralizing.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-allergies-restrictions-hosting",
            "title": "Allergies, Restrictions, and Hosting Others",
            "description": "Cross-contamination anxiety, politeness, and feeding people safely.",
            "category": "Food & Beverages",
        },
        {
            "slug": "gold-food-snacking-emotions-routine",
            "title": "Snacking, Emotions, and Routine Hunger",
            "description": "Stress eating, boredom, and structure—honest patterns without a diet lecture.",
            "category": "Food & Beverages",
        },
    ]


def _travel() -> list[dict]:
    return [
        {
            "slug": "gold-travel-planning-stress-reward",
            "title": "Trip Planning: Stress, Reward, and Control",
            "description": "Research rabbit holes, budgets, and who does the invisible labor.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-flying-climate-guilt",
            "title": "Flying, Climate, and Guilt in Motion",
            "description": "How you weigh distance, cost, and values when you choose to go.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-staycations-local-discovery",
            "title": "Staycations and Discovering Home",
            "description": "Tourist eyes on your own town—what you overlook until you slow down.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-family-trips-tension",
            "title": "Family Trips: Joy, Tension, and Compromise",
            "description": "Generations, itineraries, and whose preferences win.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-work-travel-boundaries",
            "title": "Work Travel: Perks, Drain, and Boundaries",
            "description": "Hotels, time zones, and when ‘seeing the world’ stops feeling free.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-safety-mobility-access",
            "title": "Safety, Mobility, and Access on the Road",
            "description": "Who feels welcome, who feels watched, and infrastructure that helps or fails.",
            "category": "Travel",
        },
        {
            "slug": "gold-travel-souvenirs-memory-meaning",
            "title": "Souvenirs, Photos, and What You Actually Remember",
            "description": "Consumption vs. meaning—what you bring back besides stuff.",
            "category": "Travel",
        },
    ]


def _education() -> list[dict]:
    return [
        {
            "slug": "gold-edu-formal-vs-informal-learning",
            "title": "Formal School vs. Learning Everywhere Else",
            "description": "Credentials, curiosity, and skills you use that never had a grade.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-teachers-trust-authority",
            "title": "Teachers, Trust, and Authority in the Classroom",
            "description": "Moments that opened you up—or shut you down—and what good teaching felt like.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-homework-pressure-fairness",
            "title": "Homework, Pressure, and Fairness",
            "description": "Workload, family support, and who gets blamed when outcomes diverge.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-college-path-alternatives",
            "title": "College Path and Respectable Alternatives",
            "description": "Expectations, debt, and stories about ‘making it’ without a degree.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-lifelong-upskilling-anxiety",
            "title": "Lifelong Learning and Upskilling Anxiety",
            "description": "Staying relevant, course fatigue, and what employers actually reward.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-reading-media-literacy",
            "title": "Reading Habits and Media Literacy",
            "description": "Books, feeds, and how you decide what counts as ‘informed’.",
            "category": "Education",
        },
        {
            "slug": "gold-edu-parent-school-partnership",
            "title": "Parents, Schools, and Partnership (or Friction)",
            "description": "Advocacy, language barriers, and trust on both sides.",
            "category": "Education",
        },
    ]


def _environment() -> list[dict]:
    return [
        {
            "slug": "gold-env-consumption-habits-guilt",
            "title": "Consumption Habits and Low-Level Guilt",
            "description": "Packaging, upgrades, and when ‘doing your part’ feels unclear.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-local-nature-green-space",
            "title": "Local Nature and Who Gets Green Space",
            "description": "Parks, heat, pollution, and equity in where you can breathe easy.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-energy-home-bills-comfort",
            "title": "Energy at Home: Bills, Comfort, and Tradeoffs",
            "description": "Heat, AC, insulation, and what you can afford to optimize.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-transit-cars-alternatives",
            "title": "Transit, Cars, and Real Alternatives",
            "description": "What your city makes easy, what it punishes, and who is stuck driving.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-food-waste-composting",
            "title": "Food Waste, Composting, and Kitchen Reality",
            "description": "Good intentions vs. busy weeks—systems that work for your household.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-climate-news-hope-dread",
            "title": "Climate News: Hope, Dread, and What You Do With It",
            "description": "Doomscrolling, action, numbness—honest emotional weather.",
            "category": "Environment",
        },
        {
            "slug": "gold-env-community-action-volunteering",
            "title": "Community Action and Volunteering",
            "description": "Cleanups, advocacy, and when local work feels meaningful vs. symbolic.",
            "category": "Environment",
        },
    ]


def _media() -> list[dict]:
    return [
        {
            "slug": "gold-media-news-trust-outrage",
            "title": "News, Trust, and the Pull of Outrage",
            "description": "Sources you rely on, fatigue, and when you tune out on purpose.",
            "category": "Media",
        },
        {
            "slug": "gold-media-streaming-choice-paralysis",
            "title": "Streaming, Choice Paralysis, and What You Actually Finish",
            "description": "Algorithms, comfort rewatches, and guilt about ‘wasting’ time.",
            "category": "Media",
        },
        {
            "slug": "gold-media-podcasts-deep-dives",
            "title": "Podcasts, Deep Dives, and Parasocial Comfort",
            "description": "Voices you invite into your commute and what you learn—or don’t.",
            "category": "Media",
        },
        {
            "slug": "gold-media-social-platforms-perform",
            "title": "Social Platforms and Performing Your Life",
            "description": "Posting, lurking, comparison, and boundaries with an audience.",
            "category": "Media",
        },
        {
            "slug": "gold-media-representation-stories-matter",
            "title": "Representation and Stories That Feel True",
            "description": "Who gets centered on screen, stereotypes that sting, and relief when someone gets it.",
            "category": "Media",
        },
        {
            "slug": "gold-media-ads-influence-skepticism",
            "title": "Ads, Influence, and Everyday Skepticism",
            "description": "Sponsored content, reviews, and when you trust a recommendation.",
            "category": "Media",
        },
        {
            "slug": "gold-media-kids-screens-household-rules",
            "title": "Kids, Screens, and Household Rules",
            "description": "What you model, what you fear, and negotiations at bedtime.",
            "category": "Media",
        },
    ]


def _automotive() -> list[dict]:
    return [
        {
            "slug": "gold-auto-daily-commute-sanity",
            "title": "Daily Commute: Sanity, Cost, and Time",
            "description": "Driving, transit, or mix—what you’d change if you could.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-car-ownership-burden-freedom",
            "title": "Car Ownership: Burden, Freedom, and Pride",
            "description": "Payments, repairs, identity, and when a car is non-negotiable.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-ev-charging-infrastructure",
            "title": "EVs, Charging, and Infrastructure Reality",
            "description": "Range anxiety, home charging, and trust in the grid.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-safety-tech-trust",
            "title": "Safety Tech: Alerts, Autopilot, and Trust",
            "description": "Features you love, features you override, and driver attention.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-used-market-repairs",
            "title": "Used Cars, Repairs, and Unexpected Bills",
            "description": "Mechanics, warranties, and how you decide when to let a car go.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-cities-parking-walkability",
            "title": "Cities, Parking, and Walkability",
            "description": "When driving is default, when you’d rather walk, and policy you notice.",
            "category": "Automotive",
        },
        {
            "slug": "gold-auto-road-trips-family-gear",
            "title": "Road Trips, Family, and Packing the Car",
            "description": "Comfort, snacks, playlists, and the myth of the ‘easy’ long drive.",
            "category": "Automotive",
        },
    ]


def build_surveys() -> list[dict]:
    return (
        _tech()
        + _lifestyle()
        + _finance()
        + _health()
        + _food()
        + _travel()
        + _education()
        + _environment()
        + _media()
        + _automotive()
    )


def slug_prefix(slug: str) -> str:
    return re.sub(r"[^a-z0-9]", "", slug)[:24]


def build_thirty_five_questions(short: str) -> list[dict]:
    """35 questions: trimmed from platinum 50 — same tone, fewer mid/close items."""
    qs: list[dict] = []
    idx = 0

    def cid() -> str:
        nonlocal idx
        idx += 1
        return f"{short}_{idx:02d}"

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

    text_prompts_a = [
        "Describe a recent moment when this topic forced you to choose between two values you both care about. What did you pick, and what did it cost?",
        "What is one widely repeated opinion about this topic that you think is too simple? What nuance is usually missing?",
        "If someone you respect disagreed with you on this, what is the strongest version of their argument you could offer on their behalf?",
        "What would ‘good enough’ look like for you on this topic in the next year—not perfection, but meaningful progress?",
    ]
    for lab in text_prompts_a:
        qs.append({"id": cid(), "type": "text", "label": lab})

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
    ]
    for lab, opts in stems_mid:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    text_prompts_b = [
        "Name one assumption people make about ‘people like you’ in this topic that is often wrong or incomplete.",
        "What is a constructive disagreement you wish more people could have about this—without collapsing into teams?",
        "If you could ask one question to the most powerful decision-maker in this space, what would it be—and why?",
    ]
    for lab in text_prompts_b:
        qs.append({"id": cid(), "type": "text", "label": lab})

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
            "Final calibration: how representative do you think your answers are of people in situations very different from yours?",
            ["Very representative", "Somewhat", "Not very", "I doubt it", "I actively don’t know"],
        ),
    ]
    for lab, opts in stems_close:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    assert len(qs) == 35, len(qs)
    return qs


def main() -> None:
    surveys = build_surveys()
    if len(surveys) != 72:
        print(f"Expected 72 surveys, got {len(surveys)}", file=sys.stderr)
        sys.exit(1)

    out: list[str] = []
    out.append(
        """-- 72 Gold-tier surveys ($4–$5 reward), all content categories, 35 questions each.
-- Reflective scenario + text mix (aligned with platinum style, shorter). Idempotent on slug.
--
-- Requires public.surveys, payment_categories (gold), survey_category / payment_category_id columns.

"""
    )

    for i, s in enumerate(surveys):
        sp = slug_prefix(s["slug"])
        questions = build_thirty_five_questions(sp)
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
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

""")

    path = Path(__file__).resolve().parent.parent / "supabase" / "migrations" / "20260412_seed_gold_deep_surveys.sql"
    path.write_text("".join(out), encoding="utf-8")
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()

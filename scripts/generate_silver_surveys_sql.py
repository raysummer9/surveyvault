#!/usr/bin/env python3
"""Generate supabase migration for 233 Silver-tier surveys (25 questions each, $1–$2). Run from repo root."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# Linear spread $1.00–$2.00 (cents) across 233 surveys
REWARDS_CENTS = [100 + round(i * 100 / 232) for i in range(233)]

EST_MINUTES = [16 + (i % 5) for i in range(233)]  # 16–20


def parse_block(category: str, cat_key: str, block: str) -> list[dict]:
    rows: list[dict] = []
    for i, line in enumerate(block.strip().splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "|" not in line:
            raise ValueError(f"Bad line (missing |): {line!r}")
        title, desc = line.split("|", 1)
        slug = f"silver-{cat_key}-{i:03d}"
        rows.append(
            {
                "slug": slug,
                "title": title.strip(),
                "description": desc.strip(),
                "category": category,
            }
        )
    return rows


# --- Theme blocks: one "Title|One-sentence description" per survey line (counts must match EXPECTED). ---

TECH = """
AI at work|How assistants and automation change drafting, checking, and who owns the outcome.
Notification load|Alerts, badges, and what you mute—or wish you could mute.
Passwords and recovery|Managers, memorable passwords, and panic when locked out.
Two-factor reality|SMS, apps, keys—what you tolerate for security.
Cloud backups|Photos, files, and trust that the cloud will be there.
Smart home basics|Speakers, cameras, and comfort with devices listening.
App permissions|What you grant without reading and what makes you pause.
Updates and restarts|Security patches vs. interruption—when you delay.
Browser extensions|Productivity helpers, ad blockers, and trust lines.
Email triage|Inbox zero dreams, folders, and what actually works.
Calendar blocking|Deep work, meetings, and protecting time.
Video call fatigue|Camera on or off, and energy after long calls.
Ergonomics and breaks|Chairs, screens, wrists—what you ignore until it hurts.
Screen time with kids|Rules, guilt, and what you model.
Mobile banking|Transfers, alerts, and comfort on a small screen.
Public Wi‑Fi|What you’ll log into on coffee-shop networks.
VPN habits|Work requirement, privacy theater, or real protection.
Gaming subscriptions|Libraries, free-to-play, and sunk cost.
E-readers vs paper|Convenience, focus, and what you buy twice.
Podcast diet|Discovery, speed listening, and voices you trust.
Feeds without algorithms|RSS, newsletters, and curating inputs.
Digital decluttering|Old accounts, unused apps, and closing tabs.
Tech support scams|Calls, pop-ups, and who you hang up on.
Repair vs replace|Screens, batteries, and the right to fix.
"""

LIFESTYLE = """
Morning rhythm|Wake time, coffee, and the first hour that sets the tone.
Sleep debt|Weekend catch-up, alarms, and what actually helps rest.
Movement you keep|Walks, gym, or neither—honesty about consistency.
Social battery|Large groups vs one-on-one and how you recover.
Home clutter|What you tolerate, what triggers a purge, and sentimental stuff.
Style and comfort|Dressing for others vs yourself on an average day.
Creative hobbies|Making time when productivity culture is loud.
Close arguments|Patterns you repeat and repair attempts that work.
Weekend vs weekday|How differently you actually live when work stops.
Meal cadence|Cooking, takeout, and who plans food in your home.
Gratitude or journaling|Practices you sustain vs abandon by February.
Pets at home|Joy, cost, and boundaries with animals in your space.
Neighbors and noise|Boundaries, small talk, and sound you live with.
Volunteering time|Causes, frequency, and when you say no.
Travel style|Planner, improviser, and what stresses you most.
Gift-giving culture|Obligation, joy, and budgets around holidays.
Celebrations|Birthdays, milestones, and traditions you keep or skip.
Alone time needs|How much solitude restores you vs feels lonely.
Family expectations|Roles, holidays, and pressure you navigate.
Roommate or partner friction|Chores, noise, and fair splits.
Nesting and renting|Making a lease feel like home on a budget.
Moving stress|Packing, purging, and starting over in a new place.
Evening wind-down|Screens, books, and what actually ends your day.
Seasonal mood|Winter blues, summer energy, and coping tools.
"""

FINANCE = """
Budget reality|Apps, spreadsheets, or gut—and how often you look.
Emergency fund peace|Months saved, tradeoffs, and what counts as emergency.
Debt payoff pace|Snowball, avalanche, or minimums—and shame you carry.
Investing first steps|Index funds, apps, and fear of doing it wrong.
Credit score stories|Surprises, disputes, and what you check.
Rent vs buy framing|Math, emotion, and where you are in life.
Subscription creep|Trials that stuck and audits you never finish.
Money talks at home|Transparency, fights, and silent agreements.
Kids and money|Allowance, chores, and lessons you want to pass on.
Financial anxiety|What spikes at night and what calms you.
Side income hustle|Gig work, selling stuff, and time cost.
Tax season stress|DIY, CPA, and surprises you dread.
Retirement starting late|Catch-up feelings and what you still skip.
Student loan weight|Payment plans, forgiveness news, and resentment.
Car payment math|Lease, loan, or old reliable—what you defend.
Insurance shopping|Home, auto, health—comparison fatigue and trust.
Advice you trust|Friends, influencers, planners—and red flags.
Scams and urgency|Texts, calls, and moments you almost clicked.
Thrift vs convenience|Dollar saved vs hour spent—where you draw the line.
Charitable giving|Percent, causes, and spontaneous vs planned.
Negotiation comfort|Salary, bills, and asking for a better deal.
Windfalls and bonuses|Save, spend, splurge—rules you wish you had.
Inheritance expectations|Family money, awkward talks, and assumptions.
Literacy gaps|Concepts you learned late and wish school taught.
"""

HEALTH = """
Preventive habits|Checkups you keep vs skip—and why.
Chronic condition life|Visibility at work, rest, and explaining limits.
Mental health access|Therapy waitlists, cost, and what helped once.
Medication stigma|Who knows what you take and how you talk about it.
Sleep hygiene noise|Rules you follow, break, and actually believe.
Nutrition information overload|Diets, influencers, and your real eating.
Exercise consistency|Gym dread, walking wins, and all-or-nothing traps.
Telehealth tradeoffs|Convenience vs hands-on care—what you trust.
Second opinions|When you seek one and how doctors react.
Insurance fights|Claims, codes, and hours on hold.
Aging parents load|Logistics, guilt, and siblings—or lack of them.
Body image day to day|Mirrors, photos, and compassion you practice.
Pain and function|What you push through vs when you stop.
Recovery from injury|PT, patience, and returning too fast.
Fertility journey|Privacy, cost, and unsolicited advice.
Substance honesty|Coffee to alcohol—patterns you question without shame.
Vaccination conversations|Trust, family, and community pressure.
Health misinformation|Group chats, headlines, and who you believe.
Dentist avoidance|Fear, cost, and the appointment you keep postponing.
Vision and hearing changes|Admitting needs, stigma, and adaptation.
Workplace health|Breaks, ergonomics, and culture that rewards grind.
Caregiver burnout|Support you lack and small relief that helps.
End-of-life planning|Documents, conversations, and what you avoid.
"""

FOOD = """
Cooking frequency|Weeknight reality vs weekend ambition.
Meal kits value|Convenience, waste, and whether you stay subscribed.
Dining out budget|Treat, default, and where money leaks.
Takeout habits|Apps, fees, and the threshold for ‘just order.’
Dietary restrictions|Hosting, restaurants, and explaining needs.
Ethical eating tension|Budget, access, and ideals you hold lightly.
Coffee and cafe culture|Daily ritual, cost, and social function.
Alcohol in social life|Pressure to drink, moderation, and opting out.
Snacks and stress|Patterns you notice and rename without shame.
Farmers markets vs grocery|Time, price, and seasonal joy.
Food waste at home|Planning, leftovers, and guilt you manage.
Hosting stress|Menus, diets, and making everyone comfortable.
Kids’ lunches|Nutrition ideals vs morning chaos.
Cultural food identity|Traditions, fusion, and belonging at the table.
New cuisines curiosity|Adventure, travel, and what you order first.
Hydration basics|Water, caffeine, and what you track.
Sugar awareness|Labels, cravings, and moderation language.
Supplements skepticism|What you take, skip, and why.
Restaurant tipping|Percent norms, service quality, and cash vs card.
Delivery app dependence|Speed, fees, and drivers you think about.
Kitchen gear worth it|Gadgets used vs drawer clutter.
Seasonal eating|Local, habit, or aesthetic—honest motivation.
Trying meal prep|Containers, Sunday hours, and burnout.
"""

TRAVEL = """
Trip planning style|Spreadsheets, vibes, or trusted friend’s itinerary.
Budget travel tactics|Hostels, red-eyes, and what you won’t do anymore.
Flight deal hunting|Alerts, points, and regret purchases.
Hotel loyalty vs deals|Status, points, and where you actually stay.
Road trip rhythm|Stops, snacks, and who drives how long.
Packing philosophy|Carry-on discipline vs ‘just in case.’
Travel anxiety|Flights, crowds, and coping before you go.
Solo travel draw|Freedom, loneliness, and safety calculus.
Family trip dynamics|Itineraries, meltdowns, and compromise.
International hesitation|Passport, language, and first big trip fear.
Jet lag reality|Strategies you swear by vs ignore.
Travel insurance|When you buy, skip, and read the fine print.
Sustainability guilt|Flying less, offsets, and honest tradeoffs.
Local experiences|Tourism vs living like a local—what you seek.
Staycation reframing|Home as destination and what you still spend.
Business travel drain|Perks, loneliness, and boundaries with work.
Group tours|Structure, strangers, and when guidance helps.
Travel photography|Phones, posting, and being present—tension you feel.
Souvenirs and stuff|What you bring back vs regret buying.
Border crossing stress|Lines, questions, and paperwork anxiety.
Language barriers|Apps, gestures, and embarrassment you survive.
Last-minute trips|Spontaneity, price, and who can drop everything.
Cruises vs land trips|Ship life, crowds, and what you’d book again—or skip.
"""

EDUCATION = """
Study habits now|What worked in school vs what you use today.
Online course completion|Starts strong, fades fast—patterns you notice.
Teacher trust|Moments that opened you up or shut you down.
Homework load reality|Kids, parents, and how much is too much.
Test anxiety|Preparation rituals and catastrophic thoughts.
College choice pressure|Rankings, debt, and ‘good enough’ school.
Trade school respect|Paths that don’t need a four-year story.
Student debt weight|Payments, forgiveness headlines, and shame.
Lifelong learning appetite|Books, courses, and fear of irrelevance.
Reading for pleasure|Time, format, and guilt when you don’t.
Libraries in your life|Books, wifi, community—and frequency.
Tutoring access|Cost, stigma, and when help actually lands.
Parent involvement|Advocacy, hovering, and school partnership.
School funding awareness|Bonds, taxes, and equity you see or miss.
Bullying and belonging|What schools handle well vs badly.
Extracurricular load|Sports, arts, burnout, and college résumés.
Grades vs learning|What gets measured and what you value.
Credential inflation|Degrees required for jobs that didn’t need them.
Corporate training fatigue|Mandatory modules vs skills you want.
Workshops and conferences|Networking, travel, and real takeaways.
Mentorship luck|Formal programs vs informal guides you found.
Critical thinking habits|Sources, arguments, and changing your mind.
Misinformation in classrooms|What gets taught, challenged, or skipped.
"""

ENVIRONMENT = """
Recycling confusion|Rules that change and what you still toss wrong.
Composting effort|Smell, pests, and habits that stick.
Plastic reduction|Bags, bottles, and access where you live.
Energy bills and comfort|Heat, AC, and upgrades you can afford.
Water use awareness|Lawns, showers, and drips you ignore.
Local pollution smells|Factories, traffic, and who bears it.
Green product skepticism|Labels, price, and trust in ‘eco.’
Fast fashion guilt|Trends, budget, and buying less—realistically.
Flying less commitment|Trains, video, and trips you still take.
Biking infrastructure|Safety, sweat, and when you choose two wheels.
Public transit pride|Reliability, dignity, and car optional life.
Home gardening|Space, time, and what you actually harvest.
Meat reduction path|Flexitarian, culture, and protein worries.
Climate activism comfort|Marches, donations, and everyday courage.
Climate anxiety load|News, kids, and numbness you fight.
Local environmental policy|Votes, meetings, and issues you track.
Volunteering outdoors|Parks, rivers, and hands in dirt.
Nature connection|Weekend hikes, backyard birds, and screen contrast.
Kids and nature|School gardens, fear of dirt, and wonder.
Voting with environment|Single issue vs bundle—and tradeoffs.
Corporate greenwashing|Ads you distrust and proof you want.
Offset skepticism|Airlines, projects, and moral license feelings.
Community gardens|Plots, neighbors, and food access.
"""

MEDIA = """
News diet shape|Sources, hours, and when you feel worse informed.
Cable cutting aftermath|Streaming stacks, cost, and confusion.
YouTube rabbit holes|Recommendations, time lost, and unsubscribe discipline.
Twitter replacement life|Where discourse went for you—if anywhere.
TikTok boundaries|Kids, yourself, and algorithm guilt.
News fatigue cycle|Breaking news, doom, and deliberate breaks.
Documentary habits|Learning vs entertainment—and bias you notice.
Reality TV comfort|Guilt, gossip, and why you keep watching.
Sports media diet|Highlights, talk radio, and tribal loyalty.
Music discovery|Playlists, friends, algorithms, and nostalgia.
Newsletter inbox|Paid subs, free piles, and unsubscribe day.
Audiobook vs eyes|Commute, chores, and retention.
Misinformation spotting|Family group chats and polite corrections.
Comment section culture|Reading, posting, and toxicity you avoid.
Cancel culture distance|Public figures, proportion, and empathy fatigue.
Journalism trust|Local beats, national brands, and reporters you follow.
Local news gap|What disappeared and what you miss.
Radio and podcasts in car|Talk, music, silence—and habits.
Comedy news shows|Satire, cynicism, and staying informed.
Spoiler culture|Speed vs courtesy in group chats.
Rewatch comfort shows|Nostalgia, anxiety, and ‘background TV.’
Live events on TV|Sports finals, awards, and appointment viewing vs next-day clips.
Print magazines|Longform, ads, and subscriptions you still pay for—or miss.
"""

AUTO = """
Commute length reality|Time, cost, and what you’d give to shorten it.
Car payment burden|Monthly bite, term length, and regret points.
Fuel price swings|Budgeting, EV curiosity, and driving less.
EV curiosity barriers|Charging, apartment life, and road trips.
Winter driving stress|Tires, ice, and skills you trust—or don’t.
Maintenance DIY vs shop|YouTube courage, tools, and trust in mechanics.
Dealership dread|Negotiation, upsells, and walking away.
Used car search fatigue|History reports, test drives, and red flags.
Car insurance shopping|Rates, bundles, and loyalty penalties.
Rideshare vs owning|Math, convenience, and surge pricing pain.
Bike lanes and drivers|Safety, road rage, and sharing space.
Parking stress downtown|Time, money, and giving up to avoid it.
Road rage triggers|Honking, merging, and cooling down.
Teen drivers at home|Teaching, insurance spike, and letting go.
Car seats and safety|Install anxiety, upgrades, and secondhand rules.
Road trip packing|Snacks, stops, and back-seat peace.
Rental car surprises|Insurance upsell, damage checks, and fuel games.
Lemon laws awareness|Warranty fights and dealer responses.
Autonomous cars curiosity|Trust, regulation, and timeline disbelief.
Traffic policy opinions|Tolls, lanes, and who pays for roads.
Car culture identity|Brand, mods, and pride vs appliance mindset.
Detailing and pride|Clean car, time, and worth it moments.
Toll roads and express lanes|Price, time saved, and equity feelings.
"""


def build_surveys() -> list[dict]:
    expected = [24, 24, 24, 23, 23, 23, 23, 23, 23, 23]
    blocks = [
        ("Technology", "tech", TECH),
        ("Lifestyle", "life", LIFESTYLE),
        ("Finance", "fin", FINANCE),
        ("Health", "health", HEALTH),
        ("Food & Beverages", "food", FOOD),
        ("Travel", "travel", TRAVEL),
        ("Education", "edu", EDUCATION),
        ("Environment", "env", ENVIRONMENT),
        ("Media", "media", MEDIA),
        ("Automotive", "auto", AUTO),
    ]
    out: list[dict] = []
    for (cat, key, block), exp in zip(blocks, expected):
        rows = parse_block(cat, key, block)
        if len(rows) != exp:
            raise RuntimeError(f"{cat}: expected {exp} rows, got {len(rows)}")
        out.extend(rows)
    if len(out) != 233:
        raise RuntimeError(f"Total surveys expected 233, got {len(out)}")
    return out


def slug_prefix(slug: str) -> str:
    return re.sub(r"[^a-z0-9]", "", slug)[:24]


def build_thirty_questions(short: str) -> list[dict]:
    """30 questions: 8 choice + 3 text + 9 choice + 2 text + 8 choice (meets MIN_SURVEY_QUESTIONS)."""
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
    ]
    for lab, opts in stems_mid:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    text_prompts_b = [
        "Name one assumption people make about ‘people like you’ in this topic that is often wrong or incomplete.",
        "What is a constructive disagreement you wish more people could have about this—without collapsing into teams?",
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
            "Final calibration: how representative do you think your answers are of people in situations very different from yours?",
            ["Very representative", "Somewhat", "Not very", "I doubt it", "I actively don’t know"],
        ),
    ]
    for lab, opts in stems_close:
        qs.append({"id": cid(), "type": "choice", "label": lab, "options": opts})

    assert len(qs) == 30, len(qs)
    return qs


def render_inserts(surveys: list[dict], global_start_index: int) -> str:
    """global_start_index: offset into REWARDS_CENTS / EST_MINUTES for this chunk."""
    parts: list[str] = []
    for j, s in enumerate(surveys):
        i = global_start_index + j
        sp = slug_prefix(s["slug"])
        questions = build_thirty_questions(sp)
        payload = json.dumps(questions, ensure_ascii=False)
        reward = REWARDS_CENTS[i]
        minutes = EST_MINUTES[i]
        cat = s["category"].replace("'", "''")
        title = s["title"].replace("'", "''")
        desc = s["description"].replace("'", "''")
        slug = s["slug"]

        parts.append(f"""insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
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
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

""")
    return "".join(parts)


def render_updates(surveys: list[dict]) -> str:
    """UPDATE questions for existing silver surveys (slug prefix silver-)."""
    parts: list[str] = []
    for s in surveys:
        sp = slug_prefix(s["slug"])
        payload = json.dumps(build_thirty_questions(sp), ensure_ascii=False)
        slug = s["slug"]
        parts.append(f"""update public.surveys
set questions = $json${payload}$json$::jsonb
where slug = '{slug}';

""")
    return "".join(parts)


def main() -> None:
    surveys = build_surveys()
    if len(surveys) != 233:
        print(f"Expected 233 surveys, got {len(surveys)}", file=sys.stderr)
        sys.exit(1)

    # Four files so each batch fits Supabase SQL Editor limits; run in order or independently (idempotent).
    chunk_sizes = [58, 58, 58, 59]
    if sum(chunk_sizes) != len(surveys):
        raise RuntimeError("chunk_sizes must sum to survey count")
    migration_files = [
        "20260413_seed_silver_deep_surveys_part1_of_4.sql",
        "20260414_seed_silver_deep_surveys_part2_of_4.sql",
        "20260415_seed_silver_deep_surveys_part3_of_4.sql",
        "20260416_seed_silver_deep_surveys_part4_of_4.sql",
    ]

    header = """-- Silver-tier surveys ($1–$2 reward), 30 questions each (meets MIN_SURVEY_QUESTIONS).
-- Reflective mix (shortened from Gold/Platinum templates). Idempotent on slug.
--
-- Requires public.surveys, payment_categories (silver), survey_category / payment_category_id columns.
-- Safe to run parts in order or separately; re-runs skip existing slugs (ON CONFLICT DO NOTHING).

"""

    update_header = """-- Patch existing silver seed surveys from 25 → 30 questions (admin MIN_SURVEY_QUESTIONS).
-- Run after 20260413–20260416 if those seeds were already applied. Safe to re-run.

"""

    update_files = [
        "20260419_update_silver_surveys_thirty_questions_part1_of_4.sql",
        "20260420_update_silver_surveys_thirty_questions_part2_of_4.sql",
        "20260421_update_silver_surveys_thirty_questions_part3_of_4.sql",
        "20260422_update_silver_surveys_thirty_questions_part4_of_4.sql",
    ]

    mig_dir = Path(__file__).resolve().parent.parent / "supabase" / "migrations"
    offset = 0
    for part_num, (size, name) in enumerate(zip(chunk_sizes, migration_files), start=1):
        chunk = surveys[offset : offset + size]
        offset += size
        body = render_inserts(chunk, offset - len(chunk))
        banner = f"-- Part {part_num} of 4 — {len(chunk)} surveys (global rows {offset - len(chunk) + 1}–{offset} of 233).\n\n"
        path = mig_dir / name
        path.write_text(header + banner + body, encoding="utf-8")
        print(f"Wrote {path}")

    offset = 0
    for part_num, (size, name) in enumerate(zip(chunk_sizes, update_files), start=1):
        chunk = surveys[offset : offset + size]
        offset += size
        body = render_updates(chunk)
        banner = f"-- Part {part_num} of 4 — {len(chunk)} updates.\n\n"
        path = mig_dir / name
        path.write_text(update_header + banner + body, encoding="utf-8")
        print(f"Wrote {path}")

    old_monolith = mig_dir / "20260413_seed_silver_deep_surveys.sql"
    if old_monolith.exists():
        old_monolith.unlink()
        print(f"Removed obsolete {old_monolith.name}")


if __name__ == "__main__":
    main()

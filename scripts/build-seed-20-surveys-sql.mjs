/**
 * Generates SQL INSERTs for seed surveys (30 questions each: 4 intro + 24 Likert + 2 text).
 *
 * From project root:
 *   npm run generate:seed-surveys > supabase/migrations/20260331_seed_twenty_diverse_surveys.sql
 *
 * Or: node scripts/build-seed-20-surveys-sql.mjs > supabase/migrations/20260331_seed_twenty_diverse_surveys.sql
 *
 * Add more: append to the `surveys` array (unique slug + letter). If DB already ran this migration,
 * write output to a NEW migration file instead of editing the old one.
 */

const LIKERT = ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree']

const stems = (prefix) => [
  `(${prefix}) How much do you agree: this topic matters to my daily life?`,
  `(${prefix}) How often do you actively seek information in this area?`,
  `(${prefix}) How important is this topic for your future plans?`,
  `(${prefix}) How confident are you in your current approach?`,
  `(${prefix}) How often do you compare yourself to others on this topic?`,
  `(${prefix}) How satisfied are you with available options today?`,
  `(${prefix}) How likely are you to try something new in the next year?`,
  `(${prefix}) How clear are your personal goals here?`,
  `(${prefix}) How often do you discuss this with family or friends?`,
  `(${prefix}) How much time do you spend on this weekly?`,
  `(${prefix}) How stressed do you feel about decisions in this area?`,
  `(${prefix}) How well do tools or apps support what you need?`,
  `(${prefix}) How open are you to expert advice here?`,
  `(${prefix}) How consistent are your habits related to this topic?`,
  `(${prefix}) How much has your view changed in the past 2 years?`,
  `(${prefix}) How often do you track progress in this area?`,
  `(${prefix}) How much does cost influence your choices here?`,
  `(${prefix}) How much does convenience matter to you here?`,
  `(${prefix}) How often do you feel well informed?`,
  `(${prefix}) How much do reviews or ratings affect you?`,
  `(${prefix}) How likely are you to recommend your approach to a friend?`,
  `(${prefix}) How much does sustainability factor in for you?`,
  `(${prefix}) How often do you plan ahead for this topic?`,
  `(${prefix}) How much does brand loyalty play a role?`,
  `(${prefix}) Overall, how positive is your experience in this area?`,
  `(${prefix}) How much room for improvement do you see for yourself?`,
]

/** 24 choice questions (ids 5–28); questions 29–30 are text in caller. All use Likert scale. */
function extra24(prefix, letter) {
  const out = []
  for (let i = 0; i < 24; i++) {
    const n = 5 + i
    const id = `${letter}${n}`
    const label = stems(prefix)[i]
    out.push({ id, type: 'choice', label, options: [...LIKERT] })
  }
  return out
}

const surveys = [
  {
    slug: 'seed-tech-screen-balance',
    title: 'Digital Wellness & Screen Time',
    desc: 'Share how you use devices day to day and what helps you stay balanced.',
    reward: 325,
    mins: 18,
    cat: 'Technology',
    tier: 'silver',
    prefix: 'Digital wellness',
    letter: 'a',
    first: [
      { id: 'a1', type: 'choice', label: 'Roughly how many hours of screen time do you have on a typical weekday?', options: ['Under 2h', '2–4h', '4–6h', '6h+'] },
      { id: 'a2', type: 'choice', label: 'What do you use most in the evening?', options: ['Phone', 'Laptop or PC', 'Tablet', 'TV / streaming'] },
      { id: 'a3', type: 'choice', label: 'Do you use app limits or focus modes?', options: ['Yes, daily', 'Sometimes', 'No'] },
      { id: 'a4', type: 'text', label: 'What one habit would most improve your digital wellness?' },
    ],
  },
  {
    slug: 'seed-life-morning-routine',
    title: 'Morning Routines & Energy',
    desc: 'Tell us how you start the day and what boosts your energy.',
    reward: 375,
    mins: 18,
    cat: 'Lifestyle',
    tier: 'gold',
    prefix: 'Morning routines',
    letter: 'b',
    first: [
      { id: 'b1', type: 'choice', label: 'What time do you usually wake up on weekdays?', options: ['Before 6', '6–7', '7–8', 'After 8'] },
      { id: 'b2', type: 'choice', label: 'First thing you do after waking?', options: ['Phone', 'Coffee or tea', 'Exercise', 'Shower', 'Other'] },
      { id: 'b3', type: 'choice', label: 'How consistent is your routine?', options: ['Very', 'Somewhat', 'Not really'] },
      { id: 'b4', type: 'text', label: 'What would make your mornings easier?' },
    ],
  },
  {
    slug: 'seed-finance-saving-habits',
    title: 'Saving & Spending Patterns',
    desc: 'We are studying how people plan savings and handle unexpected expenses.',
    reward: 450,
    mins: 20,
    cat: 'Finance',
    tier: 'platinum',
    prefix: 'Personal finance',
    letter: 'c',
    first: [
      { id: 'c1', type: 'choice', label: 'How do you primarily track spending?', options: ['App or spreadsheet', 'Bank alerts', 'Mental estimate', 'I do not track'] },
      { id: 'c2', type: 'choice', label: 'Emergency fund status?', options: ['3+ months expenses', '1–3 months', 'Under one month', 'None yet'] },
      { id: 'c3', type: 'choice', label: 'Biggest financial stress?', options: ['Rent or mortgage', 'Debt', 'Income stability', 'Investments', 'Other'] },
      { id: 'c4', type: 'text', label: 'What financial topic do you wish you learned earlier?' },
    ],
  },
  {
    slug: 'seed-health-fitness-goals',
    title: 'Fitness Goals & Movement',
    desc: 'Your input helps shape wellness programs for busy people.',
    reward: 300,
    mins: 18,
    cat: 'Health',
    tier: 'silver',
    prefix: 'Fitness',
    letter: 'd',
    first: [
      { id: 'd1', type: 'choice', label: 'How often do you exercise?', options: ['Daily', '3–5x / week', '1–2x / week', 'Rarely'] },
      { id: 'd2', type: 'choice', label: 'Preferred activity?', options: ['Gym', 'Running / walking', 'Classes', 'Home workout', 'Sports'] },
      { id: 'd3', type: 'choice', label: 'Biggest barrier to consistency?', options: ['Time', 'Motivation', 'Access', 'Injury', 'Other'] },
      { id: 'd4', type: 'text', label: 'What would help you move more each week?' },
    ],
  },
  {
    slug: 'seed-food-dining-out',
    title: 'Dining Out & Food Discovery',
    desc: 'Tell us how you choose restaurants and try new cuisines.',
    reward: 340,
    mins: 18,
    cat: 'Food & Beverages',
    tier: 'gold',
    prefix: 'Dining',
    letter: 'e',
    first: [
      { id: 'e1', type: 'choice', label: 'How often do you eat out or order in?', options: ['Daily', 'Several times a week', 'Weekly', 'Rarely'] },
      { id: 'e2', type: 'choice', label: 'What drives your choice most?', options: ['Price', 'Reviews', 'Location', 'Cuisine type', 'Friends'] },
      { id: 'e3', type: 'choice', label: 'Dietary preference?', options: ['No restriction', 'Vegetarian', 'Vegan', 'Keto / low-carb', 'Allergies'] },
      { id: 'e4', type: 'text', label: 'Describe a memorable meal from the last month.' },
    ],
  },
  {
    slug: 'seed-travel-weekend-trips',
    title: 'Weekend Getaways & Short Trips',
    desc: 'We want to learn how you plan short breaks and what you value on the road.',
    reward: 420,
    mins: 20,
    cat: 'Travel',
    tier: 'platinum',
    prefix: 'Short trips',
    letter: 'f',
    first: [
      { id: 'f1', type: 'choice', label: 'How many weekend trips do you take per year?', options: ['0', '1–3', '4–6', '7+'] },
      { id: 'f2', type: 'choice', label: 'Typical transport?', options: ['Car', 'Plane', 'Train', 'Bus'] },
      { id: 'f3', type: 'choice', label: 'Accommodation style?', options: ['Hotel', 'Rental home', 'Hostel', 'Stay with friends'] },
      { id: 'f4', type: 'text', label: 'Favorite weekend destination type and why?' },
    ],
  },
  {
    slug: 'seed-edu-online-learning',
    title: 'Online Learning & Upskilling',
    desc: 'Share how you learn new skills outside of formal school.',
    reward: 315,
    mins: 18,
    cat: 'Education',
    tier: 'silver',
    prefix: 'Learning',
    letter: 'g',
    first: [
      { id: 'g1', type: 'choice', label: 'Used an online course in the last year?', options: ['Yes, finished', 'Yes, in progress', 'No'] },
      { id: 'g2', type: 'choice', label: 'Preferred format?', options: ['Video', 'Reading', 'Live sessions', 'Projects'] },
      { id: 'g3', type: 'choice', label: 'Topic you study most?', options: ['Career', 'Language', 'Creative', 'Tech', 'Other'] },
      { id: 'g4', type: 'text', label: 'What platform or course would you recommend?' },
    ],
  },
  {
    slug: 'seed-env-sustainable-choices',
    title: 'Sustainable Everyday Choices',
    desc: 'Help brands understand which eco actions feel realistic for you.',
    reward: 385,
    mins: 18,
    cat: 'Environment',
    tier: 'gold',
    prefix: 'Sustainability',
    letter: 'h',
    first: [
      { id: 'h1', type: 'choice', label: 'How often do you avoid single-use plastic?', options: ['Always', 'Often', 'Sometimes', 'Rarely'] },
      { id: 'h2', type: 'choice', label: 'Biggest motivator for green habits?', options: ['Cost', 'Health', 'Ethics', 'Regulation', 'Community'] },
      { id: 'h3', type: 'choice', label: 'Would you pay more for sustainable packaging?', options: ['Yes', 'Depends', 'No'] },
      { id: 'h4', type: 'text', label: 'One change you wish your city made for the environment?' },
    ],
  },
  {
    slug: 'seed-media-podcast-tv',
    title: 'Podcasts, TV & Streaming Habits',
    desc: 'Tell us what you watch and listen to—and when.',
    reward: 400,
    mins: 20,
    cat: 'Media',
    tier: 'platinum',
    prefix: 'Media habits',
    letter: 'i',
    first: [
      { id: 'i1', type: 'choice', label: 'Primary streaming subscriptions?', options: ['0–1', '2–3', '4+'] },
      { id: 'i2', type: 'choice', label: 'Podcasts: how often?', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
      { id: 'i3', type: 'choice', label: 'Preferred genre lately?', options: ['News', 'Comedy', 'True crime', 'Education', 'Fiction'] },
      { id: 'i4', type: 'text', label: 'What show or podcast should everyone try?' },
    ],
  },
  {
    slug: 'seed-auto-car-shopping',
    title: 'Car Shopping & Ownership',
    desc: 'We are researching how people research and buy vehicles.',
    reward: 330,
    mins: 18,
    cat: 'Automotive',
    tier: 'silver',
    prefix: 'Automotive',
    letter: 'j',
    first: [
      { id: 'j1', type: 'choice', label: 'Own or lease a vehicle today?', options: ['Own', 'Lease', 'Neither'] },
      { id: 'j2', type: 'choice', label: 'Next purchase likely to be?', options: ['New ICE', 'Used ICE', 'Hybrid', 'EV', 'Unsure'] },
      { id: 'j3', type: 'choice', label: 'Top research source?', options: ['Dealer visits', 'Online reviews', 'YouTube', 'Friends'] },
      { id: 'j4', type: 'text', label: 'What would make buying a car less stressful?' },
    ],
  },
  {
    slug: 'seed-tech-smart-home',
    title: 'Smart Home & Connected Devices',
    desc: 'Share how connected devices fit into your home life.',
    reward: 395,
    mins: 20,
    cat: 'Technology',
    tier: 'gold',
    prefix: 'Smart home',
    letter: 'k',
    first: [
      { id: 'k1', type: 'choice', label: 'How many smart devices in your home?', options: ['0', '1–3', '4–7', '8+'] },
      { id: 'k2', type: 'choice', label: 'Voice assistant usage?', options: ['Daily', 'Sometimes', 'Tried once', 'None'] },
      { id: 'k3', type: 'choice', label: 'Biggest concern about smart devices?', options: ['Privacy', 'Cost', 'Reliability', 'Complexity'] },
      { id: 'k4', type: 'text', label: 'What smart product do you want but do not have yet?' },
    ],
  },
  {
    slug: 'seed-life-work-life-balance',
    title: 'Work–Life Balance & Boundaries',
    desc: 'Help us understand how you separate work from personal time.',
    reward: 475,
    mins: 22,
    cat: 'Lifestyle',
    tier: 'platinum',
    prefix: 'Work-life',
    letter: 'l',
    first: [
      { id: 'l1', type: 'choice', label: 'Typical weekly work hours?', options: ['Under 35', '35–45', '45–55', '55+'] },
      { id: 'l2', type: 'choice', label: 'Check work messages after hours?', options: ['Never', 'Rarely', 'Often', 'Constantly'] },
      { id: 'l3', type: 'choice', label: 'Employer supports flexibility?', options: ['Strongly yes', 'Somewhat', 'Not really'] },
      { id: 'l4', type: 'text', label: 'One boundary you wish you could enforce better?' },
    ],
  },
  {
    slug: 'seed-finance-investing-comfort',
    title: 'Investing Comfort & Risk',
    desc: 'Anonymous insights on how people approach investing today.',
    reward: 320,
    mins: 18,
    cat: 'Finance',
    tier: 'silver',
    prefix: 'Investing',
    letter: 'm',
    first: [
      { id: 'm1', type: 'choice', label: 'Do you invest outside a retirement account?', options: ['Yes', 'Planning to', 'No'] },
      { id: 'm2', type: 'choice', label: 'Comfort with stock market volatility?', options: ['Very', 'Somewhat', 'Uncomfortable'] },
      { id: 'm3', type: 'choice', label: 'Primary information source?', options: ['Advisor', 'News', 'Social media', 'Friends'] },
      { id: 'm4', type: 'text', label: 'What would make you start or invest more?' },
    ],
  },
  {
    slug: 'seed-health-nutrition-labels',
    title: 'Nutrition Labels & Food Choices',
    desc: 'Tell us how you read packaging and choose groceries.',
    reward: 360,
    mins: 18,
    cat: 'Health',
    tier: 'gold',
    prefix: 'Nutrition',
    letter: 'n',
    first: [
      { id: 'n1', type: 'choice', label: 'How often do you read nutrition labels?', options: ['Always', 'Often', 'Sometimes', 'Rarely'] },
      { id: 'n2', type: 'choice', label: 'Top label concern?', options: ['Sugar', 'Calories', 'Protein', 'Ingredients length', 'Allergens'] },
      { id: 'n3', type: 'choice', label: 'Who shops for groceries most?', options: ['Me', 'Partner', 'Shared', 'Someone else'] },
      { id: 'n4', type: 'text', label: 'What label claim do you trust least?' },
    ],
  },
  {
    slug: 'seed-food-cooking-at-home',
    title: 'Cooking at Home & Meal Planning',
    desc: 'We want to know how you plan meals and what tools you use.',
    reward: 425,
    mins: 20,
    cat: 'Food & Beverages',
    tier: 'platinum',
    prefix: 'Home cooking',
    letter: 'o',
    first: [
      { id: 'o1', type: 'choice', label: 'How many home-cooked dinners per week?', options: ['0–2', '3–5', '6–7'] },
      { id: 'o2', type: 'choice', label: 'Use meal kits or delivery ingredients?', options: ['Weekly', 'Sometimes', 'Never'] },
      { id: 'o3', type: 'choice', label: 'Biggest cooking pain?', options: ['Time', 'Ideas', 'Skill', 'Cleanup'] },
      { id: 'o4', type: 'text', label: 'Your go-to weeknight recipe in one sentence?' },
    ],
  },
  {
    slug: 'seed-travel-loyalty-programs',
    title: 'Travel Loyalty & Rewards Programs',
    desc: 'Share how you use points, miles, and hotel status.',
    reward: 310,
    mins: 18,
    cat: 'Travel',
    tier: 'silver',
    prefix: 'Travel rewards',
    letter: 'p',
    first: [
      { id: 'p1', type: 'choice', label: 'Do you belong to airline or hotel programs?', options: ['Several', 'One', 'None'] },
      { id: 'p2', type: 'choice', label: 'Redeem rewards mostly for?', options: ['Flights', 'Hotels', 'Upgrades', 'Never redeemed'] },
      { id: 'p3', type: 'choice', label: 'Worth switching brands for bonus points?', options: ['Yes', 'Sometimes', 'No'] },
      { id: 'p4', type: 'text', label: 'Best loyalty perk you have received?' },
    ],
  },
  {
    slug: 'seed-edu-career-skills',
    title: 'Career Skills & Professional Growth',
    desc: 'Tell us which workplace skills matter most for the next few years.',
    reward: 370,
    mins: 20,
    cat: 'Education',
    tier: 'gold',
    prefix: 'Career skills',
    letter: 'r',
    first: [
      { id: 'r1', type: 'choice', label: 'Industry?', options: ['Tech', 'Healthcare', 'Retail', 'Finance', 'Education', 'Other'] },
      { id: 'r2', type: 'choice', label: 'Skill you are actively improving?', options: ['Leadership', 'Communication', 'Data', 'Coding', 'Creativity'] },
      { id: 'r3', type: 'choice', label: 'Employer-paid training in last 12 months?', options: ['Yes', 'No', 'N/A'] },
      { id: 'r4', type: 'text', label: 'One certification or course on your wish list?' },
    ],
  },
  {
    slug: 'seed-env-energy-at-home',
    title: 'Home Energy & Utilities',
    desc: 'Understanding how households think about electricity and heating.',
    reward: 460,
    mins: 22,
    cat: 'Environment',
    tier: 'platinum',
    prefix: 'Home energy',
    letter: 's',
    first: [
      { id: 's1', type: 'choice', label: 'Home type?', options: ['Apartment', 'House', 'Other'] },
      { id: 's2', type: 'choice', label: 'Considered solar or battery storage?', options: ['Already have', 'Researching', 'Too expensive', 'Not interested'] },
      { id: 's3', type: 'choice', label: 'Thermostat habits?', options: ['Fixed schedule', 'Manual tweaks', 'Smart thermostat', 'Do not think about it'] },
      { id: 's4', type: 'text', label: 'What would lower your energy bill the most?' },
    ],
  },
  {
    slug: 'seed-media-gaming-habits',
    title: 'Gaming Platforms & Play Time',
    desc: 'Quick study on how adults fit gaming into their schedules.',
    reward: 345,
    mins: 18,
    cat: 'Media',
    tier: 'silver',
    prefix: 'Gaming',
    letter: 't',
    first: [
      { id: 't1', type: 'choice', label: 'Play video games?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely / never'] },
      { id: 't2', type: 'choice', label: 'Primary platform?', options: ['PC', 'Console', 'Mobile', 'Cloud / other'] },
      { id: 't3', type: 'choice', label: 'Spend on in-game purchases?', options: ['Never', 'Under $10/mo', '$10–50/mo', '$50+/mo'] },
      { id: 't4', type: 'text', label: 'Game you have sunk the most hours into lately?' },
    ],
  },
  {
    slug: 'seed-auto-future-mobility',
    title: 'Future of Mobility & Cities',
    desc: 'Opinions on EVs, public transit, and how cities should evolve.',
    reward: 390,
    mins: 20,
    cat: 'Automotive',
    tier: 'gold',
    prefix: 'Urban mobility',
    letter: 'u',
    first: [
      { id: 'u1', type: 'choice', label: 'Primary commute today?', options: ['Car', 'Transit', 'Bike / walk', 'Remote', 'Mix'] },
      { id: 'u2', type: 'choice', label: 'EV for next vehicle?', options: ['Definitely considering', 'Maybe', 'Prefer gas', 'Unsure'] },
      { id: 'u3', type: 'choice', label: 'Support more bike lanes in your area?', options: ['Strongly', 'Somewhat', 'Neutral', 'Oppose'] },
      { id: 'u4', type: 'text', label: 'One transport upgrade you want in your city?' },
    ],
  },
]

function toJsonBlock(questions) {
  const lines = questions.map((q) => '  ' + JSON.stringify(q))
  return '[\n' + lines.join(',\n') + '\n]'
}

let out = `-- Seed 20 surveys: mixed content categories (all 10 represented twice) and mixed tiers (Silver / Gold / Platinum).
-- Each survey has exactly 30 questions (4 intro + 24 Likert items + 2 open text).

`

for (const s of surveys) {
  const letter = s.letter
  const mid24 = extra24(s.prefix, letter)
  const lastTwo = [
    {
      id: `${letter}29`,
      type: 'text',
      label: `(${s.prefix}) Summarize the biggest challenge you face in this topic in one or two sentences.`,
    },
    {
      id: `${letter}30`,
      type: 'text',
      label: `(${s.prefix}) What is one change you would like to see from brands or services in this area?`,
    },
  ]
  const allQ = [...s.first, ...mid24, ...lastTwo]
  if (allQ.length !== 30) throw new Error(s.slug + ' len ' + allQ.length)

  out += `insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  '${s.slug}',
  '${s.title.replace(/'/g, "''")}',
  '${s.desc.replace(/'/g, "''")}',
  ${s.reward},
  ${s.mins},
  $q$
`
  out += toJsonBlock(allQ)
  out += `
$q$::jsonb,
  true,
  '${s.cat}',
  pc.id
from public.payment_categories pc
where pc.slug = '${s.tier}'
limit 1
on conflict (slug) do nothing;

`
}

process.stdout.write(out)

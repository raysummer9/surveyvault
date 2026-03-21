-- Seed 20 surveys: mixed content categories (all 10 represented twice) and mixed tiers (Silver / Gold / Platinum).
-- Each survey has exactly 30 questions (4 intro + 24 Likert items + 2 open text).

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-tech-screen-balance',
  'Digital Wellness & Screen Time',
  'Share how you use devices day to day and what helps you stay balanced.',
  325,
  18,
  $q$
[
  {"id":"a1","type":"choice","label":"Roughly how many hours of screen time do you have on a typical weekday?","options":["Under 2h","2–4h","4–6h","6h+"]},
  {"id":"a2","type":"choice","label":"What do you use most in the evening?","options":["Phone","Laptop or PC","Tablet","TV / streaming"]},
  {"id":"a3","type":"choice","label":"Do you use app limits or focus modes?","options":["Yes, daily","Sometimes","No"]},
  {"id":"a4","type":"text","label":"What one habit would most improve your digital wellness?"},
  {"id":"a5","type":"choice","label":"(Digital wellness) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a6","type":"choice","label":"(Digital wellness) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a7","type":"choice","label":"(Digital wellness) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a8","type":"choice","label":"(Digital wellness) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a9","type":"choice","label":"(Digital wellness) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a10","type":"choice","label":"(Digital wellness) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a11","type":"choice","label":"(Digital wellness) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a12","type":"choice","label":"(Digital wellness) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a13","type":"choice","label":"(Digital wellness) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a14","type":"choice","label":"(Digital wellness) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a15","type":"choice","label":"(Digital wellness) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a16","type":"choice","label":"(Digital wellness) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a17","type":"choice","label":"(Digital wellness) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a18","type":"choice","label":"(Digital wellness) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a19","type":"choice","label":"(Digital wellness) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a20","type":"choice","label":"(Digital wellness) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a21","type":"choice","label":"(Digital wellness) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a22","type":"choice","label":"(Digital wellness) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a23","type":"choice","label":"(Digital wellness) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a24","type":"choice","label":"(Digital wellness) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a25","type":"choice","label":"(Digital wellness) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a26","type":"choice","label":"(Digital wellness) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a27","type":"choice","label":"(Digital wellness) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a28","type":"choice","label":"(Digital wellness) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"a29","type":"text","label":"(Digital wellness) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"a30","type":"text","label":"(Digital wellness) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Technology',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-life-morning-routine',
  'Morning Routines & Energy',
  'Tell us how you start the day and what boosts your energy.',
  375,
  18,
  $q$
[
  {"id":"b1","type":"choice","label":"What time do you usually wake up on weekdays?","options":["Before 6","6–7","7–8","After 8"]},
  {"id":"b2","type":"choice","label":"First thing you do after waking?","options":["Phone","Coffee or tea","Exercise","Shower","Other"]},
  {"id":"b3","type":"choice","label":"How consistent is your routine?","options":["Very","Somewhat","Not really"]},
  {"id":"b4","type":"text","label":"What would make your mornings easier?"},
  {"id":"b5","type":"choice","label":"(Morning routines) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b6","type":"choice","label":"(Morning routines) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b7","type":"choice","label":"(Morning routines) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b8","type":"choice","label":"(Morning routines) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b9","type":"choice","label":"(Morning routines) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b10","type":"choice","label":"(Morning routines) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b11","type":"choice","label":"(Morning routines) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b12","type":"choice","label":"(Morning routines) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b13","type":"choice","label":"(Morning routines) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b14","type":"choice","label":"(Morning routines) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b15","type":"choice","label":"(Morning routines) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b16","type":"choice","label":"(Morning routines) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b17","type":"choice","label":"(Morning routines) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b18","type":"choice","label":"(Morning routines) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b19","type":"choice","label":"(Morning routines) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b20","type":"choice","label":"(Morning routines) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b21","type":"choice","label":"(Morning routines) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b22","type":"choice","label":"(Morning routines) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b23","type":"choice","label":"(Morning routines) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b24","type":"choice","label":"(Morning routines) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b25","type":"choice","label":"(Morning routines) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b26","type":"choice","label":"(Morning routines) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b27","type":"choice","label":"(Morning routines) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b28","type":"choice","label":"(Morning routines) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"b29","type":"text","label":"(Morning routines) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"b30","type":"text","label":"(Morning routines) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Lifestyle',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-finance-saving-habits',
  'Saving & Spending Patterns',
  'We are studying how people plan savings and handle unexpected expenses.',
  450,
  20,
  $q$
[
  {"id":"c1","type":"choice","label":"How do you primarily track spending?","options":["App or spreadsheet","Bank alerts","Mental estimate","I do not track"]},
  {"id":"c2","type":"choice","label":"Emergency fund status?","options":["3+ months expenses","1–3 months","Under one month","None yet"]},
  {"id":"c3","type":"choice","label":"Biggest financial stress?","options":["Rent or mortgage","Debt","Income stability","Investments","Other"]},
  {"id":"c4","type":"text","label":"What financial topic do you wish you learned earlier?"},
  {"id":"c5","type":"choice","label":"(Personal finance) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c6","type":"choice","label":"(Personal finance) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c7","type":"choice","label":"(Personal finance) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c8","type":"choice","label":"(Personal finance) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c9","type":"choice","label":"(Personal finance) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c10","type":"choice","label":"(Personal finance) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c11","type":"choice","label":"(Personal finance) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c12","type":"choice","label":"(Personal finance) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c13","type":"choice","label":"(Personal finance) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c14","type":"choice","label":"(Personal finance) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c15","type":"choice","label":"(Personal finance) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c16","type":"choice","label":"(Personal finance) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c17","type":"choice","label":"(Personal finance) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c18","type":"choice","label":"(Personal finance) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c19","type":"choice","label":"(Personal finance) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c20","type":"choice","label":"(Personal finance) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c21","type":"choice","label":"(Personal finance) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c22","type":"choice","label":"(Personal finance) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c23","type":"choice","label":"(Personal finance) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c24","type":"choice","label":"(Personal finance) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c25","type":"choice","label":"(Personal finance) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c26","type":"choice","label":"(Personal finance) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c27","type":"choice","label":"(Personal finance) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c28","type":"choice","label":"(Personal finance) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"c29","type":"text","label":"(Personal finance) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"c30","type":"text","label":"(Personal finance) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Finance',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-health-fitness-goals',
  'Fitness Goals & Movement',
  'Your input helps shape wellness programs for busy people.',
  300,
  18,
  $q$
[
  {"id":"d1","type":"choice","label":"How often do you exercise?","options":["Daily","3–5x / week","1–2x / week","Rarely"]},
  {"id":"d2","type":"choice","label":"Preferred activity?","options":["Gym","Running / walking","Classes","Home workout","Sports"]},
  {"id":"d3","type":"choice","label":"Biggest barrier to consistency?","options":["Time","Motivation","Access","Injury","Other"]},
  {"id":"d4","type":"text","label":"What would help you move more each week?"},
  {"id":"d5","type":"choice","label":"(Fitness) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d6","type":"choice","label":"(Fitness) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d7","type":"choice","label":"(Fitness) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d8","type":"choice","label":"(Fitness) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d9","type":"choice","label":"(Fitness) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d10","type":"choice","label":"(Fitness) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d11","type":"choice","label":"(Fitness) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d12","type":"choice","label":"(Fitness) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d13","type":"choice","label":"(Fitness) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d14","type":"choice","label":"(Fitness) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d15","type":"choice","label":"(Fitness) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d16","type":"choice","label":"(Fitness) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d17","type":"choice","label":"(Fitness) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d18","type":"choice","label":"(Fitness) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d19","type":"choice","label":"(Fitness) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d20","type":"choice","label":"(Fitness) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d21","type":"choice","label":"(Fitness) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d22","type":"choice","label":"(Fitness) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d23","type":"choice","label":"(Fitness) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d24","type":"choice","label":"(Fitness) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d25","type":"choice","label":"(Fitness) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d26","type":"choice","label":"(Fitness) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d27","type":"choice","label":"(Fitness) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d28","type":"choice","label":"(Fitness) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"d29","type":"text","label":"(Fitness) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"d30","type":"text","label":"(Fitness) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Health',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-food-dining-out',
  'Dining Out & Food Discovery',
  'Tell us how you choose restaurants and try new cuisines.',
  340,
  18,
  $q$
[
  {"id":"e1","type":"choice","label":"How often do you eat out or order in?","options":["Daily","Several times a week","Weekly","Rarely"]},
  {"id":"e2","type":"choice","label":"What drives your choice most?","options":["Price","Reviews","Location","Cuisine type","Friends"]},
  {"id":"e3","type":"choice","label":"Dietary preference?","options":["No restriction","Vegetarian","Vegan","Keto / low-carb","Allergies"]},
  {"id":"e4","type":"text","label":"Describe a memorable meal from the last month."},
  {"id":"e5","type":"choice","label":"(Dining) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e6","type":"choice","label":"(Dining) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e7","type":"choice","label":"(Dining) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e8","type":"choice","label":"(Dining) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e9","type":"choice","label":"(Dining) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e10","type":"choice","label":"(Dining) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e11","type":"choice","label":"(Dining) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e12","type":"choice","label":"(Dining) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e13","type":"choice","label":"(Dining) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e14","type":"choice","label":"(Dining) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e15","type":"choice","label":"(Dining) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e16","type":"choice","label":"(Dining) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e17","type":"choice","label":"(Dining) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e18","type":"choice","label":"(Dining) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e19","type":"choice","label":"(Dining) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e20","type":"choice","label":"(Dining) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e21","type":"choice","label":"(Dining) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e22","type":"choice","label":"(Dining) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e23","type":"choice","label":"(Dining) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e24","type":"choice","label":"(Dining) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e25","type":"choice","label":"(Dining) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e26","type":"choice","label":"(Dining) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e27","type":"choice","label":"(Dining) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e28","type":"choice","label":"(Dining) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"e29","type":"text","label":"(Dining) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"e30","type":"text","label":"(Dining) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Food & Beverages',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-travel-weekend-trips',
  'Weekend Getaways & Short Trips',
  'We want to learn how you plan short breaks and what you value on the road.',
  420,
  20,
  $q$
[
  {"id":"f1","type":"choice","label":"How many weekend trips do you take per year?","options":["0","1–3","4–6","7+"]},
  {"id":"f2","type":"choice","label":"Typical transport?","options":["Car","Plane","Train","Bus"]},
  {"id":"f3","type":"choice","label":"Accommodation style?","options":["Hotel","Rental home","Hostel","Stay with friends"]},
  {"id":"f4","type":"text","label":"Favorite weekend destination type and why?"},
  {"id":"f5","type":"choice","label":"(Short trips) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f6","type":"choice","label":"(Short trips) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f7","type":"choice","label":"(Short trips) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f8","type":"choice","label":"(Short trips) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f9","type":"choice","label":"(Short trips) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f10","type":"choice","label":"(Short trips) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f11","type":"choice","label":"(Short trips) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f12","type":"choice","label":"(Short trips) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f13","type":"choice","label":"(Short trips) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f14","type":"choice","label":"(Short trips) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f15","type":"choice","label":"(Short trips) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f16","type":"choice","label":"(Short trips) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f17","type":"choice","label":"(Short trips) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f18","type":"choice","label":"(Short trips) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f19","type":"choice","label":"(Short trips) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f20","type":"choice","label":"(Short trips) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f21","type":"choice","label":"(Short trips) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f22","type":"choice","label":"(Short trips) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f23","type":"choice","label":"(Short trips) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f24","type":"choice","label":"(Short trips) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f25","type":"choice","label":"(Short trips) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f26","type":"choice","label":"(Short trips) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f27","type":"choice","label":"(Short trips) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f28","type":"choice","label":"(Short trips) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"f29","type":"text","label":"(Short trips) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"f30","type":"text","label":"(Short trips) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Travel',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-edu-online-learning',
  'Online Learning & Upskilling',
  'Share how you learn new skills outside of formal school.',
  315,
  18,
  $q$
[
  {"id":"g1","type":"choice","label":"Used an online course in the last year?","options":["Yes, finished","Yes, in progress","No"]},
  {"id":"g2","type":"choice","label":"Preferred format?","options":["Video","Reading","Live sessions","Projects"]},
  {"id":"g3","type":"choice","label":"Topic you study most?","options":["Career","Language","Creative","Tech","Other"]},
  {"id":"g4","type":"text","label":"What platform or course would you recommend?"},
  {"id":"g5","type":"choice","label":"(Learning) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g6","type":"choice","label":"(Learning) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g7","type":"choice","label":"(Learning) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g8","type":"choice","label":"(Learning) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g9","type":"choice","label":"(Learning) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g10","type":"choice","label":"(Learning) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g11","type":"choice","label":"(Learning) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g12","type":"choice","label":"(Learning) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g13","type":"choice","label":"(Learning) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g14","type":"choice","label":"(Learning) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g15","type":"choice","label":"(Learning) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g16","type":"choice","label":"(Learning) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g17","type":"choice","label":"(Learning) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g18","type":"choice","label":"(Learning) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g19","type":"choice","label":"(Learning) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g20","type":"choice","label":"(Learning) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g21","type":"choice","label":"(Learning) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g22","type":"choice","label":"(Learning) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g23","type":"choice","label":"(Learning) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g24","type":"choice","label":"(Learning) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g25","type":"choice","label":"(Learning) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g26","type":"choice","label":"(Learning) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g27","type":"choice","label":"(Learning) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g28","type":"choice","label":"(Learning) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"g29","type":"text","label":"(Learning) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"g30","type":"text","label":"(Learning) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Education',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-env-sustainable-choices',
  'Sustainable Everyday Choices',
  'Help brands understand which eco actions feel realistic for you.',
  385,
  18,
  $q$
[
  {"id":"h1","type":"choice","label":"How often do you avoid single-use plastic?","options":["Always","Often","Sometimes","Rarely"]},
  {"id":"h2","type":"choice","label":"Biggest motivator for green habits?","options":["Cost","Health","Ethics","Regulation","Community"]},
  {"id":"h3","type":"choice","label":"Would you pay more for sustainable packaging?","options":["Yes","Depends","No"]},
  {"id":"h4","type":"text","label":"One change you wish your city made for the environment?"},
  {"id":"h5","type":"choice","label":"(Sustainability) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h6","type":"choice","label":"(Sustainability) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h7","type":"choice","label":"(Sustainability) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h8","type":"choice","label":"(Sustainability) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h9","type":"choice","label":"(Sustainability) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h10","type":"choice","label":"(Sustainability) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h11","type":"choice","label":"(Sustainability) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h12","type":"choice","label":"(Sustainability) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h13","type":"choice","label":"(Sustainability) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h14","type":"choice","label":"(Sustainability) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h15","type":"choice","label":"(Sustainability) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h16","type":"choice","label":"(Sustainability) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h17","type":"choice","label":"(Sustainability) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h18","type":"choice","label":"(Sustainability) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h19","type":"choice","label":"(Sustainability) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h20","type":"choice","label":"(Sustainability) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h21","type":"choice","label":"(Sustainability) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h22","type":"choice","label":"(Sustainability) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h23","type":"choice","label":"(Sustainability) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h24","type":"choice","label":"(Sustainability) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h25","type":"choice","label":"(Sustainability) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h26","type":"choice","label":"(Sustainability) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h27","type":"choice","label":"(Sustainability) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h28","type":"choice","label":"(Sustainability) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"h29","type":"text","label":"(Sustainability) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"h30","type":"text","label":"(Sustainability) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Environment',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-media-podcast-tv',
  'Podcasts, TV & Streaming Habits',
  'Tell us what you watch and listen to—and when.',
  400,
  20,
  $q$
[
  {"id":"i1","type":"choice","label":"Primary streaming subscriptions?","options":["0–1","2–3","4+"]},
  {"id":"i2","type":"choice","label":"Podcasts: how often?","options":["Daily","Weekly","Rarely","Never"]},
  {"id":"i3","type":"choice","label":"Preferred genre lately?","options":["News","Comedy","True crime","Education","Fiction"]},
  {"id":"i4","type":"text","label":"What show or podcast should everyone try?"},
  {"id":"i5","type":"choice","label":"(Media habits) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i6","type":"choice","label":"(Media habits) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i7","type":"choice","label":"(Media habits) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i8","type":"choice","label":"(Media habits) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i9","type":"choice","label":"(Media habits) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i10","type":"choice","label":"(Media habits) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i11","type":"choice","label":"(Media habits) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i12","type":"choice","label":"(Media habits) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i13","type":"choice","label":"(Media habits) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i14","type":"choice","label":"(Media habits) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i15","type":"choice","label":"(Media habits) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i16","type":"choice","label":"(Media habits) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i17","type":"choice","label":"(Media habits) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i18","type":"choice","label":"(Media habits) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i19","type":"choice","label":"(Media habits) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i20","type":"choice","label":"(Media habits) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i21","type":"choice","label":"(Media habits) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i22","type":"choice","label":"(Media habits) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i23","type":"choice","label":"(Media habits) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i24","type":"choice","label":"(Media habits) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i25","type":"choice","label":"(Media habits) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i26","type":"choice","label":"(Media habits) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i27","type":"choice","label":"(Media habits) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i28","type":"choice","label":"(Media habits) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"i29","type":"text","label":"(Media habits) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"i30","type":"text","label":"(Media habits) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Media',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-auto-car-shopping',
  'Car Shopping & Ownership',
  'We are researching how people research and buy vehicles.',
  330,
  18,
  $q$
[
  {"id":"j1","type":"choice","label":"Own or lease a vehicle today?","options":["Own","Lease","Neither"]},
  {"id":"j2","type":"choice","label":"Next purchase likely to be?","options":["New ICE","Used ICE","Hybrid","EV","Unsure"]},
  {"id":"j3","type":"choice","label":"Top research source?","options":["Dealer visits","Online reviews","YouTube","Friends"]},
  {"id":"j4","type":"text","label":"What would make buying a car less stressful?"},
  {"id":"j5","type":"choice","label":"(Automotive) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j6","type":"choice","label":"(Automotive) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j7","type":"choice","label":"(Automotive) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j8","type":"choice","label":"(Automotive) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j9","type":"choice","label":"(Automotive) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j10","type":"choice","label":"(Automotive) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j11","type":"choice","label":"(Automotive) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j12","type":"choice","label":"(Automotive) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j13","type":"choice","label":"(Automotive) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j14","type":"choice","label":"(Automotive) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j15","type":"choice","label":"(Automotive) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j16","type":"choice","label":"(Automotive) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j17","type":"choice","label":"(Automotive) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j18","type":"choice","label":"(Automotive) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j19","type":"choice","label":"(Automotive) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j20","type":"choice","label":"(Automotive) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j21","type":"choice","label":"(Automotive) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j22","type":"choice","label":"(Automotive) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j23","type":"choice","label":"(Automotive) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j24","type":"choice","label":"(Automotive) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j25","type":"choice","label":"(Automotive) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j26","type":"choice","label":"(Automotive) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j27","type":"choice","label":"(Automotive) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j28","type":"choice","label":"(Automotive) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"j29","type":"text","label":"(Automotive) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"j30","type":"text","label":"(Automotive) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Automotive',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-tech-smart-home',
  'Smart Home & Connected Devices',
  'Share how connected devices fit into your home life.',
  395,
  20,
  $q$
[
  {"id":"k1","type":"choice","label":"How many smart devices in your home?","options":["0","1–3","4–7","8+"]},
  {"id":"k2","type":"choice","label":"Voice assistant usage?","options":["Daily","Sometimes","Tried once","None"]},
  {"id":"k3","type":"choice","label":"Biggest concern about smart devices?","options":["Privacy","Cost","Reliability","Complexity"]},
  {"id":"k4","type":"text","label":"What smart product do you want but do not have yet?"},
  {"id":"k5","type":"choice","label":"(Smart home) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k6","type":"choice","label":"(Smart home) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k7","type":"choice","label":"(Smart home) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k8","type":"choice","label":"(Smart home) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k9","type":"choice","label":"(Smart home) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k10","type":"choice","label":"(Smart home) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k11","type":"choice","label":"(Smart home) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k12","type":"choice","label":"(Smart home) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k13","type":"choice","label":"(Smart home) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k14","type":"choice","label":"(Smart home) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k15","type":"choice","label":"(Smart home) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k16","type":"choice","label":"(Smart home) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k17","type":"choice","label":"(Smart home) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k18","type":"choice","label":"(Smart home) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k19","type":"choice","label":"(Smart home) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k20","type":"choice","label":"(Smart home) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k21","type":"choice","label":"(Smart home) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k22","type":"choice","label":"(Smart home) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k23","type":"choice","label":"(Smart home) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k24","type":"choice","label":"(Smart home) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k25","type":"choice","label":"(Smart home) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k26","type":"choice","label":"(Smart home) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k27","type":"choice","label":"(Smart home) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k28","type":"choice","label":"(Smart home) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"k29","type":"text","label":"(Smart home) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"k30","type":"text","label":"(Smart home) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Technology',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-life-work-life-balance',
  'Work–Life Balance & Boundaries',
  'Help us understand how you separate work from personal time.',
  475,
  22,
  $q$
[
  {"id":"l1","type":"choice","label":"Typical weekly work hours?","options":["Under 35","35–45","45–55","55+"]},
  {"id":"l2","type":"choice","label":"Check work messages after hours?","options":["Never","Rarely","Often","Constantly"]},
  {"id":"l3","type":"choice","label":"Employer supports flexibility?","options":["Strongly yes","Somewhat","Not really"]},
  {"id":"l4","type":"text","label":"One boundary you wish you could enforce better?"},
  {"id":"l5","type":"choice","label":"(Work-life) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l6","type":"choice","label":"(Work-life) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l7","type":"choice","label":"(Work-life) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l8","type":"choice","label":"(Work-life) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l9","type":"choice","label":"(Work-life) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l10","type":"choice","label":"(Work-life) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l11","type":"choice","label":"(Work-life) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l12","type":"choice","label":"(Work-life) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l13","type":"choice","label":"(Work-life) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l14","type":"choice","label":"(Work-life) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l15","type":"choice","label":"(Work-life) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l16","type":"choice","label":"(Work-life) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l17","type":"choice","label":"(Work-life) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l18","type":"choice","label":"(Work-life) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l19","type":"choice","label":"(Work-life) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l20","type":"choice","label":"(Work-life) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l21","type":"choice","label":"(Work-life) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l22","type":"choice","label":"(Work-life) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l23","type":"choice","label":"(Work-life) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l24","type":"choice","label":"(Work-life) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l25","type":"choice","label":"(Work-life) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l26","type":"choice","label":"(Work-life) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l27","type":"choice","label":"(Work-life) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l28","type":"choice","label":"(Work-life) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"l29","type":"text","label":"(Work-life) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"l30","type":"text","label":"(Work-life) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Lifestyle',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-finance-investing-comfort',
  'Investing Comfort & Risk',
  'Anonymous insights on how people approach investing today.',
  320,
  18,
  $q$
[
  {"id":"m1","type":"choice","label":"Do you invest outside a retirement account?","options":["Yes","Planning to","No"]},
  {"id":"m2","type":"choice","label":"Comfort with stock market volatility?","options":["Very","Somewhat","Uncomfortable"]},
  {"id":"m3","type":"choice","label":"Primary information source?","options":["Advisor","News","Social media","Friends"]},
  {"id":"m4","type":"text","label":"What would make you start or invest more?"},
  {"id":"m5","type":"choice","label":"(Investing) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m6","type":"choice","label":"(Investing) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m7","type":"choice","label":"(Investing) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m8","type":"choice","label":"(Investing) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m9","type":"choice","label":"(Investing) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m10","type":"choice","label":"(Investing) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m11","type":"choice","label":"(Investing) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m12","type":"choice","label":"(Investing) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m13","type":"choice","label":"(Investing) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m14","type":"choice","label":"(Investing) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m15","type":"choice","label":"(Investing) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m16","type":"choice","label":"(Investing) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m17","type":"choice","label":"(Investing) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m18","type":"choice","label":"(Investing) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m19","type":"choice","label":"(Investing) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m20","type":"choice","label":"(Investing) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m21","type":"choice","label":"(Investing) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m22","type":"choice","label":"(Investing) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m23","type":"choice","label":"(Investing) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m24","type":"choice","label":"(Investing) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m25","type":"choice","label":"(Investing) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m26","type":"choice","label":"(Investing) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m27","type":"choice","label":"(Investing) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m28","type":"choice","label":"(Investing) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"m29","type":"text","label":"(Investing) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"m30","type":"text","label":"(Investing) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Finance',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-health-nutrition-labels',
  'Nutrition Labels & Food Choices',
  'Tell us how you read packaging and choose groceries.',
  360,
  18,
  $q$
[
  {"id":"n1","type":"choice","label":"How often do you read nutrition labels?","options":["Always","Often","Sometimes","Rarely"]},
  {"id":"n2","type":"choice","label":"Top label concern?","options":["Sugar","Calories","Protein","Ingredients length","Allergens"]},
  {"id":"n3","type":"choice","label":"Who shops for groceries most?","options":["Me","Partner","Shared","Someone else"]},
  {"id":"n4","type":"text","label":"What label claim do you trust least?"},
  {"id":"n5","type":"choice","label":"(Nutrition) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n6","type":"choice","label":"(Nutrition) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n7","type":"choice","label":"(Nutrition) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n8","type":"choice","label":"(Nutrition) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n9","type":"choice","label":"(Nutrition) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n10","type":"choice","label":"(Nutrition) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n11","type":"choice","label":"(Nutrition) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n12","type":"choice","label":"(Nutrition) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n13","type":"choice","label":"(Nutrition) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n14","type":"choice","label":"(Nutrition) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n15","type":"choice","label":"(Nutrition) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n16","type":"choice","label":"(Nutrition) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n17","type":"choice","label":"(Nutrition) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n18","type":"choice","label":"(Nutrition) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n19","type":"choice","label":"(Nutrition) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n20","type":"choice","label":"(Nutrition) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n21","type":"choice","label":"(Nutrition) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n22","type":"choice","label":"(Nutrition) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n23","type":"choice","label":"(Nutrition) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n24","type":"choice","label":"(Nutrition) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n25","type":"choice","label":"(Nutrition) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n26","type":"choice","label":"(Nutrition) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n27","type":"choice","label":"(Nutrition) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n28","type":"choice","label":"(Nutrition) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"n29","type":"text","label":"(Nutrition) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"n30","type":"text","label":"(Nutrition) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Health',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-food-cooking-at-home',
  'Cooking at Home & Meal Planning',
  'We want to know how you plan meals and what tools you use.',
  425,
  20,
  $q$
[
  {"id":"o1","type":"choice","label":"How many home-cooked dinners per week?","options":["0–2","3–5","6–7"]},
  {"id":"o2","type":"choice","label":"Use meal kits or delivery ingredients?","options":["Weekly","Sometimes","Never"]},
  {"id":"o3","type":"choice","label":"Biggest cooking pain?","options":["Time","Ideas","Skill","Cleanup"]},
  {"id":"o4","type":"text","label":"Your go-to weeknight recipe in one sentence?"},
  {"id":"o5","type":"choice","label":"(Home cooking) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o6","type":"choice","label":"(Home cooking) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o7","type":"choice","label":"(Home cooking) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o8","type":"choice","label":"(Home cooking) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o9","type":"choice","label":"(Home cooking) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o10","type":"choice","label":"(Home cooking) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o11","type":"choice","label":"(Home cooking) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o12","type":"choice","label":"(Home cooking) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o13","type":"choice","label":"(Home cooking) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o14","type":"choice","label":"(Home cooking) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o15","type":"choice","label":"(Home cooking) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o16","type":"choice","label":"(Home cooking) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o17","type":"choice","label":"(Home cooking) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o18","type":"choice","label":"(Home cooking) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o19","type":"choice","label":"(Home cooking) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o20","type":"choice","label":"(Home cooking) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o21","type":"choice","label":"(Home cooking) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o22","type":"choice","label":"(Home cooking) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o23","type":"choice","label":"(Home cooking) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o24","type":"choice","label":"(Home cooking) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o25","type":"choice","label":"(Home cooking) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o26","type":"choice","label":"(Home cooking) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o27","type":"choice","label":"(Home cooking) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o28","type":"choice","label":"(Home cooking) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"o29","type":"text","label":"(Home cooking) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"o30","type":"text","label":"(Home cooking) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Food & Beverages',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-travel-loyalty-programs',
  'Travel Loyalty & Rewards Programs',
  'Share how you use points, miles, and hotel status.',
  310,
  18,
  $q$
[
  {"id":"p1","type":"choice","label":"Do you belong to airline or hotel programs?","options":["Several","One","None"]},
  {"id":"p2","type":"choice","label":"Redeem rewards mostly for?","options":["Flights","Hotels","Upgrades","Never redeemed"]},
  {"id":"p3","type":"choice","label":"Worth switching brands for bonus points?","options":["Yes","Sometimes","No"]},
  {"id":"p4","type":"text","label":"Best loyalty perk you have received?"},
  {"id":"p5","type":"choice","label":"(Travel rewards) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p6","type":"choice","label":"(Travel rewards) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p7","type":"choice","label":"(Travel rewards) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p8","type":"choice","label":"(Travel rewards) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p9","type":"choice","label":"(Travel rewards) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p10","type":"choice","label":"(Travel rewards) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p11","type":"choice","label":"(Travel rewards) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p12","type":"choice","label":"(Travel rewards) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p13","type":"choice","label":"(Travel rewards) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p14","type":"choice","label":"(Travel rewards) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p15","type":"choice","label":"(Travel rewards) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p16","type":"choice","label":"(Travel rewards) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p17","type":"choice","label":"(Travel rewards) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p18","type":"choice","label":"(Travel rewards) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p19","type":"choice","label":"(Travel rewards) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p20","type":"choice","label":"(Travel rewards) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p21","type":"choice","label":"(Travel rewards) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p22","type":"choice","label":"(Travel rewards) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p23","type":"choice","label":"(Travel rewards) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p24","type":"choice","label":"(Travel rewards) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p25","type":"choice","label":"(Travel rewards) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p26","type":"choice","label":"(Travel rewards) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p27","type":"choice","label":"(Travel rewards) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p28","type":"choice","label":"(Travel rewards) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"p29","type":"text","label":"(Travel rewards) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"p30","type":"text","label":"(Travel rewards) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Travel',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-edu-career-skills',
  'Career Skills & Professional Growth',
  'Tell us which workplace skills matter most for the next few years.',
  370,
  20,
  $q$
[
  {"id":"r1","type":"choice","label":"Industry?","options":["Tech","Healthcare","Retail","Finance","Education","Other"]},
  {"id":"r2","type":"choice","label":"Skill you are actively improving?","options":["Leadership","Communication","Data","Coding","Creativity"]},
  {"id":"r3","type":"choice","label":"Employer-paid training in last 12 months?","options":["Yes","No","N/A"]},
  {"id":"r4","type":"text","label":"One certification or course on your wish list?"},
  {"id":"r5","type":"choice","label":"(Career skills) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r6","type":"choice","label":"(Career skills) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r7","type":"choice","label":"(Career skills) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r8","type":"choice","label":"(Career skills) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r9","type":"choice","label":"(Career skills) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r10","type":"choice","label":"(Career skills) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r11","type":"choice","label":"(Career skills) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r12","type":"choice","label":"(Career skills) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r13","type":"choice","label":"(Career skills) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r14","type":"choice","label":"(Career skills) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r15","type":"choice","label":"(Career skills) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r16","type":"choice","label":"(Career skills) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r17","type":"choice","label":"(Career skills) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r18","type":"choice","label":"(Career skills) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r19","type":"choice","label":"(Career skills) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r20","type":"choice","label":"(Career skills) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r21","type":"choice","label":"(Career skills) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r22","type":"choice","label":"(Career skills) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r23","type":"choice","label":"(Career skills) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r24","type":"choice","label":"(Career skills) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r25","type":"choice","label":"(Career skills) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r26","type":"choice","label":"(Career skills) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r27","type":"choice","label":"(Career skills) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r28","type":"choice","label":"(Career skills) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"r29","type":"text","label":"(Career skills) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"r30","type":"text","label":"(Career skills) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Education',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-env-energy-at-home',
  'Home Energy & Utilities',
  'Understanding how households think about electricity and heating.',
  460,
  22,
  $q$
[
  {"id":"s1","type":"choice","label":"Home type?","options":["Apartment","House","Other"]},
  {"id":"s2","type":"choice","label":"Considered solar or battery storage?","options":["Already have","Researching","Too expensive","Not interested"]},
  {"id":"s3","type":"choice","label":"Thermostat habits?","options":["Fixed schedule","Manual tweaks","Smart thermostat","Do not think about it"]},
  {"id":"s4","type":"text","label":"What would lower your energy bill the most?"},
  {"id":"s5","type":"choice","label":"(Home energy) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s6","type":"choice","label":"(Home energy) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s7","type":"choice","label":"(Home energy) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s8","type":"choice","label":"(Home energy) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s9","type":"choice","label":"(Home energy) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s10","type":"choice","label":"(Home energy) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s11","type":"choice","label":"(Home energy) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s12","type":"choice","label":"(Home energy) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s13","type":"choice","label":"(Home energy) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s14","type":"choice","label":"(Home energy) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s15","type":"choice","label":"(Home energy) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s16","type":"choice","label":"(Home energy) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s17","type":"choice","label":"(Home energy) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s18","type":"choice","label":"(Home energy) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s19","type":"choice","label":"(Home energy) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s20","type":"choice","label":"(Home energy) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s21","type":"choice","label":"(Home energy) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s22","type":"choice","label":"(Home energy) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s23","type":"choice","label":"(Home energy) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s24","type":"choice","label":"(Home energy) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s25","type":"choice","label":"(Home energy) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s26","type":"choice","label":"(Home energy) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s27","type":"choice","label":"(Home energy) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s28","type":"choice","label":"(Home energy) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"s29","type":"text","label":"(Home energy) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"s30","type":"text","label":"(Home energy) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Environment',
  pc.id
from public.payment_categories pc
where pc.slug = 'platinum'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-media-gaming-habits',
  'Gaming Platforms & Play Time',
  'Quick study on how adults fit gaming into their schedules.',
  345,
  18,
  $q$
[
  {"id":"t1","type":"choice","label":"Play video games?","options":["Daily","Weekly","Monthly","Rarely / never"]},
  {"id":"t2","type":"choice","label":"Primary platform?","options":["PC","Console","Mobile","Cloud / other"]},
  {"id":"t3","type":"choice","label":"Spend on in-game purchases?","options":["Never","Under $10/mo","$10–50/mo","$50+/mo"]},
  {"id":"t4","type":"text","label":"Game you have sunk the most hours into lately?"},
  {"id":"t5","type":"choice","label":"(Gaming) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t6","type":"choice","label":"(Gaming) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t7","type":"choice","label":"(Gaming) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t8","type":"choice","label":"(Gaming) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t9","type":"choice","label":"(Gaming) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t10","type":"choice","label":"(Gaming) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t11","type":"choice","label":"(Gaming) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t12","type":"choice","label":"(Gaming) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t13","type":"choice","label":"(Gaming) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t14","type":"choice","label":"(Gaming) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t15","type":"choice","label":"(Gaming) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t16","type":"choice","label":"(Gaming) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t17","type":"choice","label":"(Gaming) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t18","type":"choice","label":"(Gaming) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t19","type":"choice","label":"(Gaming) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t20","type":"choice","label":"(Gaming) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t21","type":"choice","label":"(Gaming) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t22","type":"choice","label":"(Gaming) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t23","type":"choice","label":"(Gaming) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t24","type":"choice","label":"(Gaming) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t25","type":"choice","label":"(Gaming) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t26","type":"choice","label":"(Gaming) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t27","type":"choice","label":"(Gaming) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t28","type":"choice","label":"(Gaming) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"t29","type":"text","label":"(Gaming) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"t30","type":"text","label":"(Gaming) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Media',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active, survey_category, payment_category_id)
select
  'seed-auto-future-mobility',
  'Future of Mobility & Cities',
  'Opinions on EVs, public transit, and how cities should evolve.',
  390,
  20,
  $q$
[
  {"id":"u1","type":"choice","label":"Primary commute today?","options":["Car","Transit","Bike / walk","Remote","Mix"]},
  {"id":"u2","type":"choice","label":"EV for next vehicle?","options":["Definitely considering","Maybe","Prefer gas","Unsure"]},
  {"id":"u3","type":"choice","label":"Support more bike lanes in your area?","options":["Strongly","Somewhat","Neutral","Oppose"]},
  {"id":"u4","type":"text","label":"One transport upgrade you want in your city?"},
  {"id":"u5","type":"choice","label":"(Urban mobility) How much do you agree: this topic matters to my daily life?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u6","type":"choice","label":"(Urban mobility) How often do you actively seek information in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u7","type":"choice","label":"(Urban mobility) How important is this topic for your future plans?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u8","type":"choice","label":"(Urban mobility) How confident are you in your current approach?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u9","type":"choice","label":"(Urban mobility) How often do you compare yourself to others on this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u10","type":"choice","label":"(Urban mobility) How satisfied are you with available options today?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u11","type":"choice","label":"(Urban mobility) How likely are you to try something new in the next year?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u12","type":"choice","label":"(Urban mobility) How clear are your personal goals here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u13","type":"choice","label":"(Urban mobility) How often do you discuss this with family or friends?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u14","type":"choice","label":"(Urban mobility) How much time do you spend on this weekly?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u15","type":"choice","label":"(Urban mobility) How stressed do you feel about decisions in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u16","type":"choice","label":"(Urban mobility) How well do tools or apps support what you need?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u17","type":"choice","label":"(Urban mobility) How open are you to expert advice here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u18","type":"choice","label":"(Urban mobility) How consistent are your habits related to this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u19","type":"choice","label":"(Urban mobility) How much has your view changed in the past 2 years?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u20","type":"choice","label":"(Urban mobility) How often do you track progress in this area?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u21","type":"choice","label":"(Urban mobility) How much does cost influence your choices here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u22","type":"choice","label":"(Urban mobility) How much does convenience matter to you here?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u23","type":"choice","label":"(Urban mobility) How often do you feel well informed?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u24","type":"choice","label":"(Urban mobility) How much do reviews or ratings affect you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u25","type":"choice","label":"(Urban mobility) How likely are you to recommend your approach to a friend?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u26","type":"choice","label":"(Urban mobility) How much does sustainability factor in for you?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u27","type":"choice","label":"(Urban mobility) How often do you plan ahead for this topic?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u28","type":"choice","label":"(Urban mobility) How much does brand loyalty play a role?","options":["Strongly agree","Agree","Neutral","Disagree","Strongly disagree"]},
  {"id":"u29","type":"text","label":"(Urban mobility) Summarize the biggest challenge you face in this topic in one or two sentences."},
  {"id":"u30","type":"text","label":"(Urban mobility) What is one change you would like to see from brands or services in this area?"}
]
$q$::jsonb,
  true,
  'Automotive',
  pc.id
from public.payment_categories pc
where pc.slug = 'gold'
limit 1
on conflict (slug) do nothing;


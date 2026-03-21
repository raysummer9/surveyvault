-- Seed: Travel preferences survey ($3.20, Silver tier, Travel category)

insert into public.surveys (
  slug,
  title,
  description,
  reward_cents,
  estimated_minutes,
  questions,
  is_active,
  survey_category,
  payment_category_id
)
select
  'travel-preferences-experiences',
  'Exploring Travel Preferences and Experiences',
  'This survey aims to understand your travel habits, preferences, and experiences. Your responses will help identify trends in how people plan trips, choose destinations, and what they value most while traveling. Whether you travel frequently or occasionally, your input is valuable.',
  320,
  20,
  $questions$
[
  {"id":"s01","type":"choice","label":"Section 1 — How often do you travel in a year?","options":["Never","Once","2–3 times","4–6 times","7 or more times"]},
  {"id":"s02","type":"choice","label":"Section 1 — What is your primary purpose for traveling?","options":["Leisure","Business","Education","Visiting family or friends","Other"]},
  {"id":"s03","type":"choice","label":"Section 1 — Do you prefer domestic or international travel?","options":["Mostly domestic","Mostly international","Both equally"]},
  {"id":"s04","type":"choice","label":"Section 1 — What is your average trip duration?","options":["Weekend (1–3 days)","Short trip (4–7 days)","1–2 weeks","More than 2 weeks"]},
  {"id":"s05","type":"choice","label":"Section 1 — Who do you usually travel with?","options":["Solo","Family","Friends","Partner or spouse","Organized group"]},
  {"id":"s06","type":"choice","label":"Section 2 — How far in advance do you usually plan your trips?","options":["Less than 2 weeks","2–4 weeks","1–3 months","3–6 months","More than 6 months"]},
  {"id":"s07","type":"choice","label":"Section 2 — What platforms do you use to book travel?","options":["Airline or hotel websites","OTA sites (Expedia, Booking, etc.)","Mobile apps","Travel agents","Mix of several"]},
  {"id":"s08","type":"choice","label":"Section 2 — What influences your choice of destination the most?","options":["Budget","Weather and season","Culture and sights","Recommendations","Events or festivals","Other"]},
  {"id":"s09","type":"choice","label":"Section 2 — Do you prefer planned itineraries or spontaneous travel?","options":["Mostly planned","A balanced mix","Mostly spontaneous"]},
  {"id":"s10","type":"choice","label":"Section 2 — How important are travel reviews when making decisions?","options":["Not important","Somewhat important","Very important","Essential"]},
  {"id":"s11","type":"choice","label":"Section 3 — What is your average budget per trip?","options":["Under $500","$500–$2,000","$2,000–$5,000","Over $5,000","Varies widely"]},
  {"id":"s12","type":"choice","label":"Section 3 — Which aspect of travel do you spend the most on?","options":["Flights","Accommodation","Food and dining","Activities and tours","Local transport"]},
  {"id":"s13","type":"choice","label":"Section 3 — Do you prefer budget, mid-range, or luxury travel?","options":["Budget","Mid-range","Luxury","Depends on the trip"]},
  {"id":"s14","type":"choice","label":"Section 3 — How do you usually manage your travel budget?","options":["Strict budget or spreadsheet","Rough mental estimate","Dedicated travel savings","Credit or rewards points","Mix of methods"]},
  {"id":"s15","type":"choice","label":"Section 3 — Are you willing to spend more for comfort and convenience?","options":["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"]},
  {"id":"s16","type":"choice","label":"Section 4 — What type of accommodation do you prefer?","options":["Hotels","Vacation rentals (e.g. Airbnb)","Hostels","Resorts","Mix depending on trip"]},
  {"id":"s17","type":"choice","label":"Section 4 — What factors matter most when choosing accommodation?","options":["Location","Price","Reviews and ratings","Amenities","Brand or loyalty program"]},
  {"id":"s18","type":"choice","label":"Section 4 — Do you prioritize location over price?","options":["Location first","Balance of both","Price first"]},
  {"id":"s19","type":"choice","label":"Section 4 — How important are amenities (Wi-Fi, pool, gym, etc.)?","options":["Not important","Nice to have","Very important","Deal-breaker if missing"]},
  {"id":"s20","type":"choice","label":"Section 4 — Have you ever tried alternative accommodations (e.g., camping, couchsurfing)?","options":["Never","Once or twice","Sometimes","Often"]},
  {"id":"s21","type":"choice","label":"Section 5 — What is your preferred mode of transportation for long distances?","options":["Plane","Train","Car or road trip","Bus","Mix"]},
  {"id":"s22","type":"choice","label":"Section 5 — How do you usually get around at your destination?","options":["Public transit","Rideshare or taxi","Walking","Rental car","Bicycle or scooter"]},
  {"id":"s23","type":"choice","label":"Section 5 — Do you prefer convenience over cost when choosing transportation?","options":["Convenience first","Balance","Cost first"]},
  {"id":"s24","type":"choice","label":"Section 5 — Have you ever rented a vehicle while traveling?","options":["Never","Rarely","Sometimes","Often"]},
  {"id":"s25","type":"choice","label":"Section 5 — How important is travel time when planning a trip?","options":["Not important","Somewhat important","Very important","Top priority"]},
  {"id":"s26","type":"choice","label":"Section 6 — What type of destinations do you prefer?","options":["Beach or coast","City","Nature or mountains","Cultural or historic","Adventure","Mix"]},
  {"id":"s27","type":"text","label":"Section 6 — What activities do you enjoy most while traveling?"},
  {"id":"s28","type":"choice","label":"Section 6 — How important is local culture and food in your travel experience?","options":["Not important","Somewhat important","Very important","Central to every trip"]},
  {"id":"s29","type":"choice","label":"Section 6 — Do you prefer popular tourist spots or hidden gems?","options":["Mostly popular spots","A mix","Mostly off the beaten path"]},
  {"id":"s30","type":"text","label":"Section 6 — What is the most important factor that makes a trip memorable for you?"}
]
$questions$::jsonb,
  true,
  'Travel',
  pc.id
from public.payment_categories pc
where pc.slug = 'silver'
limit 1
on conflict (slug) do nothing;

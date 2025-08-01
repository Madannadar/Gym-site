const schema = `
  
-- user table

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- dishes talbe

CREATE TABLE IF NOT EXISTS diet_dishes (
  dish_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  dish_name TEXT NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  carbs NUMERIC,

  units TEXT[] CHECK (
    units IS NULL OR
    (
      array_length(units, 1) > 0 AND
      units <@ ARRAY['grams', 'slices', 'ml'] --add more if required
    )
  ),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  is_vegetarian BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- diet templet table

CREATE TABLE IF NOT EXISTS diet_templates (
  template_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  breakfast JSONB,
  lunch JSONB,
  dinner JSONB,
  snacks JSONB,
  number_of_meals INT,
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    breakfast IS NULL OR (
      jsonb_typeof(breakfast) = 'array' AND
      (SELECT bool_and(item ? 'dish_id' AND item ? 'quantity')
       FROM jsonb_array_elements(breakfast) AS item))
  ),

  CHECK (
    lunch IS NULL OR (
      jsonb_typeof(lunch) = 'array' AND
      (SELECT bool_and(item ? 'dish_id' AND item ? 'quantity')
       FROM jsonb_array_elements(lunch) AS item))
  ),

  CHECK (
    dinner IS NULL OR (
      jsonb_typeof(dinner) = 'array' AND
      (SELECT bool_and(item ? 'dish_id' AND item ? 'quantity')
       FROM jsonb_array_elements(dinner) AS item))
  ),

  CHECK (
    snacks IS NULL OR (
      jsonb_typeof(snacks) = 'array' AND
      (SELECT bool_and(item ? 'dish_id' AND item ? 'quantity')
       FROM jsonb_array_elements(snacks) AS item))
  )
);




-- diet lof table [ for now he can enter dished form the dish table only --if required we can change it]

CREATE TABLE IF NOT EXISTS diet_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  template_id INT REFERENCES diet_templates(template_id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  breakfast JSONB,
  lunch JSONB,
  dinner JSONB,
  snacks JSONB,
  total_calories NUMERIC,
  proteins NUMERIC,
  fats NUMERIC,
  carbs NUMERIC,
  adherence JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (breakfast IS NULL OR (jsonb_typeof(breakfast) = 'array' AND (SELECT bool_and(item ? 'dish_id' AND item ? 'actual_calories') FROM jsonb_array_elements(breakfast) AS item))),
  CHECK (lunch IS NULL OR (jsonb_typeof(lunch) = 'array' AND (SELECT bool_and(item ? 'dish_id' AND item ? 'actual_calories') FROM jsonb_array_elements(lunch) AS item))),
  CHECK (dinner IS NULL OR (jsonb_typeof(dinner) = 'array' AND (SELECT bool_and(item ? 'dish_id' AND item ? 'actual_calories') FROM jsonb_array_elements(dinner) AS item))),
  CHECK (snacks IS NULL OR (jsonb_typeof(snacks) = 'array' AND (SELECT bool_and(item ? 'dish_id' AND item ? 'actual_calories') FROM jsonb_array_elements(snacks) AS item)))
);




-- exercise table

CREATE TABLE exercises (
  exercise_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  units TEXT[] CHECK (
    units IS NULL OR units <@ ARRAY['reps', 'weight', 'time']
  ),
  intensity INT CHECK (intensity BETWEEN 1 AND 5),
  created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





// i have changed this query because i was not able to add the check constraint in the previous one insted i am checking the structure in my backend node js app
CREATE TABLE IF NOT EXISTS workouts (
  workout_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  description TEXT,
  structure JSONB NOT NULL CHECK (jsonb_typeof(structure) = 'array'),
  score NUMERIC,
  intensity NUMERIC CHECK (intensity >= 1 AND intensity <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



/*example: 
{
    "item": {
        "workout_id": 1,
        "name": "HIIT Session",
        "created_by": 1,
        "description": "High-intensity interval workout",
        "structure": [
            {
                "sets": {
                    "1": {
                        "reps": 10,
                        "time": 30
                    },
                    "2": {
                        "reps": 8,
                        "time": 35
                    }
                },
                "time_unit": "seconds",
                "exercise_id": 2,
                "weight_unit": "kg"
            },
            {
                "sets": {
                    "1": {
                        "reps": 10,
                        "weight": 30
                    },
                    "2": {
                        "reps": 8,
                        "weight": 35
                    }
                },
                "time_unit": "seconds",
                "exercise_id": 4,
                "weight_unit": "kg"
            }
        ],
        "score": "90",
        "created_at": "2025-05-31T17:09:50.383Z"
    },
    "exercise_ids": [
        2,
        4
    ],
    "message": "Workout recorded successfully"
}
*/


CREATE TABLE IF NOT EXISTS workout_logs (
  workout_log_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  regiment_id INT REFERENCES regiments(regiment_id),
  regiment_day_index INT, -- index into workout_structure array
  log_date DATE NOT NULL,
  planned_workout_id INT REFERENCES workouts(workout_id),
  actual_workout JSONB NOT NULL, -- JSON validated in backend
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score NUMERIC DEFAULT 0
);


/*example
[
  {
    "exercise_id": 301,
    "weight_unit": "kg",
    "time_unit": "seconds",
    "sets": {
      "1": { "reps": 10, "weight": 30, "time": 60 },
      "2": { "reps": 8, "weight": 35, "time": 45 }
    }
  },
  {
    "exercise_id": 302,
    "weight_unit": "lbs",
    "sets": {
      "1": { "reps": 12, "weight": 60 }
    }
  }
]
*/

CREATE TABLE IF NOT EXISTS regiments (
  regiment_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workout_structure JSONB NOT NULL, -- e.g., [{ name: "Day 1", workout_id: 1 }]
  intensity NUMERIC CHECK (intensity >= 1 AND intensity <= 5), -- average workout intensity (1–5)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/*example
{
  "created_by": 1,
  "name": "Beginner Full Body Plan",
  "description": "A simple 3-day plan for beginners to build consistency.",
  "workout_structure": [
    {
      "name": "Day 1 - Upper Body",
      "workout_id": 101
    },
    {
      "name": "Day 2 - Lower Body",
      "workout_id": 102
    },
    {
      "name": "Day 3 - Cardio & Core",
      "workout_id": 103
    }
  ]
}
*/



--event table

CREATE TABLE IF NOT EXISTS event_templates (
  event_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  regiment_id INT REFERENCES regiments(regiment_id) ON DELETE SET NULL,
  event_date DATE,
  event_time TIME,
  event_location TEXT,
  number_of_participants INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




--event log table

CREATE TABLE IF NOT EXISTS event_logs (
  event_log_id SERIAL PRIMARY KEY,
  event_id INT REFERENCES event_templates(event_id) ON DELETE CASCADE,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  regiment_id INT REFERENCES regiments(regiment_id),
  workout_template_values JSONB,
  user_score NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (jsonb_typeof(workout_template_values) = 'object')
);




--leaderboard table
--here total score is sum of the scores from daily workout or the event as required in future

CREATE TABLE IF NOT EXISTS leaderboard (
  leaderboard_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  regiment_id INT REFERENCES regiments(regiment_id) ON DELETE SET NULL,
  total_score NUMERIC DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




--better option to go from materialised view
/*
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  user_id,
  regiment_id,
  SUM(score) AS total_score,
  NOW() AS last_updated
FROM workout_logs
WHERE log_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id, regiment_id;
*/



--attendece table
----qr talbe for qr codes

CREATE TABLE IF NOT EXISTS daily_qr_codes (
  qr_id SERIAL PRIMARY KEY,
  qr_code TEXT NOT NULL,
  valid_for DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




--attendence log table [ partitioning and indexing pending]

CREATE TABLE IF NOT EXISTS attendance_logs (
  attendance_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  qr_id INT REFERENCES daily_qr_codes(qr_id),
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_valid BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, qr_id)
);

`;

export default schema;

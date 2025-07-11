

-- user table

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






-- dishes talbe

CREATE TABLE diet_dishes (
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

  is_vegetarian BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- diet templet table


CREATE TABLE diet_templates (
  template_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  breakfast JSONB,
  lunch JSONB,
  dinner JSONB,
  snacks JSONB,
  number_of_meals INT, 
  --// is this needed ? or is it being used 
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
CREATE TABLE diet_logs (
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
    units IS NULL OR
    (
      array_length(units, 1) > 0 AND
      units <@ ARRAY['reps', 'weight', 'time', 'laps', 'distance']
      -- added 2 new input laps and distance
    )
  ),
  created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE workouts (
  workout_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  description TEXT,
  structure JSONB NOT NULL,
  score NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    jsonb_typeof(structure) = 'array' AND 
    (
      SELECT bool_and(
        item ? 'exercise_id' AND
        item ? 'sets' AND
        jsonb_typeof(item->'sets') = 'object' AND
        (
          SELECT bool_and(
            jsonb_typeof(value) = 'object' AND
            (
              value ? 'reps' OR 
              value ? 'weight' OR 
              value ? 'time' OR 
              value ? 'laps' OR 
              value ? 'distance'
            )
          )
          FROM jsonb_each(item->'sets')
        ) AND
        (
          NOT (item ? 'weight_unit') OR item->>'weight_unit' IN ('kg', 'lbs')
        ) AND
        (
          NOT (item ? 'time_unit') OR item->>'time_unit' IN ('seconds', 'minutes')
        ) AND
        (
          NOT (item ? 'distance_unit') OR item->>'distance_unit' IN ('meters', 'kilometers', 'miles')
        )
      )
      FROM jsonb_array_elements(structure) AS item
    )
  )
);
-- added checks and validation for the 2 new input
{
  "name": "HIIT Session",
  "created_by": 1,
  "description": "High-intensity interval workout",
  "score": 90,
  "structure": [
    {
      "exercise_id": 301,
      "weight_unit": "kg",
      "time_unit": "seconds",
      "distance_unit": "meters",
      "sets": {
        "1": { "reps": 10, "weight": 30, "time": 60, "laps": 2, "distance": 100 },
        "2": { "reps": 8, "weight": 35, "time": 45, "laps": 1, "distance": 80 }
      }
    }
  ]
}

  -- // do we need smart indexing here ?
  -- ans: needed if frequent log, filtering by regiment
  -- without smart indexing we would need full table scan for every request 
  -- as in this table we will be appending data but retriving data based on monthly timeframe it is better to have smart indexing 
  -- // pagination for monthly 
CREATE TABLE workout_logs (
  workout_log_id SERIAL PRIMARY KEY,

  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  regiment_id INT REFERENCES regiments(regiment_id),
  regiment_day_index INT, -- index into workout_structure array
  log_date DATE NOT NULL,

  planned_workout_id INT REFERENCES workouts(workout_id),
  actual_workout JSONB NOT NULL, -- e.g. exercises done

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score NUMERIC DEFAULT 0,

  CHECK (
    jsonb_typeof(actual_workout) = 'array' AND
    (
      SELECT bool_and(
        exercise ? 'exercise_id' AND
        exercise ? 'sets' AND
        jsonb_typeof(exercise->'sets') = 'object' AND
        (
          SELECT bool_and(
            jsonb_typeof(value) = 'object' AND
            (
              value ? 'reps' OR
              value ? 'weight' OR
              value ? 'time' OR
              value ? 'laps' OR
              value ? 'distance'
            )
          )
          FROM jsonb_each(exercise->'sets')
        ) AND
        (
          NOT (exercise ? 'weight_unit') OR exercise->>'weight_unit' IN ('kg', 'lbs')
        ) AND
        (
          NOT (exercise ? 'time_unit') OR exercise->>'time_unit' IN ('seconds', 'minutes')
        ) AND
        (
          NOT (exercise ? 'distance_unit') OR exercise->>'distance_unit' IN ('meters', 'kilometers', 'miles')
        )
      )
      FROM jsonb_array_elements(actual_workout) AS exercise
    )
  )
);

-- Smart indexing for performance and pagination
CREATE INDEX idx_workout_logs_user_date ON workout_logs (user_id, log_date);
-- index on userid and log_date so that their data can be retrived based on date range efficiently 
CREATE INDEX idx_workout_logs_regiment ON workout_logs (regiment_id);
--This index improves lookup performance for fetching logs based on a regiment.

example
{
  "user_id": 42,
  "regiment_id": 7,
  "regiment_day_index": 2,
  "log_date": "2025-05-01",
  "planned_workout_id": 15,
  "actual_workout": [
    {
      "exercise_id": 101,
      "weight_unit": "kg",
      "time_unit": "seconds",
      "sets": {
        "1": { "reps": 10, "weight": 40, "time": 60 },
        "2": { "reps": 8, "weight": 45, "time": 50 }
      }
    },
    {
      "exercise_id": 102,
      "distance_unit": "meters",
      "sets": {
        "1": { "laps": 4, "distance": 400 },
        "2": { "laps": 2, "distance": 200 }
      }
    },
    {
      "exercise_id": 103,
      "sets": {
        "1": { "reps": 15 },
        "2": { "reps": 12 }
      }
    }
  ],
  "score": 85.5
}






CREATE TABLE regiments (
  regiment_id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workout_structure JSONB NOT NULL, -- Array of day-wise entries like [{ name, workout_id }]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    jsonb_typeof(workout_structure) = 'array' AND
    (
      SELECT bool_and(
        jsonb_typeof(day) = 'object' AND
        day ? 'name' AND
        day ? 'workout_id' AND
        jsonb_typeof(day->'name') = 'string' AND
        jsonb_typeof(day->'workout_id') = 'number'
      )
      FROM jsonb_array_elements(workout_structure) AS day
    )
  )
);
example
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





--event table
CREATE TABLE event_templates (
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
CREATE TABLE event_logs (
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
CREATE TABLE leaderboard (
  leaderboard_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  regiment_id INT REFERENCES regiments(regiment_id) ON DELETE SET NULL,
  total_score NUMERIC DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--better option to go from materialised view
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  user_id,
  regiment_id,
  SUM(score) AS total_score,
  NOW() AS last_updated
FROM workout_logs
WHERE log_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id, regiment_id;




--attendece table
----qr talbe for qr codes

CREATE TABLE daily_qr_codes (
  qr_id SERIAL PRIMARY KEY,
  qr_code TEXT NOT NULL,
  valid_for DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--attendence log table [ partitioning and indexing pending]

CREATE TABLE attendance_logs (
  attendance_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  qr_id INT REFERENCES daily_qr_codes(qr_id),
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_valid BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, qr_id)
);


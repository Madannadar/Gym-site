const schema = `


  -- DROP TABLES IF THEY ALREADY EXIST (FOR CLEAN EXECUTION)
    DROP TABLE IF EXISTS event_diets, diet_meals, diet_plans, foods, workout_exercises, exercises, event_workouts, workout_templates, event_participants, events, users CASCADE;

    -- USERS TABLE (Stores user details and dietary preferences)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        user_type VARCHAR(20) CHECK (user_type IN ('Vegetarian', 'Non-Vegetarian')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- EVENTS TABLE (Stores gym events)
    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image TEXT,
        event_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- EVENT PARTICIPANTS TABLE (Links users to events)
    CREATE TABLE IF NOT EXISTS event_participants (
        id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
    );

    -- WORKOUT TEMPLATE TABLE (Reusable workout plans for events)
    CREATE TABLE IF NOT EXISTS workout_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image TEXT,
        difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
        duration INT NOT NULL,  -- in minutes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- EVENT WORKOUTS TABLE (Assigns workout templates to events)
    CREATE TABLE IF NOT EXISTS event_workouts (
        id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        workout_template_id INT REFERENCES workout_templates(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, workout_template_id)
    );

    -- EXERCISES TABLE (Stores individual exercises)
    CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        calories_burned DECIMAL(6,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- WORKOUT EXERCISES TABLE (Links exercises to workout templates)
    CREATE TABLE IF NOT EXISTS workout_exercises (
        id SERIAL PRIMARY KEY,
        workout_template_id INT REFERENCES workout_templates(id) ON DELETE CASCADE,
        exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
        reps INT DEFAULT NULL,
        units VARCHAR(50) DEFAULT NULL,  -- Example: "Minutes", "Kilograms"
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- FOOD ITEMS TABLE (Stores food and nutrition data)
    CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        calories DECIMAL(6,2) NOT NULL,
        protein DECIMAL(5,2) DEFAULT 0,
        carbs DECIMAL(5,2) DEFAULT 0,
        fats DECIMAL(5,2) DEFAULT 0,
        tags TEXT[],  -- Example: {'High Protein', 'Low Carb'}
        food_type VARCHAR(20) CHECK (food_type IN ('Vegetarian', 'Non-Vegetarian')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- DIET PLANS TABLE (Reusable diet templates)
    CREATE TABLE IF NOT EXISTS diet_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
        diet_type VARCHAR(20) CHECK (diet_type IN ('Vegetarian', 'Non-Vegetarian', 'Mixed')),
        tags TEXT[],  -- Example: {'Weight Loss', 'Muscle Gain'}
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- DIET MEALS TABLE (Links food items to diet plans)
    CREATE TABLE IF NOT EXISTS diet_meals (
        id SERIAL PRIMARY KEY,
        diet_plan_id INT REFERENCES diet_plans(id) ON DELETE CASCADE,
        food_id INT REFERENCES foods(id) ON DELETE CASCADE,
        meal_type VARCHAR(20) CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
        serving_size DECIMAL(5,2) NOT NULL, -- Quantity in grams or ml
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    `;

export default schema;

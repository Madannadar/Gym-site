const schema = `



    // -- USERS TABLE (Stores user details and dietary preferences)
    // CREATE TABLE IF NOT EXISTS users (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     email VARCHAR(255) UNIQUE NOT NULL,
    //     password_hash TEXT NOT NULL,
    //     user_type VARCHAR(20) CHECK (user_type IN ('Vegetarian', 'Non-Vegetarian')) NOT NULL,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // );

    // -- EVENTS TABLE (Stores gym events)
    // CREATE TABLE IF NOT EXISTS events (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     description TEXT,
    //     cover_image TEXT,
    //     event_date TIMESTAMP NOT NULL,
    //     location VARCHAR(255),
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // );

    // -- EVENT PARTICIPANTS TABLE (Links users to events)
    // CREATE TABLE IF NOT EXISTS event_participants (
    //     id SERIAL PRIMARY KEY,
    //     event_id INT REFERENCES events(id) ON DELETE CASCADE,
    //     user_id INT REFERENCES users(id) ON DELETE CASCADE,
    //     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     UNIQUE(event_id, user_id)
    // );

    // -- WORKOUT TEMPLATE TABLE (Reusable workout plans for events)
    // CREATE TABLE IF NOT EXISTS workout_templates (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     description TEXT,
    //     cover_image TEXT,
    //     difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    //     duration INT NOT NULL,  -- in minutes
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // );

    // -- EVENT WORKOUTS TABLE (Assigns workout templates to events)
    // CREATE TABLE IF NOT EXISTS event_workouts (
    //     id SERIAL PRIMARY KEY,
    //     event_id INT REFERENCES events(id) ON DELETE CASCADE,
    //     workout_template_id INT REFERENCES workout_templates(id) ON DELETE CASCADE,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     UNIQUE(event_id, workout_template_id)
    // );

    // -- EXERCISES TABLE (Stores individual exercises)
    // CREATE TABLE IF NOT EXISTS exercises (
    //     id SERIAL PRIMARY KEY,
    //     name VARCHAR(255) NOT NULL,
    //     description TEXT,
    //     calories_burned DECIMAL(6,2),
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // );

    // -- WORKOUT EXERCISES TABLE (Links exercises to workout templates)
    // CREATE TABLE IF NOT EXISTS workout_exercises (
    //     id SERIAL PRIMARY KEY,
    //     workout_template_id INT REFERENCES workout_templates(id) ON DELETE CASCADE,
    //     exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
    //     reps INT DEFAULT NULL,
    //     units VARCHAR(50) DEFAULT NULL,  -- Example: "Minutes", "Kilograms"
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    // );

    -- FOOD ITEMS TABLE (Stores food and nutrition data)
    CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        calories DECIMAL(6, 2) NOT NULL,
        protein DECIMAL(5, 2) NOT NULL,
        carbs DECIMAL(5, 2) NOT NULL,
        fats DECIMAL(5, 2) NOT NULL,
        tags TEXT[],
        food_type VARCHAR(20) CHECK (food_type IN ('Vegetarian', 'Non-Vegetarian')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- DIET PLANS TABLE (Reusable diet templates)
    CREATE TABLE IF NOT EXISTS diet_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) NOT NULL,
        diet_type VARCHAR(20) CHECK (diet_type IN ('Vegetarian', 'Non-Vegetarian', 'Mixed')) NOT NULL,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE diet_plan_foods (
  id SERIAL PRIMARY KEY,
  diet_plan_id INTEGER REFERENCES diet_plans(id),
  food_id INTEGER REFERENCES foods(id),
  portion_size VARCHAR(50),
  meal_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    `;

export default schema;

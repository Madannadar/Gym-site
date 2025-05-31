

create workout response that is being returned after a successful workout creation in the gym database.

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
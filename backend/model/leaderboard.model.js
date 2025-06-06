import db from "../config/db.js";

export async function calculateWorkoutPoints(userId, startDate, endDate) {
  const workoutQuery = `
    SELECT actual_workout
    FROM workout_logs
    WHERE user_id = $1 AND log_date BETWEEN $2 AND $3;
  `;
  const workoutResult = await db.query(workoutQuery, [userId, startDate, endDate]);
  
  let totalPoints = 0;
  for (const log of workoutResult.rows) {
    const exercises = log.actual_workout || [];
    for (const exercise of exercises) {
      const exerciseId = exercise.exercise_id;
      const sets = exercise.sets || {};
      const weightUnit = exercise.weight_unit || 'kg';
      
      const intensityQuery = `SELECT intensity FROM exercises WHERE exercise_id = $1`;
      const intensityResult = await db.query(intensityQuery, [exerciseId]);
      const intensity = intensityResult.rows[0]?.intensity || 1;
      
      for (const set of Object.values(sets)) {
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight) || 1;
        totalPoints += reps * weight * intensity;
      }
    }
  }
  
  const activeDaysQuery = `
    SELECT COUNT(DISTINCT DATE(scanned_at)) as active_days
    FROM attendance_logs
    WHERE user_id = $1 AND scanned_at BETWEEN $2 AND $3 AND is_valid = TRUE;
  `;
  const activeDaysResult = await db.query(activeDaysQuery, [userId, startDate, endDate]);
  const activeDays = activeDaysResult.rows[0]?.active_days || 0;
  
  const consistencyBonus = 10;
  totalPoints += activeDays * consistencyBonus;
  
  return totalPoints;
}

export async function fetchPaginatedLeaderboards({ limit = 10, offset = 0, leaderboardType, daysPerWeek }) {
  let query = `
    SELECT l.*, u.email AS user_email
    FROM leaderboard l
    JOIN users u ON l.user_id = u.id
    WHERE l.leaderboard_type = $1
  `;
  const params = [leaderboardType];
  
  if (daysPerWeek !== undefined && daysPerWeek !== null && !isNaN(parseInt(daysPerWeek))) {
    query += ` AND l.days_per_week = $2`;
    params.push(parseInt(daysPerWeek));
  }
  
  query += ` ORDER BY l.total_score DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const res = await db.query(query, params);
  return res.rows;
}

export async function fetchLeaderboardByUserId(userId, leaderboardType) {
  const res = await db.query(
    `SELECT l.*, u.email AS user_email
     FROM leaderboard l
     JOIN users u ON l.user_id = u.id
     WHERE l.user_id = $1 AND l.leaderboard_type = $2`,
    [userId, leaderboardType]
  );
  return res.rows[0];
}

export async function insertLeaderboard({
  user_id,
  regiment_id,
  total_score = 0,
  leaderboard_type,
  days_per_week,
  event_id,
}) {
  const res = await db.query(
    `INSERT INTO leaderboard (user_id, regiment_id, total_score, leaderboard_type, days_per_week, event_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, regiment_id, total_score, leaderboard_type, days_per_week, event_id]
  );
  return res.rows[0];
}

export async function updateLeaderboard({ user_id, regiment_id, total_score, leaderboard_type, days_per_week, event_id }) {
  const res = await db.query(
    `UPDATE leaderboard
     SET regiment_id = $2,
         total_score = $3,
         days_per_week = $4,
         event_id = $5,
         last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND leaderboard_type = $6
     RETURNING *`,
    [user_id, regiment_id, total_score, days_per_week, event_id, leaderboard_type]
  );
  return res.rows[0];
}

export async function incrementLeaderboardScore(userId, delta, leaderboardType) {
  const res = await db.query(
    `UPDATE leaderboard
     SET total_score = total_score + $2,
         last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND leaderboard_type = $3
     RETURNING *`,
    [userId, delta, leaderboardType]
  );
  return res.rows[0];
}

export async function deleteLeaderboardByUserId(userId, leaderboardType) {
  const res = await db.query(
    `DELETE FROM leaderboard
     WHERE user_id = $1 AND leaderboard_type = $2
     RETURNING *`,
    [userId, leaderboardType]
  );
  return res.rows[0];
}

export async function resetAllLeaderboardScores(leaderboardType) {
  await db.query(
    `UPDATE leaderboard
     SET total_score = 0,
         last_updated = CURRENT_TIMESTAMP
     WHERE leaderboard_type = $1`,
    [leaderboardType]
  );
}

export async function assignCommunityLeaderboard(userId, regimentId) {
  const regimentQuery = `SELECT workout_structure FROM regiments WHERE regiment_id = $1`;
  const regimentResult = await db.query(regimentQuery, [regimentId]);
  if (!regimentResult.rows[0]) throw new Error("Regiment not found");
  
  const workoutStructure = regimentResult.rows[0].workout_structure || [];
  const daysPerWeek = workoutStructure.length;
  
  if (daysPerWeek < 1 || daysPerWeek > 7) throw new Error("Invalid days per week");
  
  const existing = await fetchLeaderboardByUserId(userId, 'community');
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const points = await calculateWorkoutPoints(userId, startDate, new Date());
  
  if (existing) {
    await updateLeaderboard({
      user_id: userId,
      regiment_id: regimentId,
      total_score: points,
      leaderboard_type: 'community',
      days_per_week: daysPerWeek,
      event_id: null
    });
  } else {
    await insertLeaderboard({
      user_id: userId,
      regiment_id: regimentId,
      total_score: points,
      leaderboard_type: 'community',
      days_per_week: daysPerWeek,
      event_id: null
    });
  }
}

export async function getActiveDaysPerWeek() {
  const query = `
    SELECT DISTINCT days_per_week
    FROM leaderboard
    WHERE leaderboard_type = 'community' AND days_per_week IS NOT NULL
    ORDER BY days_per_week;
  `;
  const res = await db.query(query);
  return res.rows.map(row => row.days_per_week);
}

export async function checkAndPromoteUsers() {
  const usersQuery = `
    SELECT user_id, days_per_week
    FROM leaderboard
    WHERE leaderboard_type = 'community' AND days_per_week IS NOT NULL;
  `;
  const users = await db.query(usersQuery);
  
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  for (const user of users.rows) {
    const userId = user.user_id;
    const currentDays = user.days_per_week;
    
    const attendanceQuery = `
      SELECT COUNT(DISTINCT DATE(scanned_at)) as days
      FROM attendance_logs
      WHERE user_id = $1 AND scanned_at >= $2 AND is_valid = TRUE
      GROUP BY DATE_TRUNC('week', scanned_at);
    `;
    const attendanceResult = await db.query(attendanceQuery, [userId, twoWeeksAgo]);
    
    const weeks = attendanceResult.rows;
    console.log(`User ${userId}: Current days_per_week=${currentDays}, Attendance weeks=${JSON.stringify(weeks)}`);
    
    if (weeks.length >= 2 && weeks.every(week => week.days > currentDays)) {
      const newDays = Math.min(7, Math.max(...weeks.map(w => w.days)));
      console.log(`Promoting user ${userId} to days_per_week=${newDays}`);
      const points = await calculateWorkoutPoints(userId, twoWeeksAgo, new Date());
      await updateLeaderboard({
        user_id: userId,
        total_score: points,
        leaderboard_type: 'community',
        days_per_week: newDays,
        regiment_id: null,
        event_id: null
      });
    } else {
      console.log(`User ${userId}: No promotion (weeks=${weeks.length}, days=${weeks.map(w => w.days).join(',')})`);
    }
  }
}

export async function createEventLeaderboardEntry(userId, eventId, regimentId) {
  const eventQuery = `SELECT regiment_id FROM event_templates WHERE event_id = $1`;
  const eventResult = await db.query(eventQuery, [eventId]);
  if (!eventResult.rows[0]) throw new Error("Event not found");
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const points = await calculateWorkoutPoints(userId, startDate, new Date());
  
  await insertLeaderboard({
    user_id: userId,
    regiment_id: regimentId || eventResult.rows[0].regiment_id,
    total_score: points,
    leaderboard_type: 'event',
    days_per_week: null,
    event_id: eventId
  });
}

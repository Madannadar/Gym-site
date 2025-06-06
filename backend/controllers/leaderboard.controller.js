import {
    calculateWorkoutPoints,
    fetchPaginatedLeaderboards,
    fetchLeaderboardByUserId,
    insertLeaderboard,
    updateLeaderboard,
    incrementLeaderboardScore,
    deleteLeaderboardByUserId,
    resetAllLeaderboardScores,
    assignCommunityLeaderboard,
    getActiveDaysPerWeek,
    checkAndPromoteUsers,
    createEventLeaderboardEntry,
  } from "../model/leaderboard.model.js";

import db from '../config/db.js'

  export async function getLeaderboard(req, res) {
    const { limit = 10, offset = 0, type = 'community', daysPerWeek, eventId } = req.query;
    try {
      if (type === 'community' && daysPerWeek) {
        const entries = await fetchPaginatedLeaderboards({
          limit: parseInt(limit),
          offset: parseInt(offset),
          leaderboardType: 'community',
          daysPerWeek: parseInt(daysPerWeek)
        });
        res.json({ data: entries, limit, offset });
      } else if (type === 'event' && eventId) {
        const entries = await fetchPaginatedLeaderboards({
          limit: parseInt(limit),
          offset: parseInt(offset),
          leaderboardType: 'event'
        });
        res.json({ data: entries.filter(e => e.event_id == eventId), limit, offset });
      } else {
        const entries = await fetchPaginatedLeaderboards({
          limit: parseInt(limit),
          offset: parseInt(offset),
          leaderboardType: type
        });
        res.json({ data: entries, limit, offset });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function getUserLeaderboard(req, res) {
    const { userId } = req.params;
    const { type = 'personal' } = req.query;
    try {
      const entry = await fetchLeaderboardByUserId(userId, type);
      if (!entry) return res.status(404).json({ error: "User not found in leaderboard" });
      res.json(entry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function createLeaderboardEntry(req, res) {
    const { user_id, regiment_id, total_score, leaderboard_type, days_per_week, event_id } = req.body;
    try {
      const entry = await insertLeaderboard({
        user_id,
        regiment_id,
        total_score,
        leaderboard_type,
        days_per_week,
        event_id
      });
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function updateLeaderboardEntry(req, res) {
    const { user_id, regiment_id, total_score, leaderboard_type, days_per_week, event_id } = req.body;
    try {
      const updated = await updateLeaderboard({
        user_id,
        regiment_id,
        total_score,
        leaderboard_type,
        days_per_week,
        event_id
      });
      if (!updated) return res.status(404).json({ error: "Entry not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function incrementScore(req, res) {
    const { userId } = req.params;
    const { delta, leaderboard_type = 'personal' } = req.body;
    try {
      const updated = await incrementLeaderboardScore(userId, delta, leaderboard_type);
      if (!updated) return res.status(404).json({ error: "Entry not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function deleteLeaderboardEntry(req, res) {
    const { userId } = req.params;
    const { type = 'personal' } = req.query;
    try {
      const deleted = await deleteLeaderboardByUserId(userId, type);
      if (!deleted) return res.status(404).json({ error: "User not found in leaderboard" });
      res.json({ message: "Leaderboard entry deleted", deleted });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function resetAllScores(req, res) {
    const { type = 'personal' } = req.body;
    try {
      await resetAllLeaderboardScores(type);
      res.json({ message: `All ${type} leaderboard scores reset to 0` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function updateAllScores(req, res) {
    const { type = 'personal', daysPerWeek, eventId } = req.body;
    try {
      let usersQuery = `SELECT user_id FROM leaderboard WHERE leaderboard_type = $1`;
      const params = [type];
      if (type === 'community' && daysPerWeek) {
        usersQuery += ` AND days_per_week = $2`;
        params.push(parseInt(daysPerWeek));
      } else if (type === 'event' && eventId) {
        usersQuery += ` AND event_id = $2`;
        params.push(parseInt(eventId));
      }
      
      const users = await db.query(usersQuery, params);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Last 30 days
      
      for (const user of users.rows) {
        const points = await calculateWorkoutPoints(user.user_id, startDate, new Date());
        await updateLeaderboard({
          user_id: user.user_id,
          total_score: points,
          leaderboard_type: type,
          regiment_id: null,
          days_per_week: type === 'community' ? parseInt(daysPerWeek) : null,
          event_id: type === 'event' ? parseInt(eventId) : null
        });
      }
      res.json({ message: `${type} leaderboard scores updated` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  export async function assignCommunityLeaderboardController(req, res) {
    const { userId, regimentId } = req.body;
    try {
      await assignCommunityLeaderboard(userId, regimentId);
      res.json({ message: "User assigned to community leaderboard" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  export async function getActiveDaysPerWeekController(req, res) {
    try {
      const days = await getActiveDaysPerWeek();
      res.json({ days });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  export async function promoteUsersController(req, res) {
    try {
      await checkAndPromoteUsers();
      res.json({ message: "User promotions checked and updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  export async function createEventLeaderboardEntryController(req, res) {
    const { userId, eventId, regimentId } = req.body;
    try {
      await createEventLeaderboardEntry(userId, eventId, regimentId);
      res.json({ message: "Event leaderboard entry created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

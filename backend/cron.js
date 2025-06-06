import cron from 'node-cron';
import { updateAllScores, promoteUsersController, getActiveDaysPerWeekController } from './controllers/leaderboard.controller.js';

cron.schedule('0 22 * * *', async () => {
  console.log('Updating leaderboard scores at 10 PM...');
  try {
    // Update personal leaderboard
    await updateAllScores({ body: { type: 'personal' } }, { json: () => {} });
    
    // Update community leaderboards for active days
    const days = await getActiveDaysPerWeekController();
    for (const daysPerWeek of days) {
      await updateAllScores({ body: { type: 'community', daysPerWeek } }, { json: () => {} });
    }
    
    // Update event leaderboards (if events exist)
    const events = await db.query('SELECT event_id FROM event_templates WHERE event_date >= CURRENT_DATE');
    for (const event of events.rows) {
      await updateAllScores({ body: { type: 'event', eventId: event.event_id } }, { json: () => {} });
    }
    
    // Check promotions
    await promoteUsersController();
    console.log('Leaderboard scores and promotions updated');
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

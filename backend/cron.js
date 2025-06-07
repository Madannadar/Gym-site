import cron from 'node-cron';
import { updateAllScores, promoteUsersController, getActiveDaysPerWeekController, resetAllScores } from './controllers/leaderboard.controller.js';
import db from './config/db.js';

cron.schedule('0 22 * * *', async () => {
  console.log('Updating leaderboard scores at 10 PM IST...');
  try {
    // Update personal leaderboard
    await updateAllScores({ body: { type: 'personal' } }, { json: () => {} });
    
    // Update community leaderboards for active days
    const { days } = await getActiveDaysPerWeekController({}, { json: (data) => data });
    for (const daysPerWeek of days) {
      await updateAllScores({ body: { type: 'community', daysPerWeek } }, { json: () => {} });
    }
    
    // Update event leaderboards (if events exist)
    const events = await db.query('SELECT event_id FROM event_templates WHERE event_date >= CURRENT_DATE');
    for (const event of events.rows) {
      await updateAllScores({ body: { type: 'event', eventId: event.event_id } }, { json: () => {} });
    }
    
    // Check promotions
    await promoteUsersController({}, { json: () => {} });
    console.log('Leaderboard scores and promotions updated');
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

cron.schedule('0 0 1 1,4,7,10 *', async () => {
  console.log('Resetting leaderboards at midnight on Jan 1, Apr 1, Jul 1, Oct 1...');
  try {
    await resetAllScores({ body: { type: 'personal' } }, { json: () => {} });
    await resetAllScores({ body: { type: 'community' } }, { json: () => {} });
    await resetAllScores({ body: { type: 'event' } }, { json: () => {} });
    console.log('Leaderboards reset');
  } catch (err) {
    console.error('Cron job reset error:', err.message);
  }
});

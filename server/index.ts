import { app } from './app.js';
import { startKeepaliveScheduler } from './services/keepalive.service.js';
import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.API_PORT || 7081);

app.listen(port, () => {
  console.log(`🚀 FleetMaster-Pro API listening on http://localhost:${port}`);
  console.log(`📦 Storage engine: ${process.env.USE_MOCK_DB === 'true' ? 'Ephemeral Mock JSON' : 'Supabase PostgreSQL'}`);
  if (process.env.ENABLE_KEEPALIVE === 'true') {
    startKeepaliveScheduler();
  } else {
    console.log('⏸️ [Keepalive:FleetMaster-Pro] Keepalive scheduler is currently disabled.');
  }
});


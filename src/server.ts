import { app } from './app';
import { checkDatabase } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await checkDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

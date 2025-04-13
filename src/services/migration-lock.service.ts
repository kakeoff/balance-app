import { Sequelize } from "sequelize";

export class MigrationLockService {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  async acquireLock(): Promise<boolean> {
    try {
      await this.sequelize.query(
        `INSERT INTO "SequelizeMeta" (name, "createdAt", "updatedAt")
         VALUES ('_migration_lock', NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`
      );

      const [result] = await this.sequelize.query(
        `SELECT name FROM "SequelizeMeta" WHERE name = '_migration_lock'`
      );

      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async releaseLock(): Promise<void> {
    await this.sequelize.query(
      `DELETE FROM "SequelizeMeta" WHERE name = '_migration_lock'`
    );
  }
}

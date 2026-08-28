import { connectDB, isDBConnected } from './config/db';
import { UserModel } from './models/User';
import { ProjectModel } from './models/Project';
import { LedgerEntryModel } from './models/LedgerEntry';
import { DisputeModel } from './models/Dispute';
import { MessageModel } from './models/Message';
import { NotificationModel } from './models/Notification';
import {
  SEED_USERS,
  SEED_FREELANCERS,
  SEED_PROJECTS,
  SEED_LEDGER_ENTRIES,
  SEED_DISPUTES,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
} from '../src/mock/seedData';

export const seedDatabase = async (force: boolean = false): Promise<void> => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }

    if (!isDBConnected()) {
      console.warn('[Seed] Skipping seed: MongoDB is not connected.');
      return;
    }

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount > 0 && !force) {
      console.log(`[Seed] Database already contains ${projectCount} projects. Skipping seed.`);
      return;
    }

    if (force) {
      console.log('[Seed] Force flag set. Clearing existing collections...');
      await Promise.all([
        UserModel.deleteMany({}),
        ProjectModel.deleteMany({}),
        LedgerEntryModel.deleteMany({}),
        DisputeModel.deleteMany({}),
        MessageModel.deleteMany({}),
        NotificationModel.deleteMany({}),
      ]);
    }

    console.log('[Seed] Seeding MongoDB with initial KEYstone data...');

    // 1. Seed Users
    const allUsers = [
      SEED_USERS.client,
      SEED_USERS.freelancer,
      SEED_USERS.admin,
      ...SEED_FREELANCERS.filter((f) => f.id !== SEED_USERS.freelancer.id),
    ];
    for (const user of allUsers) {
      await UserModel.findOneAndUpdate({ id: user.id }, { $set: user }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${allUsers.length} users.`);

    // 2. Seed Projects
    for (const project of SEED_PROJECTS) {
      await ProjectModel.findOneAndUpdate({ id: project.id }, { $set: project }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${SEED_PROJECTS.length} projects.`);

    // 3. Seed Ledger Entries
    for (const entry of SEED_LEDGER_ENTRIES) {
      await LedgerEntryModel.findOneAndUpdate({ id: entry.id }, { $set: entry }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${SEED_LEDGER_ENTRIES.length} ledger entries.`);

    // 4. Seed Disputes
    for (const dispute of SEED_DISPUTES) {
      await DisputeModel.findOneAndUpdate({ id: dispute.id }, { $set: dispute }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${SEED_DISPUTES.length} disputes.`);

    // 5. Seed Messages
    for (const msg of SEED_MESSAGES) {
      await MessageModel.findOneAndUpdate({ id: msg.id }, { $set: msg }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${SEED_MESSAGES.length} messages.`);

    // 6. Seed Notifications
    for (const notif of SEED_NOTIFICATIONS) {
      await NotificationModel.findOneAndUpdate({ id: notif.id }, { $set: notif }, { upsert: true, new: true });
    }
    console.log(`[Seed] Seeded ${SEED_NOTIFICATIONS.length} notifications.`);

    console.log('[Seed] Successfully seeded KEYstone MongoDB database!');
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${(error as Error).message}`);
  }
};

// If run directly from CLI
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/') || 'seed.ts')) {
  seedDatabase(true).then(() => {
    process.exit(0);
  });
}

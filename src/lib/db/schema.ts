import { pgTable, text, integer, timestamp, boolean, varchar, uuid, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'pro_monthly', 'pro_yearly', 'lifetime']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'trialing', 'inactive']);
export const masteryStatusEnum = pgEnum('mastery_status', ['new', 'learning', 'mastered']);
export const paymentStatusEnum = pgEnum('payment_status', ['succeeded', 'failed', 'pending']);

// Users table (synced from Clerk)
export const users = pgTable('users', {
  clerkUserId: varchar('clerk_user_id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  linkedinId: varchar('linkedin_id', { length: 255 }),
  role: userRoleEnum('role').notNull().default('user'), // Only admins can create flashcards
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  planType: planTypeEnum('plan_type').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('inactive'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull(),
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  status: paymentStatusEnum('status').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Domains table (8 CISSP Domains) - Admin created
export const domains = pgTable('domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  icon: varchar('icon', { length: 100 }), // emoji or icon name
  createdBy: varchar('created_by', { length: 255 }).references(() => users.clerkUserId), // Admin who created it
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Topics table - Admin created
export const topics = pgTable('topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  domainId: uuid('domain_id').notNull().references(() => domains.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  createdBy: varchar('created_by', { length: 255 }).references(() => users.clerkUserId), // Admin who created it
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Decks table - Admin created
export const decks = pgTable('decks', {
  id: uuid('id').defaultRandom().primaryKey(),
  topicId: uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  cardCount: integer('card_count').notNull().default(0),
  order: integer('order').notNull(),
  isPremium: boolean('is_premium').default(false), // true = requires Pro subscription
  createdBy: varchar('created_by', { length: 255 }).references(() => users.clerkUserId), // Admin who created it
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flashcards table - Admin created ONLY
export const flashcards = pgTable('flashcards', {
  id: uuid('id').defaultRandom().primaryKey(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  explanation: text('explanation'), // additional context or tips
  difficulty: integer('difficulty').default(3), // 1-5 scale
  order: integer('order').notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull().references(() => users.clerkUserId), // Admin who created it
  isPublished: boolean('is_published').default(true), // Admins can draft cards
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flashcard Media table - stores multiple images per flashcard
export const flashcardMedia = pgTable('flashcard_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  flashcardId: uuid('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  fileUrl: varchar('file_url', { length: 500 }).notNull(), // Cloud storage URL (Vercel Blob)
  fileKey: varchar('file_key', { length: 500 }).notNull(), // Storage key for deletion
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(), // image/png, image/jpeg, etc.
  placement: varchar('placement', { length: 20 }).notNull(), // 'question' or 'answer'
  order: integer('order').default(0).notNull(), // for ordering multiple images
  altText: varchar('alt_text', { length: 255 }), // accessibility
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User card progress table (confidence-based) - Users consume cards
export const userCardProgress = pgTable('user_card_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  flashcardId: uuid('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  confidenceLevel: integer('confidence_level').default(0), // 0 = not seen, 1-5 = user rating
  timesSeen: integer('times_seen').default(0),
  lastSeen: timestamp('last_seen'),
  nextReviewDate: timestamp('next_review_date'),
  masteryStatus: masteryStatusEnum('mastery_status').notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Study sessions table - Users consume cards
export const studySessions = pgTable('study_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  deckId: uuid('deck_id').references(() => decks.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  cardsStudied: integer('cards_studied').default(0),
  averageConfidence: decimal('average_confidence', { precision: 3, scale: 2 }),
  studyDuration: integer('study_duration'), // in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Session cards table (tracks individual card reviews in a session)
export const sessionCards = pgTable('session_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => studySessions.id, { onDelete: 'cascade' }),
  flashcardId: uuid('flashcard_id').notNull().references(() => flashcards.id, { onDelete: 'cascade' }),
  confidenceRating: integer('confidence_rating').notNull(), // 1-5
  responseTime: integer('response_time'), // in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Deck progress table (aggregate stats per deck) - Users' progress
export const deckProgress = pgTable('deck_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  masteryPercentage: decimal('mastery_percentage', { precision: 5, scale: 2 }).default('0'),
  cardsNew: integer('cards_new').default(0),
  cardsLearning: integer('cards_learning').default(0),
  cardsMastered: integer('cards_mastered').default(0),
  lastStudied: timestamp('last_studied'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User stats table (overall user statistics) - Users' overall stats
export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }).unique(),
  totalCardsStudied: integer('total_cards_studied').default(0),
  studyStreakDays: integer('study_streak_days').default(0),
  totalStudyTime: integer('total_study_time').default(0), // in seconds
  dailyCardsStudiedToday: integer('daily_cards_studied_today').default(0), // For free tier limit (10/day)
  lastActiveDate: timestamp('last_active_date'),
  lastResetDate: timestamp('last_reset_date'), // Track when daily limit was last reset
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions),
  payments: many(payments),
  cardProgress: many(userCardProgress),
  studySessions: many(studySessions),
  deckProgress: many(deckProgress),
  stats: one(userStats),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.clerkUserId],
    references: [users.clerkUserId],
  }),
}));

export const domainsRelations = relations(domains, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  domain: one(domains, {
    fields: [topics.domainId],
    references: [domains.id],
  }),
  decks: many(decks),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  topic: one(topics, {
    fields: [decks.topicId],
    references: [topics.id],
  }),
  flashcards: many(flashcards),
  studySessions: many(studySessions),
  deckProgress: many(deckProgress),
}));

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [flashcards.deckId],
    references: [decks.id],
  }),
  userProgress: many(userCardProgress),
  sessionCards: many(sessionCards),
  media: many(flashcardMedia), // Multiple images per flashcard
}));

export const flashcardMediaRelations = relations(flashcardMedia, ({ one }) => ({
  flashcard: one(flashcards, {
    fields: [flashcardMedia.flashcardId],
    references: [flashcards.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [studySessions.clerkUserId],
    references: [users.clerkUserId],
  }),
  deck: one(decks, {
    fields: [studySessions.deckId],
    references: [decks.id],
  }),
  sessionCards: many(sessionCards),
}));

export const sessionCardsRelations = relations(sessionCards, ({ one }) => ({
  session: one(studySessions, {
    fields: [sessionCards.sessionId],
    references: [studySessions.id],
  }),
  flashcard: one(flashcards, {
    fields: [sessionCards.flashcardId],
    references: [flashcards.id],
  }),
}));

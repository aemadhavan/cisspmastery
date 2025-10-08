import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Drizzle instance optimized for Vercel Postgres
// Works seamlessly with Vercel Postgres, Neon, Xata.io, or any PostgreSQL compatible service
export const db = drizzle(sql, { schema });

// Export types
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type Subscription = typeof schema.subscriptions.$inferSelect;
export type NewSubscription = typeof schema.subscriptions.$inferInsert;

export type Payment = typeof schema.payments.$inferSelect;
export type NewPayment = typeof schema.payments.$inferInsert;

export type Domain = typeof schema.domains.$inferSelect;
export type NewDomain = typeof schema.domains.$inferInsert;

export type Topic = typeof schema.topics.$inferSelect;
export type NewTopic = typeof schema.topics.$inferInsert;

export type Deck = typeof schema.decks.$inferSelect;
export type NewDeck = typeof schema.decks.$inferInsert;

export type Flashcard = typeof schema.flashcards.$inferSelect;
export type NewFlashcard = typeof schema.flashcards.$inferInsert;

export type UserCardProgress = typeof schema.userCardProgress.$inferSelect;
export type NewUserCardProgress = typeof schema.userCardProgress.$inferInsert;

export type StudySession = typeof schema.studySessions.$inferSelect;
export type NewStudySession = typeof schema.studySessions.$inferInsert;

export type SessionCard = typeof schema.sessionCards.$inferSelect;
export type NewSessionCard = typeof schema.sessionCards.$inferInsert;

export type DeckProgress = typeof schema.deckProgress.$inferSelect;
export type NewDeckProgress = typeof schema.deckProgress.$inferInsert;

export type UserStats = typeof schema.userStats.$inferSelect;
export type NewUserStats = typeof schema.userStats.$inferInsert;

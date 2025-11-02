/**
 * Cache Key Generators
 * Centralized location for all Redis cache keys to ensure consistency
 */

export const CacheKeys = {
  /**
   * All domains/classes list
   */
  domains: {
    all: () => 'domains:all',
  },

  /**
   * Class-specific keys
   */
  class: {
    // Class details with user-specific progress
    details: (classId: string, userId: string) => `class:${classId}:user:${userId}`,
    // Pattern to match all user variants of a class
    allUsers: (classId: string) => `class:${classId}:user:*`,
  },

  /**
   * Domain flashcards (all flashcards for a class)
   */
  domainFlashcards: {
    all: (domainId: string) => `domain:${domainId}:flashcards`,
  },

  /**
   * Deck-specific keys
   */
  deck: {
    // All flashcards for a deck
    flashcards: (deckId: string) => `deck:${deckId}:flashcards`,
  },

  /**
   * User progress keys
   */
  progress: {
    // User's progress for a specific card
    card: (userId: string, cardId: string) => `progress:${userId}:card:${cardId}`,
    // Pattern to match all progress for a user
    userAll: (userId: string) => `progress:${userId}:*`,
  },
} as const;

/**
 * Cache TTL (Time To Live) values in seconds
 */
export const CacheTTL = {
  // 5 minutes for domains list (rarely changes)
  DOMAINS_LIST: 5 * 60,

  // 2 minutes for class details (has user progress which updates more frequently)
  CLASS_DETAILS: 2 * 60,

  // 10 minutes for flashcard lists (content rarely changes)
  FLASHCARDS: 10 * 60,

  // 1 minute for user progress (updates frequently)
  USER_PROGRESS: 1 * 60,

  // 30 seconds for frequently changing data
  SHORT: 30,

  // 1 hour for rarely changing data
  LONG: 60 * 60,
} as const;

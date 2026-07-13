import { createClient } from '@supabase/supabase-js';

/**
 * MemoryRepository: Handles persistent storage operations (e.g., Supabase).
 * Keeps the database logic strictly isolated from the core engine.
 */
export class MemoryRepository {
  constructor(dbClient = null) {
    if (!dbClient && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        this.db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        console.log("[MemoryRepository] 🟢 Supabase Database Connected!");
    } else {
        this.db = dbClient;
        if(!dbClient) console.warn("[MemoryRepository] 🟡 Running without Persistent Database");
    }
  }

  // =======================================================
  // 🧠 KEY-VALUE STORAGE (For Core Data & Projects)
  // =======================================================
  async save(category, key, value) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('orbis_memory')
        .upsert({ category, memory_key: key, memory_value: value, updated_at: new Date() });
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`[MemoryRepository] Error saving ${category} memory:`, err.message);
      return false;
    }
  }

  async get(category, key) {
    if (!this.db) return null;
    try {
      const { data, error } = await this.db
        .from('orbis_memory')
        .select('memory_value')
        .eq('category', category)
        .eq('memory_key', key)
        .single();
        
      if (error || !data) return null;
      return data.memory_value;
    } catch (err) {
      return null;
    }
  }

  // =======================================================
  // 💬 CHAT HISTORY STORAGE (For Permanent Conversations)
  // =======================================================
  async saveConversationMessage(sessionId, role, content) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('chat_history')
        .insert([
          { session_id: sessionId, role: role, content: content }
        ]);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[MemoryRepository] Chat save error:", err.message);
      return false;
    }
  }

  async getRecentConversations(sessionId, limit = 6) {
    if (!this.db) return [];
    try {
      const { data, error } = await this.db
        .from('chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.reverse().map(row => ({
         role: row.role,
         message: row.content,
         content: row.content,
         created_at: row.created_at 
      }));
    } catch (err) {
      console.error("[MemoryRepository] Chat fetch error:", err.message);
      return [];
    }
  }

  // =======================================================
  // 🚀 PHASE 6C: COGNITIVE MEMORY (Vector Search & Store)
  // =======================================================
  
  async saveSemanticMemory(sessionId, userInput, aiResponse, embeddingArray) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('orbis_semantic_memory')
        .insert([{ 
            session_id: sessionId, 
            user_input: userInput, 
            ai_response: aiResponse, 
            embedding: embeddingArray 
        }]);
      
      if (error) throw error;
      console.log("[MemoryRepository] 🧠 Cognitive Memory Saved.");
      return true;
    } catch (err) {
      console.error("[MemoryRepository] Semantic save error:", err.message);
      return false;
    }
  }

  async searchSemanticMemory(queryEmbedding, threshold = 0.75, matchCount = 3) {
    if (!this.db) return [];
    try {
      const { data, error } = await this.db.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: matchCount
      });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("[MemoryRepository] Semantic search error:", err.message);
      return [];
    }
  }
}

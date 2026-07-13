import { createClient } from '@supabase/supabase-js';
import LZString from 'lz-string'; // 🟢 কমপ্রেশন লাইব্রেরি

/**
 * MemoryRepository: Handles persistent storage operations.
 * Updated: Phase 7.8 - Added LZ-String Compression for 512MB optimization.
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

  // কম্প্রেশন হেল্পার
  _compress(data) { return LZString.compressToUTF16(JSON.stringify(data)); }
  _decompress(str) { 
      try { return JSON.parse(LZString.decompressFromUTF16(str)); } 
      catch(e) { return str; } 
  }

  // =======================================================
  // 🧠 KEY-VALUE STORAGE (Compressed)
  // =======================================================
  async save(category, key, value) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('orbis_memory')
        .upsert({ 
            category, 
            memory_key: key, 
            memory_value: this._compress(value), // 🟢 কম্প্রেসড
            updated_at: new Date() 
        });
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`[MemoryRepository] Error saving ${category}:`, err.message);
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
      return this._decompress(data.memory_value); // 🟢 ডিকম্প্রেসড
    } catch (err) {
      return null;
    }
  }

  // =======================================================
  // 💬 CHAT HISTORY STORAGE (Compressed)
  // =======================================================
  async saveConversationMessage(sessionId, role, content) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('chat_history')
        .insert([{ 
            session_id: sessionId, 
            role: role, 
            content: this._compress(content) // 🟢 কম্প্রেসড
        }]);
      
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
         message: this._decompress(row.content), // 🟢 ডিকম্প্রেসড
         content: this._decompress(row.content),
         created_at: row.created_at 
      }));
    } catch (err) {
      console.error("[MemoryRepository] Chat fetch error:", err.message);
      return [];
    }
  }

  // =======================================================
  // 🚀 COGNITIVE MEMORY (Vector - No compression on embeddings)
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
      return !error;
    } catch (err) { return false; }
  }

  async searchSemanticMemory(queryEmbedding, threshold = 0.75, matchCount = 3) {
    if (!this.db) return [];
    try {
      const { data, error } = await this.db.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: matchCount
      });
      return data || [];
    } catch (err) { return []; }
  }
}

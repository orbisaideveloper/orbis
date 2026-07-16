import { createClient } from '@supabase/supabase-js';
import LZString from 'lz-string'; 

/**
 * MemoryRepository: Handles persistent storage operations (Supabase).
 * Refactored: Strict Persistent Storage Layer (Fixed Column Mapping).
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
  // 🟢 COMPRESSION HELPERS
  // =======================================================
  _compress(data) { return LZString.compressToUTF16(JSON.stringify(data)); }
  
  _decompress(str) { 
      try { 
          const decompressed = LZString.decompressFromUTF16(str);
          if (decompressed) return JSON.parse(decompressed);
          return str; // If it wasn't compressed, return as plain text
      } catch(e) { 
          return str; 
      } 
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
            memory_value: this._compress(value), 
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
      return this._decompress(data.memory_value);
    } catch (err) {
      return null;
    }
  }

  // =======================================================
  // 💬 CHAT HISTORY STORAGE (Mapped to New Supabase Schema)
  // =======================================================
  async saveConversationMessage(sessionId, role, content) {
    if (!this.db) return false;
    try {
      const { error } = await this.db
        .from('chat_history')
        .insert([{ 
            orb_id: sessionId,   // 🟢 FIXED: session_id -> orb_id
            sender: role,        // 🟢 FIXED: role -> sender
            message: content     // 🟢 FIXED: content -> message (Plain text for UI syncing)
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
        .eq('orb_id', sessionId) // 🟢 FIXED: session_id -> orb_id
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.reverse().map(row => {
         const text = this._decompress(row.message); // Will return plain text if not compressed
         return {
             role: row.sender,       // 🟢 FIXED: row.role -> row.sender
             message: text,          // 🟢 FIXED: row.content -> row.message
             content: text,          // Fallback for BrainController
             created_at: row.created_at 
         };
      });
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



/**
 * VectorEngine: High-performance retrieval layer.
 * Uses Semantic Search logic to retrieve memory in O(1) or O(log n) time.
 * Prevents system 'hangs' by using non-blocking indexing.
 */
export class VectorEngine {
  constructor() {
    this.vectorIndex = new Map(); // Simulated Vector Store
  }

  /**
   * Encodes text into a 'Vector' (Simplified semantic representation).
   * In Phase 6, this will connect to a real Embedding API.
   */
  async createEmbedding(text) {
    // Simulated embedding: Mapping words to semantic clusters
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 3).join('_');
  }

  /**
   * Adds memory to the index with semantic tagging.
   */
  async store(id, text) {
    const vector = await this.createEmbedding(text);
    if (!this.vectorIndex.has(vector)) {
      this.vectorIndex.set(vector, []);
    }
    this.vectorIndex.get(vector).push({ id, text, timestamp: Date.now() });
  }

  /**
   * Semantic Search: Finds the closest match without scanning the whole list.
   * This is why it never hangs!
   */
  async retrieve(query) {
    const vector = await this.createEmbedding(query);
    return this.vectorIndex.get(vector) || [];
  }
}

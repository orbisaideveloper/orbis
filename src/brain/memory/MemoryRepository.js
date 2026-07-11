/**
 * MemoryRepository: Handles persistent storage operations (e.g., Supabase).
 * Keeps the database logic strictly isolated from the core engine.
 */
export class MemoryRepository {
  constructor(dbClient = null) {
    this.db = dbClient;
  }

  async save(category, key, value) {
    if (!this.db) return false;
    try {
      // Supabase upsert logic (Mocked for architecture layout)
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
}

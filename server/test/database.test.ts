import { describe, it, expect, beforeAll } from 'vitest';
import { db, getDatabase } from '../src/db/database.js';
import { seedDefaultCollections } from '../src/db/seed.js';

describe('Database & Collections', () => {
  beforeAll(() => {
    // Initialize DB and run seed
    getDatabase();
    seedDefaultCollections();
  });

  it('should list default seeded collections', () => {
    const collections = db.getCollections('guest');
    expect(collections.length).toBeGreaterThanOrEqual(3);

    const names = collections.map((c) => c.name);
    expect(names).toContain('HTTPBin Playground');
    expect(names).toContain('GitHub API');
    expect(names).toContain('JSONPlaceholder');
  });

  it('should create and delete a custom collection', () => {
    const created = db.createCollection('Integration Test Suite', 'test-user');
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Integration Test Suite');

    const req = db.saveRequest(created.id, 'Test Ping', 'GET', 'https://httpbin.org/get');
    expect(req.id).toBeDefined();

    const collections = db.getCollections('test-user');
    const found = collections.find((c) => c.id === created.id);
    expect(found).toBeDefined();
    expect(found?.requests?.length).toBe(1);

    const deleted = db.deleteCollection(created.id, 'test-user');
    expect(deleted).toBe(true);
  });

  it('should record and retrieve history records', () => {
    db.addHistory('user-1', 'POST', 'https://api.example.com', 201, 120.5, 340);
    const history = db.getHistory('user-1', 10);

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].method).toBe('POST');
    expect(history[0].status_code).toBe(201);
    expect(history[0].latency_ms).toBe(120.5);
  });
});

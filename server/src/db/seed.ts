import { getDatabase, db } from './database.js';

export function seedDefaultCollections(): void {
  const database = getDatabase();

  // Check if system collections already exist
  const existing = database
    .prepare("SELECT COUNT(*) as count FROM collections WHERE user_id = 'system'")
    .get() as { count: number };

  if (existing && existing.count > 0) {
    return;
  }

  // 1. HTTPBin Playground
  const httpbin = db.createCollection('HTTPBin Playground', 'system');
  db.saveRequest(
    httpbin.id,
    'Get Request Details',
    'GET',
    'https://httpbin.org/get',
    { Accept: 'application/json', 'User-Agent': 'RestPocket/1.0' }
  );
  db.saveRequest(
    httpbin.id,
    'Post JSON Data',
    'POST',
    'https://httpbin.org/post',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ message: 'Hello from RestPocket!', timestamp: new Date().toISOString() }, null, 2)
  );
  db.saveRequest(
    httpbin.id,
    "Status 418 I'm a Teapot",
    'GET',
    'https://httpbin.org/status/418',
    { Accept: 'text/plain' }
  );

  // 2. GitHub Public API
  const github = db.createCollection('GitHub API', 'system');
  db.saveRequest(
    github.id,
    'GitHub Zen',
    'GET',
    'https://api.github.com/zen',
    { 'User-Agent': 'RestPocket-App' }
  );
  db.saveRequest(
    github.id,
    'Get Octocat Profile',
    'GET',
    'https://api.github.com/users/octocat',
    { 'User-Agent': 'RestPocket-App', Accept: 'application/vnd.github.v3+json' }
  );

  // 3. JSONPlaceholder API
  const jsonplaceholder = db.createCollection('JSONPlaceholder', 'system');
  db.saveRequest(
    jsonplaceholder.id,
    'List Posts',
    'GET',
    'https://jsonplaceholder.typicode.com/posts?_limit=5'
  );
  db.saveRequest(
    jsonplaceholder.id,
    'Create Post',
    'POST',
    'https://jsonplaceholder.typicode.com/posts',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ title: 'New Article', body: 'Testing REST APIs on mobile', userId: 1 }, null, 2)
  );

  // Default Environment
  db.saveEnvironment(
    'Production API Sample',
    {
      baseUrl: 'https://httpbin.org',
      apiKey: 'sample_api_key_123',
    },
    1,
    'system'
  );
}

# Database Performance Optimization

Database performance is critical for application success. Let's explore proven optimization techniques.

## Understanding Query Performance

Before optimizing, you need to understand what's slow:

```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN ANALYZE
SELECT * FROM users
WHERE created_at > '2026-01-01'
ORDER BY id DESC
LIMIT 100;
```

## Indexing Strategies

### 1. Create Appropriate Indexes

```sql
-- Index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multi-column queries
CREATE INDEX idx_users_created_name ON users(created_at, name);
```

### 2. Avoid Over-Indexing

Too many indexes can slow down writes. Balance read and write performance.

## Query Optimization

### Use Proper JOINs

```sql
-- Efficient JOIN
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.active = true;
```

### Avoid N+1 Queries

Load related data in a single query instead of multiple queries.

## Connection Pooling

Use connection pools to reuse database connections:

```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Caching Strategies

1. **Query Result Caching**: Cache frequent query results
2. **Redis for Session Data**: Fast key-value storage
3. **CDN for Static Assets**: Reduce database load

## Monitoring

- Track slow queries
- Monitor connection pool usage
- Set up alerts for performance degradation

## Conclusion

Database optimization is an ongoing process. Profile, optimize, and monitor continuously for best results.

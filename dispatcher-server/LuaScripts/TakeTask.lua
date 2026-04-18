-- KEYS[1] = queue
-- KEYS[2] = processQueue
-- KEYS[3] = lockPrefix
-- KEYS[4] = taskPrefix (mm:task:)

-- ARGV[1] = dispatcherId
-- ARGV[2] = ttl
-- ARGV[3] = expected status (CREATED)
-- ARGV[4] = new status (PROCESSING)

local taskId = redis.call("RPOP", KEYS[1])

if not taskId then
    return nil
end

local lockKey = KEYS[3] .. taskId

local ok = redis.call("SET", lockKey, ARGV[1], "EX", ARGV[2], "NX")

if not ok then
    -- ❗ возвращаем обратно в очередь
    redis.call("LPUSH", KEYS[1], taskId)
    return nil
end

local taskKey = KEYS[4] .. taskId
local status = redis.call("HGET", taskKey, "status")

if status ~= ARGV[3] then
    -- ❗ снимаем lock и возвращаем задачу
    redis.call("DEL", lockKey)
    redis.call("LPUSH", KEYS[1], taskId)
    return {0, taskId, status}
end

-- ставим PROCESSING + timestamp
local time = redis.call("TIME")
redis.call("HSET", taskKey,
    "status", ARGV[4],
    "processingAt", time[1]
)

-- кладём в processing queue
redis.call("LPUSH", KEYS[2], taskId)

return {1, taskId}
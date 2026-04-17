local indexKey = KEYS[1]
local queueKey = KEYS[2]
local taskKey = KEYS[3]

local taskId = ARGV[1]
local lobbyId = ARGV[2]
local createdAt = ARGV[3]
local payload = ARGV[4]

-- index
redis.call("SET", indexKey, taskId)

-- task storage (FULL DATA)
redis.call("HSET", taskKey,
    "taskId", taskId,
    "lobbyId", lobbyId,
    "status", "queued",
    "createdAt", createdAt,
    "payload", payload
)

-- queue only id
redis.call("LPUSH", queueKey, taskId)

return taskId
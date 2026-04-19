-- KEYS[1] = task key (mm:task:{taskId})
-- KEYS[2] = stream key (stream:session-ready)
-- KEYS[3] = queue:processing
-- KEYS[4] = lock:matchmaking:

-- ARGV[1] = expected status (PROCESSING)
-- ARGV[2] = new status (READY)
-- ARGV[3] = sessionId
-- ARGV[4] = serverIp
-- ARGV[5] = port

local taskId = string.sub(KEYS[1], 9)

local currentStatus = redis.call("HGET", KEYS[1], "status")

if currentStatus ~= ARGV[1] then
    return {0, currentStatus}
end

local lobbyId = redis.call("HGET", KEYS[1], "lobbyId")

if not lobbyId then
    return {0, "NO_LOBBY"}
end

-- обновляем task
redis.call("HSET", KEYS[1],
    "status", ARGV[2],
    "sessionId", ARGV[3],
    "serverIp", ARGV[4],
    "port", ARGV[5]
)

-- удалить из processing list
redis.call("LREM", KEYS[3], 0, taskId)

-- remove lock
redis.call("DEL", KEYS[4] .. taskId)

-- stream event


return {1, ARGV[2] ,lobbyId}



--local messageId = redis.call("XADD", KEYS[2], "*",
--    "taskId", taskId,
--    "lobbyId", lobbyId,
--    "sessionId", ARGV[3],
--    "serverIp", ARGV[4],
--    "port", ARGV[5]
--)
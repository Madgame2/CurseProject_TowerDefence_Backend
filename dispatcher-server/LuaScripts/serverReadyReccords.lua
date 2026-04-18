-- KEYS[1] = task key (mm:task:{taskId})
-- KEYS[2] = stream key (stream:session-ready)

-- ARGV[1] = expected status (PROCESSING)
-- ARGV[2] = new status (READY)
-- ARGV[3] = sessionId
-- ARGV[4] = serverIp
-- ARGV[5] = port

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

-- добавляем событие в stream
local messageId = redis.call("XADD", KEYS[2], "*",
    "taskId", string.sub(KEYS[1], 9),
    "lobbyId", lobbyId,
    "sessionId", ARGV[3],
    "serverIp", ARGV[4],
    "port", ARGV[5]
)

return {1, messageId}
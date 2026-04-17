local serverListKey = KEYS[1]
local serverHashKey = KEYS[2]

local serverId = ARGV[1]
local host = ARGV[2]
local port = ARGV[3]
local maxLoad = ARGV[4]

-- если уже есть в set → ничего не делаем
if redis.call("SISMEMBER", serverListKey, serverId) == 1 then
    return 0
end

-- добавляем в список серверов
redis.call("SADD", serverListKey, serverId)

-- создаём запись сервера
redis.call("HSET", serverHashKey,
    "host", host,
    "port", port,
    "maxLoad", maxLoad,
    "currentLoad", "0",
    "status", "online"
)

return 1
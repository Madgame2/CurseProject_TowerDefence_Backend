-- KEYS[1] = lobby:{lobbyId}:users
-- KEYS[2] = server:{sessionServerId}:{SessionId}:metadata
-- KEYS[3] = server:{sessionServerId}

-- ARGV[1] = sessionID
-- ARGV[2] = sessionDificulty 
-- ARGV[3] = Seed 
-- ARGV[4] = passToken 
-- ARGV[5] = sessionState 


local currentLoad = tonumber(redis.call("HGET", KEYS[3], "currentLoad") or "0")
local maxLoad = tonumber(redis.call("HGET", KEYS[3], "maxLoad") or "0")

if currentLoad >= maxLoad then
    return nil
end




local players = redis.call("SMEMBERS", KEYS[1])


redis.call("HSET", KEYS[2],
    "SessionID", ARGV[1],
    "Dificulty", ARGV[2],
    "Seed", ARGV[3],
    "PassToken", ARGV[4],
    "SessionState", ARGV[5]
)

local nextLoad = currentLoad + 1
redis.call("HSET", KEYS[3], "currentLoad", nextLoad)

if nextLoad >= maxLoad then
    redis.call("HSET", KEYS[3], "canAccept", "false")
end

-- сохраняем игроков отдельно (правильная структура Redis)
local playersKey = KEYS[2] .. ":players"

for i = 1, #players do
    redis.call("SADD", playersKey, players[i])
end

-- формируем результат
local result = {
    SessionID = ARGV[1],
    Dificulty = ARGV[2],
    Seed = ARGV[3],
    PassToken = ARGV[4],
    SessionState = ARGV[5],
    Players = players
}

return cjson.encode(result)
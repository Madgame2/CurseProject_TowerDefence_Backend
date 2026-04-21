-- KEYS[1] == `server:{serverID}:{sessionId}
-- KEYS[2] == `server:{serverId}


local keys = redis.call("KEYS", KEYS[1])

if #keys > 0 then
    redis.call("DEL", unpack(keys))
end

local currentLoad = tonumber(redis.call("HGET", KEYS[2], "currentLoad"))
local maxLoad = tonumber(redis.call("HGET", KEYS[2], "maxLoad") or "0")


local nextLoad = currentLoad - 1
redis.call("HSET", KEYS[2], "currentLoad", nextLoad)

if nextLoad < maxLoad then
    redis.call("HSET", KEYS[2], "canAccept", "true")
end



return 1


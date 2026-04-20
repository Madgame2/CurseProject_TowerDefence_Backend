local userKey = KEYS[1]

local lobbyId = redis.call("GET", userKey)

if not lobbyId or lobbyId == false then
    return 0
end

local indexKey = "index:lobby:" .. lobbyId .. ":lastTask"
local taskId = redis.call("GET", indexKey)

if not taskId or taskId == false then
    return 1
end

local taskKey = "mm:task:" .. taskId

if redis.call("EXISTS", taskKey) == 0 then
    return 2
end


redis.call("HSET", taskKey, "status", "cancelled")
redis.call("HSET", taskKey, "cancelledAt", tostring(redis.call("TIME")[1]))

return 4
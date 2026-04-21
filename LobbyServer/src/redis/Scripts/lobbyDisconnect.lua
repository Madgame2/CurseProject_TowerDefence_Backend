-- KEYS:
-- 1 lobby:{id}:users
-- 2 lobby:{id}:host
-- 3 lobbies
-- 4 invite:{code}
-- 5 user:{id}:lobby
-- 6 lobby:{id}:hostName
-- 7 lobby:{id}:headerImage
-- 8 lobby:{id}:inviteCode

-- ARGV:
-- 1 userId
-- 2 lobbyId
-- 3 inviteCode

local usersKey = KEYS[1]
local hostKey = KEYS[2]
local lobbiesKey = KEYS[3]
local inviteKey = KEYS[4]
local userLobbyKey = KEYS[5]
local hostNameKey = KEYS[6]
local headerImageKey = KEYS[7]
local inviteCodeKey = KEYS[8]
local indexlastTask = KEYS[8]

local userId = ARGV[1]
local lobbyId = ARGV[2]

redis.call("SREM", usersKey, userId)
redis.call("DEL", userLobbyKey)

local users = redis.call("SMEMBERS", usersKey)


if (#users == 0) then
    redis.call("DEL", usersKey)
    redis.call("DEL", hostKey)
    redis.call("DEL", hostNameKey)
    redis.call("DEL", headerImageKey)
    redis.call("DEL", inviteCodeKey)

    redis.call("DEL", inviteKey)
    redis.call("SREM", lobbiesKey, lobbyId)

    redis.call("DEL", indexlastTask)
    return 1
end

local host = redis.call("GET", hostKey)

if host == userId and users[1] ~= nil then
    redis.call("SET", hostKey, users[1])
end

return 0
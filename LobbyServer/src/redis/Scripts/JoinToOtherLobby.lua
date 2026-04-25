-- KEYS[1] = lobby:{newLobbyId}
-- KEYS[2] = user:${PlayerID}:JoinRequests:${requestId}
-- ARGV[1] = userId
-- ARGV[2] = newLobbyId

local userId = ARGV[1]
local newLobbyId = ARGV[2]


if(not redis.call("EXISTS", KEYS[2])) then return nil end


local function removeFromLobby(userId)
    local result = {
        oldLobbyId = nil,
        deletedLobby = false,
        newHost = nil
    }

    local userLobbyKey = "user:" .. userId .. ":lobby"
    local oldLobbyId = redis.call("GET", userLobbyKey)

    if not oldLobbyId then
        return result
    end

    result.oldLobbyId = oldLobbyId

    local lobbyUsersKey = "lobby:" .. oldLobbyId .. ":users"

    redis.call("SREM", lobbyUsersKey, userId)

    local users = redis.call("SMEMBERS", lobbyUsersKey)

    if #users == 0 then
        local inviteCodeKey = "lobby:" .. oldLobbyId .. ":inviteCode"
        local inviteCode = redis.call("GET", inviteCodeKey)

        if inviteCode then
            redis.call("DEL", "invite:" .. inviteCode)
        end

        redis.call("DEL", "index:lobby:" .. oldLobbyId .. ":lastTask")

        local pattern = "lobby:" .. oldLobbyId .. ":*"
        local cursor = "0"

        repeat
            local scan = redis.call("SCAN", cursor, "MATCH", pattern, "COUNT", 100)
            cursor = scan[1]
            local keys = scan[2]

            if #keys > 0 then
                redis.call("DEL", unpack(keys))
            end
        until cursor == "0"

        result.deletedLobby = true
        return result
    end

    local hostKey = "lobby:" .. oldLobbyId .. ":host"
    local currentHost = redis.call("GET", hostKey)

    if currentHost == userId then
        local newHost = users[1]
        redis.call("SET", hostKey, newHost)
        result.newHost = newHost
    end

    return result
end

-- 🔹 выходим из старого лобби и получаем результат
local removeResult = removeFromLobby(userId)

-- 🔹 заходим в новое
local userLobbyKey = "user:" .. userId .. ":lobby"
local newLobbyUsersKey = KEYS[1] .. ":users"

redis.call("SET", userLobbyKey, newLobbyId)
redis.call("SADD", newLobbyUsersKey, userId)


        local pattern = "user:" .. userId .. ":JoinRequests:*"
        local cursor = "0"

        repeat
            local scan = redis.call("SCAN", cursor, "MATCH", pattern, "COUNT", 100)
            cursor = scan[1]
            local keys = scan[2]

            if #keys > 0 then
                redis.call("DEL", unpack(keys))
            end
        until cursor == "0"



-- 🔹 возвращаем JSON
return cjson.encode({
    oldLobbyId = removeResult.oldLobbyId,
    newLobbyId = newLobbyId,
    deletedLobby = removeResult.deletedLobby,
    newHost = removeResult.newHost
})
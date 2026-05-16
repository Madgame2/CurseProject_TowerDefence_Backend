-- ARGV[1] = userId
-- ARGV[2] = newLobbyId
-- ARGV[3] = inviteCode

local userId          = ARGV[1]
local newLobbyId      = ARGV[2]
local inviteCode      = ARGV[3]
local hostName        = ARGV[4]
local hostHeaderImage = ARGV[5]

local result = {
    oldLobbyId=nil,
    newLobbyId=newLobbyId,
    deletedLobby=false,
    newHost=nil
}


----------------------------------------------------
-- Удаление из старого лобби
----------------------------------------------------

local userLobbyKey =
    "user:" .. userId .. ":lobby"

local oldLobbyId =
    redis.call(
        "GET",
        userLobbyKey
    )

result.oldLobbyId = oldLobbyId


if oldLobbyId then

    local usersKey =
        "lobby:" .. oldLobbyId .. ":users"

    redis.call(
        "SREM",
        usersKey,
        userId
    )

    local users =
        redis.call(
            "SMEMBERS",
            usersKey
        )


    -- удаляем пустое лобби
    if #users == 0 then

        local invite =
            redis.call(
                "GET",
                "lobby:" ..
                oldLobbyId ..
                ":inviteCode"
            )

        if invite then
            redis.call(
                "DEL",
                "invite:" .. invite
            )
        end


        local cursor="0"

        repeat

            local scan =
                redis.call(
                    "SCAN",
                    cursor,
                    "MATCH",
                    "lobby:" ..
                    oldLobbyId ..
                    ":*",
                    "COUNT",
                    100
                )

            cursor = scan[1]

            if #scan[2] > 0 then
                redis.call(
                    "DEL",
                    unpack(scan[2])
                )
            end

        until cursor == "0"


        redis.call(
            "SREM",
            "lobbies",
            oldLobbyId
        )

        result.deletedLobby = true


    else

        local host =
            redis.call(
                "GET",
                "lobby:" ..
                oldLobbyId ..
                ":host"
            )

        if host == userId then

            local newHost =
                users[1]

            redis.call(
                "SET",
                "lobby:" ..
                oldLobbyId ..
                ":host",
                newHost
            )

            result.newHost =
                newHost
        end
    end
end



----------------------------------------------------
-- Создание нового лобби
----------------------------------------------------
redis.call(
    "SET",
    "lobby:"..newLobbyId..":host",
    userId
)

redis.call(
    "SADD",
    "lobby:"..newLobbyId..":users",
    userId
)

redis.call(
    "SET",
    "user:"..userId..":lobby",
    newLobbyId
)

redis.call(
    "SET",
    "lobby:"..newLobbyId..":inviteCode",
    inviteCode
)

redis.call(
    "SET",
    "lobby:"..newLobbyId..":hostName",
    hostName
)

redis.call(
    "SET",
    "lobby:"..newLobbyId..":headerImage",
    hostHeaderImage
)

redis.call(
    "SET",
    "invite:"..inviteCode,
    newLobbyId
)

redis.call(
    "SADD",
    "lobbies",
    newLobbyId
)


return cjson.encode(result)
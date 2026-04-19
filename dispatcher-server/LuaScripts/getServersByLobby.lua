    -- KEYS[1] = `lobby:${lobbyId}:users`
    -- KEYS[2] = `user:`}


    local users = redis.call("SMEMBERS", KEYS[1])

    local serversSet = {}

    for i = 1, #users do
        local user = users[i]
        local userServerKey = KEYS[2] .. user .. ":server"
        local userServer = redis.call("GET", userServerKey)

        if userServer then
            serversSet[userServer] = true
        end
    end

    -- превращаем set → массив
    local result = {}
    for server, _ in pairs(serversSet) do
        table.insert(result, server)
    end

    return {result, users}


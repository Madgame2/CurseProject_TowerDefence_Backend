local userKey = KEYS[1]

local lobbyId = redis.call("GET", userKey)

-- Если лобби не найдено, возвращаем статус 0 и nil
if not lobbyId or lobbyId == false then
    return {0, nil}
end

local indexKey = "index:lobby:" .. lobbyId .. ":lastTask"
local taskId = redis.call("GET", indexKey)

-- Если задача не найдена, возвращаем статус 1 и ID лобби
if not taskId or taskId == false then
    return {1, lobbyId}
end

local taskKey = "mm:task:" .. taskId

-- Если ключ задачи не существует в базе
if redis.call("EXISTS", taskKey) == 0 then
    return {2, lobbyId}
end

-- Основная логика отмены
redis.call("HSET", taskKey, "status", "cancelled")
redis.call("HSET", taskKey, "cancelledAt", tostring(redis.call("TIME")[1]))

-- Успешное завершение: статус 4 и ID лобби
return {4, lobbyId}
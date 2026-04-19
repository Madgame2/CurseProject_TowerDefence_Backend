-- KEYS:
-- 1 user:{id}:state
-- 1 user:{id}:server

-- ARGV:
-- 1 userId (optional, for debug)
-- 2 rootSTATE

local stateKey = KEYS[1]
local serverKey = KEYS[2]
local userId = ARGV[1]

local currentState = redis.call("GET", stateKey)

-- если состояния нет
if currentState == false then
    return nil
end

-- ⚠️ удаляем ТОЛЬКО если пользователь в лобби
if currentState ~= ARGV[2] then
    return currentState
end

-- удаляем state только для LOBBY
redis.call("DEL", stateKey)
redis.call("DEL", serverKey)

return currentState
-- KEYS[1] = redisKey to state

--  = rootSTATE

local key = KEYS[1]

local state = redis.call("GET", key)

if state == false then
    redis.call("SET", key, ARGV[1])
    return ARGV[1]
end

return state
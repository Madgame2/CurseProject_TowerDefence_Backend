-- KEYS[1] = processing list
-- KEYS[2] = matchmaking queue list
-- KEYS[3] = task prefix (mm:task:)
-- KEYS[4] = lock prefix (lock:matchmaking:)

local processing = redis.call("LRANGE", KEYS[1], 0, -1)

for i = 1, #processing do
    local taskId = processing[i]

    local lockKey = KEYS[4] .. taskId

    local exists = redis.call("EXISTS", lockKey)

    if exists == 0 then
        -- remove from processing
        redis.call("LREM", KEYS[1], 0, taskId)

        -- requeue
        redis.call("LPUSH", KEYS[2], taskId)

        -- FIX STATE (ONLY mm:task)
        local taskKey = KEYS[3] .. taskId

        if redis.call("EXISTS", taskKey) == 1 then
            redis.call("HSET", taskKey,
                "status", "queued"
            )
        end
    end
end

-- optional: consistency repair queue
local queue = redis.call("LRANGE", KEYS[2], 0, -1)

for i = 1, #queue do
    local taskId = queue[i]
    local taskKey = KEYS[3] .. taskId

    if redis.call("EXISTS", taskKey) == 1 then
        local status = redis.call("HGET", taskKey, "status")

        if status ~= "queued" then
            redis.call("HSET", taskKey, "status", "queued")
        end
    end
end

return {#processing, #queue}
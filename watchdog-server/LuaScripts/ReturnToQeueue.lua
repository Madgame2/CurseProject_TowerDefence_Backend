-- KEYS[1] = processing list
-- KEYS[2] = matchmaking queue list

local processing = redis.call("LRANGE", KEYS[1], 0, -1)

for i = 1, #processing do
    local taskId = processing[i]

    -- FIXED FORMAT:
    local lockKey = "task:" .. taskId .. ":lock"

    local exists = redis.call("EXISTS", lockKey)

    if exists == 0 then
        -- убрать из processing
        redis.call("LREM", KEYS[1], 0, taskId)

        -- вернуть в очередь
        redis.call("LPUSH", KEYS[2], taskId)
    end
end

return #processing
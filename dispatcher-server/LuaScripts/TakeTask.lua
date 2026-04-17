local queue = KEYS[1]
local processQueue = KEYS[2]
local lockPrefix = KEYS[3]

local dispatcherId = ARGV[1]
local ttl = tonumber(ARGV[2])

local taskId = redis.call("RPOP", queue)

if not taskId then return nil end

local lockKey = lockPrefix .. taskId .. ":lock"

local ok = redis.call("SET", lockKey, dispatcherId, "EX", ttl, "NX")

if not ok then
    return nil
end

redis.call("LPUSH", processQueue, taskId)

return taskId
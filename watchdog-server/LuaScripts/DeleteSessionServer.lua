local serverId = ARGV[1]

-- если сервер есть в списке → удаляем
if redis.call("SISMEMBER", KEYS[1], serverId) == 1 then
    redis.call("SREM", KEYS[1], serverId)
end

-- удаляем все связанные ключи
redis.call("DEL", KEYS[2])
redis.call("DEL", KEYS[3])
redis.call("DEL", KEYS[4])

return 1
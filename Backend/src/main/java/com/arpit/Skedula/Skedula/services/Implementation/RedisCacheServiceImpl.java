package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.services.CacheService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

@Service("cacheService")
@Slf4j
public class RedisCacheServiceImpl implements CacheService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${redis.cache.enabled:true}")
    private boolean cacheEnabled;

    @Autowired
    public RedisCacheServiceImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public RedisCacheServiceImpl(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public <T> Optional<T> get(String key, Class<T> clazz) {
        if (!cacheEnabled || key == null || key.isBlank()) {
            return Optional.empty();
        }
        try {
            String cached = redisTemplate.opsForValue().get(key);
            if (cached == null || cached.isBlank()) {
                log.info("[REDIS CACHE MISS] Key: {}", key);
                return Optional.empty();
            }
            log.info("[REDIS CACHE HIT] Key: {}", key);
            T value = objectMapper.readValue(cached, clazz);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.warn("Redis GET operation failed for key '{}'. Falling back to source. Error: {}", key, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public <T> Optional<T> get(String key, TypeReference<T> typeReference) {
        if (!cacheEnabled || key == null || key.isBlank()) {
            return Optional.empty();
        }
        try {
            String cached = redisTemplate.opsForValue().get(key);
            if (cached == null || cached.isBlank()) {
                log.info("[REDIS CACHE MISS] Key: {}", key);
                return Optional.empty();
            }
            log.info("[REDIS CACHE HIT] Key: {}", key);
            T value = objectMapper.readValue(cached, typeReference);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.warn("Redis GET operation failed for key '{}'. Falling back to source. Error: {}", key, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void set(String key, Object value, Duration ttl) {
        if (!cacheEnabled || key == null || value == null) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(value);
            if (ttl != null && !ttl.isZero() && !ttl.isNegative()) {
                redisTemplate.opsForValue().set(key, json, ttl);
            } else {
                redisTemplate.opsForValue().set(key, json);
            }
            log.info("[REDIS CACHE SET] Key: {} | TTL: {}s", key, ttl != null ? ttl.toSeconds() : "infinite");
        } catch (Exception e) {
            log.warn("Redis SET operation failed for key '{}'. Error: {}", key, e.getMessage());
        }
    }

    @Override
    public void delete(String key) {
        if (!cacheEnabled || key == null || key.isBlank()) {
            return;
        }
        try {
            redisTemplate.delete(key);
            log.info("[REDIS CACHE EVICTED] Key: {}", key);
        } catch (Exception e) {
            log.warn("Redis DELETE operation failed for key '{}'. Error: {}", key, e.getMessage());
        }
    }

    @Override
    public void deleteByPattern(String pattern) {
        if (!cacheEnabled || pattern == null || pattern.isBlank()) {
            return;
        }
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("CACHE EVICTED {} keys matching pattern '{}'", keys.size(), pattern);
            }
        } catch (Exception e) {
            log.warn("Redis DELETE BY PATTERN failed for pattern '{}'. Error: {}", pattern, e.getMessage());
        }
    }

    @Override
    public <T> T getOrLoad(String key, Class<T> clazz, Duration ttl, Supplier<T> loader) {
        Optional<T> cached = get(key, clazz);
        if (cached.isPresent()) {
            return cached.get();
        }
        T fresh = loader.get();
        if (fresh != null) {
            set(key, fresh, ttl);
        }
        return fresh;
    }

    @Override
    public <T> T getOrLoad(String key, TypeReference<T> typeReference, Duration ttl, Supplier<T> loader) {
        Optional<T> cached = get(key, typeReference);
        if (cached.isPresent()) {
            return cached.get();
        }
        T fresh = loader.get();
        if (fresh != null) {
            set(key, fresh, ttl);
        }
        return fresh;
    }

    @Override
    public boolean isAvailable() {
        if (!cacheEnabled) return false;
        try {
            String ping = redisTemplate.getConnectionFactory() != null &&
                    redisTemplate.getConnectionFactory().getConnection().ping() != null ? "PONG" : null;
            return ping != null;
        } catch (Exception e) {
            return false;
        }
    }
}

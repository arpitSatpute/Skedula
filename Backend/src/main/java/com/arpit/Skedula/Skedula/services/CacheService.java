package com.arpit.Skedula.Skedula.services;

import com.fasterxml.jackson.core.type.TypeReference;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Supplier;

public interface CacheService {

    <T> Optional<T> get(String key, Class<T> clazz);

    <T> Optional<T> get(String key, TypeReference<T> typeReference);

    void set(String key, Object value, Duration ttl);

    void delete(String key);

    void deleteByPattern(String pattern);

    <T> T getOrLoad(String key, Class<T> clazz, Duration ttl, Supplier<T> loader);

    <T> T getOrLoad(String key, TypeReference<T> typeReference, Duration ttl, Supplier<T> loader);

    boolean isAvailable();
}

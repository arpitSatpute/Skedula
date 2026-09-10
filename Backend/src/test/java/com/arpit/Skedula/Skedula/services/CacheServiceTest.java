package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.card.BusinessCard;
import com.arpit.Skedula.Skedula.services.Implementation.RedisCacheServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CacheServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private RedisConnectionFactory connectionFactory;

    @Mock
    private RedisConnection redisConnection;

    private ObjectMapper objectMapper;
    private RedisCacheServiceImpl cacheService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        cacheService = new RedisCacheServiceImpl(redisTemplate, objectMapper);
        ReflectionTestUtils.setField(cacheService, "cacheEnabled", true);
    }

    @Test
    void testGet_CacheHit() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        BusinessCard card = new BusinessCard();
        card.setId(10L);
        card.setName("Luxury Spa");
        String json = objectMapper.writeValueAsString(card);

        when(valueOperations.get("v1:business:id:10")).thenReturn(json);

        Optional<BusinessCard> result = cacheService.get("v1:business:id:10", BusinessCard.class);

        assertTrue(result.isPresent());
        assertEquals(10L, result.get().getId());
        assertEquals("Luxury Spa", result.get().getName());
        verify(valueOperations, times(1)).get("v1:business:id:10");
    }

    @Test
    void testGet_CacheMiss() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("v1:business:id:999")).thenReturn(null);

        Optional<BusinessCard> result = cacheService.get("v1:business:id:999", BusinessCard.class);

        assertFalse(result.isPresent());
        verify(valueOperations, times(1)).get("v1:business:id:999");
    }

    @Test
    void testGetOrLoad_CacheHit_DoesNotInvokeLoader() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        BusinessCard card = new BusinessCard();
        card.setId(5L);
        card.setName("Elite Salon");
        String json = objectMapper.writeValueAsString(card);

        when(valueOperations.get("v1:business:id:5")).thenReturn(json);

        AtomicBoolean loaderInvoked = new AtomicBoolean(false);
        BusinessCard result = cacheService.getOrLoad("v1:business:id:5", BusinessCard.class, Duration.ofMinutes(10), () -> {
            loaderInvoked.set(true);
            return new BusinessCard();
        });

        assertNotNull(result);
        assertEquals(5L, result.getId());
        assertFalse(loaderInvoked.get(), "Loader should NOT be invoked when cache hit occurs");
    }

    @Test
    void testGetOrLoad_CacheMiss_InvokesLoaderAndCaches() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("v1:business:id:12")).thenReturn(null);

        BusinessCard freshCard = new BusinessCard();
        freshCard.setId(12L);
        freshCard.setName("Zen Wellness");
        String expectedJson = objectMapper.writeValueAsString(freshCard);

        AtomicBoolean loaderInvoked = new AtomicBoolean(false);
        BusinessCard result = cacheService.getOrLoad("v1:business:id:12", BusinessCard.class, Duration.ofMinutes(10), () -> {
            loaderInvoked.set(true);
            return freshCard;
        });

        assertNotNull(result);
        assertEquals(12L, result.getId());
        assertEquals("Zen Wellness", result.getName());
        assertTrue(loaderInvoked.get(), "Loader must be invoked on cache miss");
        verify(valueOperations, times(1)).set(eq("v1:business:id:12"), eq(expectedJson), eq(Duration.ofMinutes(10)));
    }

    @Test
    void testGetOrLoad_TypeReference_List() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("v1:items")).thenReturn(null);

        List<String> items = List.of("Item A", "Item B", "Item C");
        String expectedJson = objectMapper.writeValueAsString(items);

        List<String> result = cacheService.getOrLoad("v1:items", new TypeReference<List<String>>() {}, Duration.ofMinutes(5), () -> items);

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("Item A", result.get(0));
        verify(valueOperations, times(1)).set(eq("v1:items"), eq(expectedJson), eq(Duration.ofMinutes(5)));
    }

    @Test
    void testDelete() {
        cacheService.delete("v1:business:id:10");
        verify(redisTemplate, times(1)).delete("v1:business:id:10");
    }

    @Test
    void testDeleteByPattern() {
        when(redisTemplate.keys("v1:business:*")).thenReturn(Set.of("v1:business:id:1", "v1:business:id:2"));

        cacheService.deleteByPattern("v1:business:*");

        verify(redisTemplate, times(1)).keys("v1:business:*");
        verify(redisTemplate, times(1)).delete(any(Set.class));
    }

    @Test
    void testFailSafe_FallbackWhenRedisThrowsException() {
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("Redis connection refused"));

        BusinessCard fallbackCard = new BusinessCard();
        fallbackCard.setId(42L);
        fallbackCard.setName("Fallback Haven");

        // Should NOT throw exception, must fallback gracefully to supplier
        BusinessCard result = assertDoesNotThrow(() ->
                cacheService.getOrLoad("v1:business:id:42", BusinessCard.class, Duration.ofMinutes(5), () -> fallbackCard)
        );

        assertNotNull(result);
        assertEquals(42L, result.getId());
        assertEquals("Fallback Haven", result.getName());
    }

    @Test
    void testDisabledCache_AlwaysExecutesLoader() {
        ReflectionTestUtils.setField(cacheService, "cacheEnabled", false);

        BusinessCard directCard = new BusinessCard();
        directCard.setId(99L);
        directCard.setName("Direct DB Card");

        AtomicBoolean loaderInvoked = new AtomicBoolean(false);
        BusinessCard result = cacheService.getOrLoad("v1:business:id:99", BusinessCard.class, Duration.ofMinutes(10), () -> {
            loaderInvoked.set(true);
            return directCard;
        });

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertTrue(loaderInvoked.get());
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void testIsAvailable_Success() {
        when(redisTemplate.getConnectionFactory()).thenReturn(connectionFactory);
        when(connectionFactory.getConnection()).thenReturn(redisConnection);
        when(redisConnection.ping()).thenReturn("PONG");

        assertTrue(cacheService.isAvailable());
    }

    @Test
    void testIsAvailable_Failure() {
        when(redisTemplate.getConnectionFactory()).thenThrow(new RuntimeException("Connection error"));

        assertFalse(cacheService.isAvailable());
    }
}

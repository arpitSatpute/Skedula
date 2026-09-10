package com.arpit.Skedula.Skedula.configs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaMigration implements CommandLineRunner {
            
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking and migrating database column types...");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS business_service_offered ALTER COLUMN image_url TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS business ALTER COLUMN image_url TYPE TEXT;");
            log.info("Database migration executed successfully: image_url columns set to TEXT.");
        } catch (Exception e) {
            log.warn("Database schema migration notice (already altered or table not found): {}", e.getMessage());
        }
    }
}

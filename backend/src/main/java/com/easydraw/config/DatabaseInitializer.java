package com.easydraw.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Configuration
public class DatabaseInitializer {

    @Value("${spring.datasource.initialization.mode:never}")
    private String initializationMode;

    @Bean
    public CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            if ("always".equalsIgnoreCase(initializationMode) || "embedded".equalsIgnoreCase(initializationMode)) {
                System.out.println("Starting database initialization...");
                try {
                    ClassPathResource resource = new ClassPathResource("schema.sql");
                    if (resource.exists()) {
                        try (BufferedReader reader = new BufferedReader(
                                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                            
                            String sqlContent = reader.lines()
                                    .filter(line -> !line.trim().isEmpty() && !line.trim().startsWith("--"))
                                    .collect(Collectors.joining(" "));
                            
                            String[] statements = sqlContent.split(";");
                            int successCount = 0;
                            int errorCount = 0;
                            
                            for (String statement : statements) {
                                String trimmedStatement = statement.trim();
                                if (!trimmedStatement.isEmpty()) {
                                    try {
                                        jdbcTemplate.execute(trimmedStatement);
                                        successCount++;
                                    } catch (Exception e) {
                                        errorCount++;
                                        System.err.println("Error executing SQL: " + trimmedStatement);
                                        System.err.println("Error message: " + e.getMessage());
                                    }
                                }
                            }
                            
                            System.out.println("Database initialization completed!");
                            System.out.println("Total statements: " + statements.length);
                            System.out.println("Successfully executed: " + successCount);
                            System.out.println("Failed statements: " + errorCount);
                        }
                    } else {
                        System.err.println("Schema file not found: schema.sql");
                    }
                } catch (Exception e) {
                    System.err.println("Error initializing database: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Database initialization is disabled (mode: " + initializationMode + ")");
            }
        };
    }
}

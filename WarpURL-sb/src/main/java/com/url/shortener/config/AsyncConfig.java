package com.url.shortener.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Asynchronous execution configuration for non-blocking click telemetry.
 * Decouples DB click logging from the HTTP 302 redirection critical path.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    public static final String TELEMETRY_EXECUTOR = "telemetryExecutor";

    @Bean(name = TELEMETRY_EXECUTOR)
    public Executor telemetryExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(25);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("warp-telemetry-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

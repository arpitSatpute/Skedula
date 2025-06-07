package com.arpit.Skedula.Skedula.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Before("execution(* com.arpit.Skedula.Skedula.services.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        log.info("Entering method: {}() ", methodName);
    }

    @AfterReturning(pointcut = "execution(* com.arpit.Skedula.Skedula.services.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        log.info("Exiting method: {}() with result: {}", methodName, result != null ? result : "void");
    }

    @AfterThrowing(pointcut = "execution(* com.arpit.Skedula.Skedula.services.*.*(..))", throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        String methodName = joinPoint.getSignature().getName();
        log.error("Exception in method: {}() with error: {}", methodName, error.getMessage());
    }

    @Around("execution(* com.arpit.Skedula.Skedula.services.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object proceed = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - start;
        log.info("Method {} executed in {} ms", joinPoint.getSignature().getName(), executionTime);
        return proceed;
    }
}

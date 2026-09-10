package com.arpit.Skedula.Skedula;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.CrossOrigin;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class SkedulaApplication {
	public static void main(String[] args) {
		SpringApplication.run(SkedulaApplication.class, args);
	}
}

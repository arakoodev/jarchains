package com.edgechain;

import com.jezhumble.javasysmon.JavaSysMon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;

@SpringBootApplication
@EnableScheduling
public class EdgeChainApplication {

  private static final Logger logger = LoggerFactory.getLogger(EdgeChainApplication.class);

  public static void main(String[] args) {

    System.setProperty("jar.name", getJarFileName(EdgeChainApplication.class));
    logger.info("Executed jar file: " + System.getProperty("jar.name"));

    SpringApplication springApplication =
        new SpringApplicationBuilder()
            .sources(EdgeChainApplication.class)
            .web(WebApplicationType.NONE)
            .build();

    springApplication.run(args);
  }

  @Bean(name = "mvcHandlerMappingIntrospector")
  public HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
    return new HandlerMappingIntrospector();
  }

  private static String getJarFileName(Class<?> clazz) {
    URL classResource = clazz.getResource(clazz.getSimpleName() + ".class");
    if (classResource == null) {
      throw new RuntimeException("class resource is null");
    }
    String url = classResource.toString();
    if (url.startsWith("jar:file:")) {
      String path = url.replaceAll("^jar:(file:.*[.]jar)!/.*", "$1");
      try {
        return Paths.get(new URL(path).toURI()).toString();
      } catch (Exception e) {
        throw new RuntimeException("Invalid jar file");
      }
    }
    throw new RuntimeException("Invalid jar file");
  }
}

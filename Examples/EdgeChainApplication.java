package com.edgechain.app;

import com.edgechain.lib.configuration.EdgeChainAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.context.annotation.Import;

@SpringBootApplication(scanBasePackages = {"com.edgechain.app"})
@ImportAutoConfiguration({FeignAutoConfiguration.class})
@Import(EdgeChainAutoConfiguration.class)
public class EdgeChainApplication {


  public static void main(String[] args) {


    System.setProperty("server.port", "8003");

    System.setProperty("OPENAI_AUTH_KEY", "");
    System.setProperty("PINECONE_AUTH_KEY", "");

    System.setProperty("PINECONE_QUERY_API", "");
    System.setProperty("PINECONE_UPSERT_API", "");
    System.setProperty("PINECONE_DELETE_API", "");

    System.setProperty("spring.data.redis.host","");
    System.setProperty("spring.data.redis.port","");
    System.setProperty("spring.data.redis.username","");
    System.setProperty("spring.data.redis.password", "");
    System.setProperty("spring.data.redis.connect-timeout","120000");

    SpringApplication.run(EdgeChainApplication.class, args);


  }


}

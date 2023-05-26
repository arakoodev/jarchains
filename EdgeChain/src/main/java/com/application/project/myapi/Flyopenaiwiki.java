//package com.application.project.myapi;
//
//import com.app.openai.endpoint.Endpoint;
//import com.app.rxjava.retry.impl.ExponentialDelay;
//import com.application.project.services.ToolService;
//import com.application.project.services.PluginService;
//import com.application.project.services.impl.ReactChain;
//import com.application.project.services.impl.WikiPluginServiceImpl;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import reactor.core.publisher.Mono;
//
//import java.util.concurrent.TimeUnit;
//
//@RestController
//public class Flyopenaiwiki {
//  private static final String OPENAI_CHAT_COMPLETION_API = "https://api.openai.com/v1/chat/completions";
//  private static final String OPENAI_API_KEY = "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";
//
//  @GetMapping("/openaiwiki")
//  public Mono<String> flyget(@RequestParam("query") String question) {
//
//    Endpoint endpoint =
//            new Endpoint(
//                    OPENAI_CHAT_COMPLETION_API,
//                    OPENAI_API_KEY,
//                    "gpt-3.5-turbo",
//                    "user",
//                    new ExponentialDelay(2, 3, 2, TimeUnit.SECONDS));
//
//    PluginService wikiClientService = new WikiPluginServiceImpl();
//    ToolService[] ToolArray = {wikiClientService};
//
//    ReactChain rc = new ReactChain(endpoint, question, ToolArray);
//
//    return rc.getResponse();
//  }
//}
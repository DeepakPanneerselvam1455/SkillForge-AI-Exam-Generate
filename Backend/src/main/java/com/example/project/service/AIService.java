package com.example.project.service;

import com.example.project.model.AIRequest;
import com.example.project.model.User;
import com.example.project.repository.AIRequestRepository;
import com.example.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final AIRequestRepository aiRequestRepository;
    private final UserRepository userRepository;

    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.ai.base-url}")
    private String aiBaseUrl;

    @Value("${google.ai.model}")
    private String model;

    public AIService(AIRequestRepository aiRequestRepository, UserRepository userRepository) {
        this.aiRequestRepository = aiRequestRepository;
        this.userRepository = userRepository;
    }

    public AIRequest analyze(String username, String prompt) {
        User user = userRepository.findByUsername(username).orElseThrow();
        AIRequest request = AIRequest.builder().user(user).inputText(prompt).build();

        String url = aiBaseUrl + "/models/" + model + ":generateContent?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", prompt)})
                }
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        String text = "";
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                Object candidates = response.getBody().get("candidates");
                if (candidates instanceof java.util.List<?> list && !list.isEmpty()) {
                    Object first = list.get(0);
                    if (first instanceof Map<?, ?> fm) {
                        Object content = fm.get("content");
                        if (content instanceof Map<?, ?> cm) {
                            Object parts = cm.get("parts");
                            if (parts instanceof java.util.List<?> pm && !pm.isEmpty()) {
                                Object p0 = pm.get(0);
                                if (p0 instanceof Map<?, ?> p0m) {
                                    Object txt = p0m.get("text");
                                    text = txt != null ? txt.toString() : "";
                                }
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                text = "";
            }
        }
        request.setAiResponse(text);
        return aiRequestRepository.save(request);
    }
}



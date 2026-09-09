package com.rslsolution.speakmateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.ChatRequest;
import com.rslsolution.speakmateai.dto.response.ChatResponse;
import com.rslsolution.speakmateai.service.ChatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat-legacy")
public class ChatController {

	private final ChatService chatService;

	public ChatController(ChatService chatService) {
		this.chatService = chatService;
	}

	@PostMapping("/message")
	public ChatResponse sendMessage(@Valid @RequestBody ChatRequest request) {
		return chatService.sendMessage(request);
	}

	@GetMapping("/history")
	public List<ChatResponse> getChatHistory() {
		return chatService.getChatHistory();
	}

	@GetMapping("/history/{conversationId}")
	public List<ChatResponse> getConversation(@PathVariable String conversationId) {

		return chatService.getConversation(conversationId);
	}

	@DeleteMapping("/delete-history/{conversationId}")
	public String deleteConversation(@PathVariable String conversationId) {

		chatService.deleteConversation(conversationId);

		return "Conversation deleted successfully.";
	}
}
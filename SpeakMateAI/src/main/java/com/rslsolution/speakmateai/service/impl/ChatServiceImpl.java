package com.rslsolution.speakmateai.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.ChatRequest;
import com.rslsolution.speakmateai.dto.response.ChatResponse;
import com.rslsolution.speakmateai.entity.ChatHistory;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.exception.ChatNotFoundException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.ChatHistoryRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.ChatService;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

	private final ChatHistoryRepository chatHistoryRepository;
	private final UserRepository userRepository;

	public ChatServiceImpl(ChatHistoryRepository chatHistoryRepository, UserRepository userRepository) {
		this.chatHistoryRepository = chatHistoryRepository;
		this.userRepository = userRepository;
	}

	@Override
	public ChatResponse sendMessage(ChatRequest request) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));

		String aiResponse = "AI integration will be implemented in the next phase.";

		ChatHistory chat = ChatHistory.builder().user(user).userMessage(request.getMessage()).aiResponse(aiResponse)
				.conversationId(request.getConversationId()).build();

		ChatHistory savedChat = chatHistoryRepository.save(chat);

		return ChatResponse.builder().id(savedChat.getId()).userMessage(savedChat.getUserMessage())
				.aiResponse(savedChat.getAiResponse()).conversationId(savedChat.getConversationId())
				.createdAt(savedChat.getCreatedAt()).build();
	}

	@Override
	public List<ChatResponse> getChatHistory() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		return chatHistoryRepository.findByUserOrderByCreatedAtAsc(user).stream()
				.map(chat -> ChatResponse.builder().id(chat.getId()).userMessage(chat.getUserMessage())
						.aiResponse(chat.getAiResponse()).conversationId(chat.getConversationId())
						.createdAt(chat.getCreatedAt()).build())
				.toList();
	}

	@Override
	public List<ChatResponse> getConversation(String conversationId) {

		List<ChatHistory> chats = chatHistoryRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

		if (chats.isEmpty()) {
			throw new ChatNotFoundException("Conversation not found.");
		}

		return chats.stream()
				.map(chat -> ChatResponse.builder().id(chat.getId()).userMessage(chat.getUserMessage())
						.aiResponse(chat.getAiResponse()).conversationId(chat.getConversationId())
						.createdAt(chat.getCreatedAt()).build())
				.toList();
	}

	@Override
	public void deleteConversation(String conversationId) {

		List<ChatHistory> chats = chatHistoryRepository.findByConversationId(conversationId);

		if (chats.isEmpty()) {
			throw new ChatNotFoundException("Conversation not found.");
		}

		chatHistoryRepository.deleteByConversationId(conversationId);
	}
}
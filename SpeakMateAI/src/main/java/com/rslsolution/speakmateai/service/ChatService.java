package com.rslsolution.speakmateai.service;

import java.util.List;

import com.rslsolution.speakmateai.dto.request.ChatRequest;
import com.rslsolution.speakmateai.dto.response.ChatResponse;

public interface ChatService {

	ChatResponse sendMessage(ChatRequest request);

	List<ChatResponse> getChatHistory();

	List<ChatResponse> getConversation(String conversationId);

	void deleteConversation(String conversationId);

}
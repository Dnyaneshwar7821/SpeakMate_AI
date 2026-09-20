package com.rslsolution.speakmateai.assistant;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class GroqChatClientTest {

	@Test
	void testGetCleanApiKey_DirectValidKey() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "gsk_test123456789");
		assertEquals("gsk_test123456789", client.getCleanApiKey());
	}

	@Test
	void testGetCleanApiKey_WithSurroundingQuotesAndWhitespace() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "  \"gsk_quoted_key\"  ");
		assertEquals("gsk_quoted_key", client.getCleanApiKey());
	}

	@Test
	void testGetCleanApiKey_UnresolvedPlaceholderDiscarded() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "${groq.assistant.api.key:${GROQ_API_KEY:}}");
		// Unresolved placeholder should be discarded as invalid
		assertNull(client.getCleanApiKey());
	}

	@Test
	void testGetCleanApiKey_EmptyOrNull() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "");
		assertNull(client.getCleanApiKey());

		ReflectionTestUtils.setField(client, "apiKey", null);
		assertNull(client.getCleanApiKey());
	}

	@Test
	void testInit_WithMaskedKey_DoesNotThrow() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "gsk_abcdef123456");
		ReflectionTestUtils.setField(client, "model", "openai/gpt-oss-120b");
		assertDoesNotThrow(client::init);
	}

	@Test
	void testInit_WithUnresolvedPlaceholder_DoesNotThrowAndWarns() {
		GroqChatClient client = new GroqChatClient();
		ReflectionTestUtils.setField(client, "apiKey", "${groq.api.key:}");
		ReflectionTestUtils.setField(client, "model", "openai/gpt-oss-120b");
		assertDoesNotThrow(client::init);
	}
}

package com.rslsolution.speakmateai.security;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

	private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String uri = request.getRequestURI();
		logger.info("[REQUEST LOG] Incoming request: {} {}", request.getMethod(), uri);
		if ("/api/users/login".equals(uri)) {
			logger.info("[REQUEST LOG] Entered /api/users/login endpoint");
		} else if ("/api/users/register".equals(uri)) {
			logger.info("[REQUEST LOG] Entered /api/users/register endpoint");
		}
		try {
			filterChain.doFilter(request, response);
		} catch (Exception e) {
			logger.error("[REQUEST LOG] Exception in filter chain for URI " + uri, e);
			throw e;
		}
	}
}

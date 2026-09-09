package com.rslsolution.speakmateai.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.rslsolution.speakmateai.entity.Admin;
import com.rslsolution.speakmateai.enums.AdminStatus;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AdminJwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
	private final AdminRepository adminRepository;

	public AdminJwtAuthenticationFilter(JwtUtil jwtUtil, AdminRepository adminRepository) {
		this.jwtUtil = jwtUtil;
		this.adminRepository = adminRepository;
	}

	private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AdminJwtAuthenticationFilter.class);

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getServletPath();
		// This filter ONLY runs for /api/admin/ endpoints. So it should not filter (i.e. return true) for everything else.
		return !path.startsWith("/api/admin/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");

		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authHeader.substring(7);

		try {
			if (token != null && !token.isBlank() && !"null".equals(token) && !"undefined".equals(token)) {
				// Assert type claim is ADMIN
				String type = null;
				try {
					type = jwtUtil.extractClaims(token).get("type", String.class);
				} catch (Exception e) {
					// ignore parsing issues
				}

				if ("ADMIN".equals(type)) {
					String email = jwtUtil.extractEmail(token);

					if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
						Admin admin = adminRepository.findByEmail(email).orElse(null);

						if (admin != null && admin.getStatus() == AdminStatus.ACTIVE) {
							if (jwtUtil.isTokenValid(token, admin.getEmail())) {
								UserDetails userDetails = org.springframework.security.core.userdetails.User
										.withUsername(admin.getEmail())
										.password(admin.getPassword())
										.roles(admin.getRole().name())
										.build();

								UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
										userDetails, null, userDetails.getAuthorities());

								authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

								SecurityContextHolder.getContext().setAuthentication(authentication);
							}
						}
					}
				}
			}
		} catch (Exception e) {
			logger.warn("[Admin JWT Filter] Token validation failed: {}", e.getMessage());
		}

		filterChain.doFilter(request, response);
	}
}

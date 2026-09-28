package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {

	private Integer rank;
	private Long userId;
	private String name;
	private String avatar;
	private Integer xp;
	private Integer streak;
	private String rankTier;
	private Boolean isCurrentUser;

	public Integer getRank() { return rank; }
	public void setRank(Integer rank) { this.rank = rank; }

	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getAvatar() { return avatar; }
	public void setAvatar(String avatar) { this.avatar = avatar; }

	public Integer getXp() { return xp; }
	public void setXp(Integer xp) { this.xp = xp; }

	public Integer getStreak() { return streak; }
	public void setStreak(Integer streak) { this.streak = streak; }

	public String getRankTier() { return rankTier; }
	public void setRankTier(String rankTier) { this.rankTier = rankTier; }

	public Boolean getIsCurrentUser() { return isCurrentUser; }
	public void setIsCurrentUser(Boolean isCurrentUser) { this.isCurrentUser = isCurrentUser; }

	public static LeaderboardResponseBuilder builder() {
		return new LeaderboardResponseBuilder();
	}

	public static class LeaderboardResponseBuilder {
		private Integer rank;
		private Long userId;
		private String name;
		private String avatar;
		private Integer xp;
		private Integer streak;
		private String rankTier;
		private Boolean isCurrentUser;

		public LeaderboardResponseBuilder rank(Integer rank) { this.rank = rank; return this; }
		public LeaderboardResponseBuilder userId(Long userId) { this.userId = userId; return this; }
		public LeaderboardResponseBuilder name(String name) { this.name = name; return this; }
		public LeaderboardResponseBuilder avatar(String avatar) { this.avatar = avatar; return this; }
		public LeaderboardResponseBuilder xp(Integer xp) { this.xp = xp; return this; }
		public LeaderboardResponseBuilder streak(Integer streak) { this.streak = streak; return this; }
		public LeaderboardResponseBuilder rankTier(String rankTier) { this.rankTier = rankTier; return this; }
		public LeaderboardResponseBuilder isCurrentUser(Boolean isCurrentUser) { this.isCurrentUser = isCurrentUser; return this; }

		public LeaderboardResponse build() {
			LeaderboardResponse obj = new LeaderboardResponse();
			obj.setRank(rank);
			obj.setUserId(userId);
			obj.setName(name);
			obj.setAvatar(avatar);
			obj.setXp(xp);
			obj.setStreak(streak);
			obj.setRankTier(rankTier);
			obj.setIsCurrentUser(isCurrentUser);
			return obj;
		}
	}
}

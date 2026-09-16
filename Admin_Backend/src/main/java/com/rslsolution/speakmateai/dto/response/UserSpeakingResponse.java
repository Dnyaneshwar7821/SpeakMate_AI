package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSpeakingResponse {
    
    private int totalSpeakingSessions;
    private double averageSpeakingScore;
    private int totalSpeakingMinutes;
    private LocalDateTime lastSpeakingDate;
    private double bestSpeakingScore;

    private SpeakingSessionDetailResponse latestSession;
    private List<SpeakingSessionDetailResponse> recentSessions;

    public int getTotalSpeakingSessions() { return totalSpeakingSessions; }
    public void setTotalSpeakingSessions(int totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

    public double getAverageSpeakingScore() { return averageSpeakingScore; }
    public void setAverageSpeakingScore(double averageSpeakingScore) { this.averageSpeakingScore = averageSpeakingScore; }

    public int getTotalSpeakingMinutes() { return totalSpeakingMinutes; }
    public void setTotalSpeakingMinutes(int totalSpeakingMinutes) { this.totalSpeakingMinutes = totalSpeakingMinutes; }

    public LocalDateTime getLastSpeakingDate() { return lastSpeakingDate; }
    public void setLastSpeakingDate(LocalDateTime lastSpeakingDate) { this.lastSpeakingDate = lastSpeakingDate; }

    public double getBestSpeakingScore() { return bestSpeakingScore; }
    public void setBestSpeakingScore(double bestSpeakingScore) { this.bestSpeakingScore = bestSpeakingScore; }

    public SpeakingSessionDetailResponse getLatestSession() { return latestSession; }
    public void setLatestSession(SpeakingSessionDetailResponse latestSession) { this.latestSession = latestSession; }

    public List<SpeakingSessionDetailResponse> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<SpeakingSessionDetailResponse> recentSessions) { this.recentSessions = recentSessions; }

    public static UserSpeakingResponseBuilder builder() {
        return new UserSpeakingResponseBuilder();
    }

    public static class UserSpeakingResponseBuilder {
        private int totalSpeakingSessions;
        private double averageSpeakingScore;
        private int totalSpeakingMinutes;
        private LocalDateTime lastSpeakingDate;
        private double bestSpeakingScore;
        private SpeakingSessionDetailResponse latestSession;
        private List<SpeakingSessionDetailResponse> recentSessions;

        public UserSpeakingResponseBuilder totalSpeakingSessions(int totalSpeakingSessions) {
            this.totalSpeakingSessions = totalSpeakingSessions;
            return this;
        }

        public UserSpeakingResponseBuilder averageSpeakingScore(double averageSpeakingScore) {
            this.averageSpeakingScore = averageSpeakingScore;
            return this;
        }

        public UserSpeakingResponseBuilder totalSpeakingMinutes(int totalSpeakingMinutes) {
            this.totalSpeakingMinutes = totalSpeakingMinutes;
            return this;
        }

        public UserSpeakingResponseBuilder lastSpeakingDate(LocalDateTime lastSpeakingDate) {
            this.lastSpeakingDate = lastSpeakingDate;
            return this;
        }

        public UserSpeakingResponseBuilder bestSpeakingScore(double bestSpeakingScore) {
            this.bestSpeakingScore = bestSpeakingScore;
            return this;
        }

        public UserSpeakingResponseBuilder latestSession(SpeakingSessionDetailResponse latestSession) {
            this.latestSession = latestSession;
            return this;
        }

        public UserSpeakingResponseBuilder recentSessions(List<SpeakingSessionDetailResponse> recentSessions) {
            this.recentSessions = recentSessions;
            return this;
        }

        public UserSpeakingResponse build() {
            UserSpeakingResponse obj = new UserSpeakingResponse();
            obj.setTotalSpeakingSessions(totalSpeakingSessions);
            obj.setAverageSpeakingScore(averageSpeakingScore);
            obj.setTotalSpeakingMinutes(totalSpeakingMinutes);
            obj.setLastSpeakingDate(lastSpeakingDate);
            obj.setBestSpeakingScore(bestSpeakingScore);
            obj.setLatestSession(latestSession);
            obj.setRecentSessions(recentSessions);
            return obj;
        }
    }
}

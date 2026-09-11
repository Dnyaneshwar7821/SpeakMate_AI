package com.rslsolution.speakmateai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Teacher extends User {

    private String employeeId;
    private String department;
    private String designation;
    private String experience;
    private String qualification;
    private java.time.LocalDateTime joinedAt;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 255)
    private String location;
}

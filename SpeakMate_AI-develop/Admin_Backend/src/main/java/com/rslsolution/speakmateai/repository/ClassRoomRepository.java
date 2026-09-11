package com.rslsolution.speakmateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rslsolution.speakmateai.entity.ClassRoom;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
	List<ClassRoom> findBySchoolId(Long schoolId);
	List<ClassRoom> findByTeacherId(Long teacherId);
	List<ClassRoom> findByTeacherIdIn(List<Long> teacherIds);
}

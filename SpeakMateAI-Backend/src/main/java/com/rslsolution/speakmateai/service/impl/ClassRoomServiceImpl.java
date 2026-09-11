package com.rslsolution.speakmateai.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.ClassRoomRequest;
import com.rslsolution.speakmateai.dto.request.ClassStudentRequest;
import com.rslsolution.speakmateai.dto.response.ClassRoomResponse;
import com.rslsolution.speakmateai.entity.ClassRoom;
import com.rslsolution.speakmateai.entity.ClassStudent;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.ClassStudentRepository;
import com.rslsolution.speakmateai.service.ClassRoomService;

@Service
public class ClassRoomServiceImpl implements ClassRoomService {

	private final ClassRoomRepository classRoomRepository;
	private final ClassStudentRepository classStudentRepository;

	public ClassRoomServiceImpl(ClassRoomRepository classRoomRepository, ClassStudentRepository classStudentRepository) {
		this.classRoomRepository = classRoomRepository;
		this.classStudentRepository = classStudentRepository;
	}

	@Override
	public ClassRoomResponse createClassRoom(ClassRoomRequest request) {
		ClassRoom classRoom = ClassRoom.builder()
				.schoolId(request.getSchoolId())
				.name(request.getName())
				.grade(request.getGrade())
				.academicYear(request.getAcademicYear())
				.teacherId(request.getTeacherId())
				.status(request.getStatus())
				.build();

		ClassRoom saved = classRoomRepository.save(classRoom);
		return mapToResponse(saved);
	}

	@Override
	public List<ClassRoomResponse> getAllClassRooms(Long schoolId) {
		List<ClassRoom> classes;
		if (schoolId != null) {
			classes = classRoomRepository.findBySchoolId(schoolId);
		} else {
			classes = classRoomRepository.findAll();
		}
		return classes.stream().map(this::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public ClassRoomResponse updateClassRoom(Long id, ClassRoomRequest request) {
		ClassRoom classRoom = classRoomRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Class room not found"));

		classRoom.setSchoolId(request.getSchoolId());
		classRoom.setName(request.getName());
		classRoom.setGrade(request.getGrade());
		classRoom.setAcademicYear(request.getAcademicYear());
		classRoom.setTeacherId(request.getTeacherId());
		classRoom.setStatus(request.getStatus());

		ClassRoom updated = classRoomRepository.save(classRoom);
		return mapToResponse(updated);
	}

	@Override
	public void deleteClassRoom(Long id) {
		classRoomRepository.deleteById(id);
	}

	@Override
	public List<Long> getStudentsInClass(Long classId) {
		return classStudentRepository.findByClassId(classId)
				.stream()
				.map(ClassStudent::getStudentId)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void addStudentsToClass(Long classId, ClassStudentRequest request) {
		// Verify class exists
		classRoomRepository.findById(classId)
				.orElseThrow(() -> new RuntimeException("Class room not found"));

		for (Long studentId : request.getStudentIds()) {
			if (!classStudentRepository.existsByClassIdAndStudentId(classId, studentId)) {
				ClassStudent cs = ClassStudent.builder()
						.classId(classId)
						.studentId(studentId)
						.build();
				classStudentRepository.save(cs);
			}
		}
	}

	private ClassRoomResponse mapToResponse(ClassRoom classRoom) {
		return ClassRoomResponse.builder()
				.id(classRoom.getId())
				.schoolId(classRoom.getSchoolId())
				.name(classRoom.getName())
				.grade(classRoom.getGrade())
				.academicYear(classRoom.getAcademicYear())
				.teacherId(classRoom.getTeacherId())
				.status(classRoom.getStatus())
				.build();
	}
}

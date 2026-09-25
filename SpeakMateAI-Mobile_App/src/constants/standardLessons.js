/**
 * Standard-Curated Lessons Dataset (1st Std to 10th Std & General Tracks)
 * Backed by the Master 120 Academic Curriculum
 */
import { MASTER_LESSONS, getLessonsForSchoolGrade, getLessonsForAgeGroup, findCurriculumLesson } from './masterCurriculum';

export const STANDARD_LESSONS = {
  '1st Std': getLessonsForSchoolGrade('1st Std'),
  '2nd Std': getLessonsForSchoolGrade('2nd Std'),
  '3rd Std': getLessonsForSchoolGrade('3rd Std'),
  '4th Std': getLessonsForSchoolGrade('4th Std'),
  '5th Std': getLessonsForSchoolGrade('5th Std'),
  '6th Std': getLessonsForSchoolGrade('6th Std'),
  '7th Std': getLessonsForSchoolGrade('7th Std'),
  '8th Std': getLessonsForSchoolGrade('8th Std'),
  '9th Std': getLessonsForSchoolGrade('9th Std'),
  '10th Std': getLessonsForSchoolGrade('10th Std'),
};

export const GENERAL_LESSONS = {
  'Kids (Age 6–12)': getLessonsForAgeGroup('Kids (Age 6–12)'),
  'Teens & Young Adults (Age 13–24)': getLessonsForAgeGroup('Teens & Young Adults (Age 13–24)'),
  'Professionals & Seniors (Age 25+)': getLessonsForAgeGroup('Professionals & Seniors (Age 25+)'),
};

export function findStandardLesson(idOrTitle) {
  return findCurriculumLesson(idOrTitle);
}

export { MASTER_LESSONS, getLessonsForSchoolGrade, getLessonsForAgeGroup };

const fs = require('fs');
let c = fs.readFileSync('src/main/java/com/rslsolution/speakmateai/service/impl/TeacherServiceImpl.java', 'utf8');

const targetStr = `	public TeacherStudentsListResponse getStudents(String search, String status, String standard) {
		User teacher = getCurrentTeacher();`;

const replacementStr = `	public TeacherStudentsListResponse getStudents(String search, String status, String standard) {
        try {
            return _getStudentsInternal(search, status, standard);
        } catch (Exception e) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter("getStudentsError.txt");
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            throw e;
        }
    }
    
    private TeacherStudentsListResponse _getStudentsInternal(String search, String status, String standard) {
		User teacher = getCurrentTeacher();`;

if (!c.includes('_getStudentsInternal')) {
    c = c.replace(targetStr, replacementStr);
    fs.writeFileSync('src/main/java/com/rslsolution/speakmateai/service/impl/TeacherServiceImpl.java', c);
    console.log('Injected try/catch!');
} else {
    console.log('Already injected.');
}

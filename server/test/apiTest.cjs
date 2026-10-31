const http = require('http');

function req(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  try {
    const login = await req('/api/v1/auth/login', 'POST', { studentNo: '20240001', password: 'demo123456' });
    const loginData = JSON.parse(login.body);
    console.log('login status:', login.status, 'token_len:', loginData.token?.length);

    const token = loginData.token;
    const tests = [
      ['words', '/api/v1/words'],
      ['grammar', '/api/v1/grammar'],
      ['checkpoints', '/api/v1/checkin/checkpoints'],
      ['messages', '/api/v1/messages'],
      ['exercise_records', '/api/v1/exercises/records'],
      ['checkin_records', '/api/v1/checkin/records'],
    ];

    for (const [name, path] of tests) {
      const r = await req(path, 'GET', null, token);
      console.log(`${name}: [${r.status}]`, r.body.slice(0, 150));
    }

    const adminLogin = await req('/api/v1/auth/login', 'POST', { studentNo: 'admin', password: 'admin123456' });
    const adminToken = JSON.parse(adminLogin.body).token;
    const importTest = await req('/api/v1/admin/import/words', 'POST', null, adminToken);
    console.log('admin_import (no file):', `[${importTest.status}]`, importTest.body.slice(0, 150));

    const teacherLogin = await req('/api/v1/auth/login', 'POST', { studentNo: 'T0001', password: 'demo123456' });
    const teacherData = JSON.parse(teacherLogin.body);
    console.log('teacher login:', teacherLogin.status, 'token_len:', teacherData.token?.length);
    const teacherToken = teacherData.token;

    const teacherClasses = await req('/api/v1/teacher/classes', 'GET', null, teacherToken);
    console.log('teacher_classes:', `[${teacherClasses.status}]`, teacherClasses.body.slice(0, 200));

    const teacherStudents = await req('/api/v1/teacher/students', 'GET', null, teacherToken);
    console.log('teacher_students:', `[${teacherStudents.status}]`, teacherStudents.body.slice(0, 300));

    const templatesList = await req('/api/v1/admin/templates', 'GET', null, adminToken);
    console.log('admin_templates:', `[${templatesList.status}]`, templatesList.body.slice(0, 200));

    const createTemplate = await req('/api/v1/admin/templates', 'POST', {
      code: 'checkin_reminder',
      title: '打卡提醒',
      body: '亲爱的{{studentName}}，请记得在{{checkpointName}}完成打卡',
      variables: ['studentName', 'checkpointName']
    }, adminToken);
    console.log('create_template:', `[${createTemplate.status}]`, createTemplate.body.slice(0, 200));

    const templatesList2 = await req('/api/v1/admin/templates', 'GET', null, adminToken);
    console.log('admin_templates_after_create:', `[${templatesList2.status}]`, templatesList2.body.slice(0, 300));

    const studentForbidden = await req('/api/v1/teacher/students', 'GET', null, token);
    console.log('student_access_teacher (should 403):', `[${studentForbidden.status}]`, studentForbidden.body.slice(0, 150));

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
})();
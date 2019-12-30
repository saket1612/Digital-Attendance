const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');//
var ssn;
var MySql = require('sync-mysql');

const app = express();// creating our app
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: false
}));

var connection = new MySql({
	host: 'localhost',
	user: "root",
	password: "",
	port: 3306,
	database: 'digi_attendance'
});

app.get('/', function (request, response) {

	response.render('index.html');
})





var Storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, "./public/Images");
	},
	filename: function (req, file, callback) {
		callback(null, ssn.rollno + "_" + ssn.department + "_" + ssn.section + '_' + ssn.semester + ".jpeg");
	}
});

var upload = multer({
	storage: Storage,
	limits: {
		fileSize: 4 * 1024 * 1024,
	}
}).array("imgUploader", 3); //F

app.post("/upload", function (req, res) {
	upload(req, res, function (err) {
		if (err) {
			return res.end("Something went wrong!");
		}
		else {
			connection.query('Update student set image=1 where rollno=?', [ssn.rollno]);
			return res.end("File uploaded sucessfully!.");
		}
	});
});


app.post('/add_allcourses', function (request, response) {
	let c1 = request.body.course1;
	let c2 = request.body.course2;
	let c3 = request.body.course3;
	let c4 = request.body.course4;
	let c5 = request.body.course5;
	let c6 = request.body.course6;
	let c7 = request.body.course7;
	let c8 = request.body.course8;
	let o1 = request.body.open;
	let to_add = ":-1:-1:-1";
	let crs1 = connection.query('Select course_code from courses where course_name=?', [c1]);
	let crs2 = connection.query('Select course_code from courses where course_name=?', [c2]);
	let crs3 = connection.query('Select course_code from courses where course_name=?', [c3]);
	let crs4 = connection.query('Select course_code from courses where course_name=?', [c4]);
	let crs5 = connection.query('Select course_code from courses where course_name=?', [c5]);
	if (o1 != "null") {
		let opn1 = connection.query('Select course_code from courses where course_name=?', [o1]);
		connection.query('Update student set course1=?,course2=?,course3=?,course4=?,course5=?,openele=? where ' +
			'rollno=?', [crs1[0].course_code + to_add, crs2[0].course_code + to_add, crs3[0].course_code + to_add, crs4[0].course_code + to_add, crs5[0].course_code + to_add, opn1[0].course_code + to_add, ssn.rollno]);
	}
	else if (c8 != "null") {
		let crs6 = connection.query('Select course_code from courses where course_name=?', [c6]);
		let crs7 = connection.query('Select course_code from courses where course_name=?', [c7]);
		let crs8 = connection.query('Select course_code from courses where course_name=?', [c8]);
		connection.query('Update student set course1=?,course2=?,course3=?,course4=?,course5=?,course6=?,course7=?,' +
			'course8=? where rollno=?',
			[crs1[0].course_code + to_add, crs2[0].course_code + to_add, crs3[0].course_code + to_add, crs4[0].course_code + to_add, crs5[0].course_code + to_add, crs6[0].course_code + to_add, crs7[0].course_code + to_add, crs8[0].course_code + to_add, ssn.rollno]);
	}
	else {
		let crs6 = connection.query('Select course_code from courses where course_name=?', [c6]);
		connection.query('Update student set course1=?,course2=?,course3=?,course4=?,course5=?,course6=? where rollno=?',
			[crs1[0].course_code + to_add, crs2[0].course_code + to_add, crs3[0].course_code + to_add, crs4[0].course_code + to_add, crs5[0].course_code + to_add, crs6[0].course_code + to_add, ssn.rollno]);
	}
})



app.get('/registercourses', function (request, response) {
	let open_courses = connection.query('Select course_name from openelective,courses where ' +
		'openelective.course_code=courses.course_code');
	let res = connection.query('Select department from student where rollno=?', [ssn.rollno]);
	let all_courses = connection.query('Select course_name from courses where courses.department=?', [res[0].department]);
	response.render('openelective.html', { 'opensubjects': open_courses, 'allsubjects': all_courses });
})





app.post('/studentlogin', function (request, response) {

	let user = request.body.uname;
	let u_pass = request.body.passs;
	ssn = request.session;
	ssn.rollno = user;
	let details = connection.query('select department,semester,section from student where rollno=?', [user]);


	let result = connection.query('SELECT * from student_login where rollno=? and password=?', [user, u_pass]);
	let ttstr = "";
	let tut_att = "";
	let course_array = [];
	let open_ele = "";
	let values;
	let ostr;
	let ctstr = "";
	let class_att = "";
	let ltstr = "";
	let lab_att = "";
	let cstr = "";
	let rows = connection.query('Select * from student,classes where student.rollno=? &&' +
		'student.department=classes.department && student.section=classes.section' +
		'&& student.semester=classes.semester', [user]);
	if (result.length > 0) {
		ssn.department = details[0].department;
		ssn.semester = details[0].semester;
		ssn.section = details[0].section;
		course_array.push(rows[0].course1.split(':')[0]); course_array.push(rows[0].course2.split(':')[0]);
		course_array.push(rows[0].course3.split(':')[0]); course_array.push(rows[0].course4.split(':')[0]);
		course_array.push(rows[0].course5.split(':')[0]);
		if (rows[0].course6.split(':')[0].length > 0)
			course_array.push(rows[0].course6.split(':')[0]);
		if (rows[0].course7.split(':')[0].length > 0)
			course_array.push(rows[0].course7.split(':')[0]);
		if (rows[0].course8.split(':')[0].length > 0)
			course_array.push(rows[0].course8.split(':')[0]);

		if (rows[0].openele.split(':')[0].length > 0) {
			open_ele = rows[0].openele.split(':')[0];
			ostr = connection.query('Select course_name from courses where course_code=?', [open_ele])[0].course_name;
			values = connection.query('Select teacher_name,tot_class,tot_labs,tot_tuts from openelective where course_code=?', [open_ele]);
		}
		if (rows[0].course1.length) {
			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select course_name from courses where course_code=?', [course_array[i]]);
				if (i == course_array.length - 1)
					cstr = cstr + value[0].course_name;
				else
					cstr = cstr + value[0].course_name + ":";
			}
			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_class from classes where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (i == course_array.length - 1) {
					ctstr = ctstr + value[0].teacher_name;
					class_att = class_att + value[0].tot_class;
				}
				else {
					ctstr = ctstr + value[0].teacher_name + ":";
					class_att = class_att + value[0].tot_class + ":";
				}
			}

			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_labs from labs where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (value.length > 0) {
					if (i == course_array.length - 1) {
						ltstr = ltstr + value[0].teacher_name;
						lab_att = lab_att + value[0].tot_labs;
					}
					else {
						ltstr = ltstr + value[0].teacher_name + ":";
						lab_att = lab_att + value[0].tot_labs + ":";
					}
				}
				else {
					if (i == course_array.length - 1) {
						ltstr = ltstr + "-1";
						lab_att = lab_att + "-1";
					}
					else {
						ltstr = ltstr + "-1:";
						lab_att = lab_att + "-1:";
					}
				}
			}

			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_tuts from tuts where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (value.length > 0) {
					if (i == course_array.length - 1) {
						ttstr = ttstr + value[0].teacher_name;
						tut_att = tut_att + value[0].tot_tuts;
					}
					else {
						ttstr = ttstr + value[0].teacher_name + ":";
						tut_att = tut_att + value[0].tot_tuts + ":";
					}
				}
				else {
					if (i == course_array.length - 1) {
						ttstr = ttstr + "-1";
						tut_att = tut_att + "-1";
					}
					else {
						ttstr = ttstr + "-1:";
						tut_att = tut_att + "-1:";
					}
				}
			}
			if (values == undefined)
				values = ['n', 'o', 't'];
			response.render('student_login.html', {
				'data': rows, 'courses_names': cstr, 'ct_names': ctstr, 'c_att': class_att,
				'lt_names': ltstr, 'l_att': lab_att, 'tt_names': ttstr, 't_att': tut_att, 'open_data': values, 'openc': ostr
			});
		}
		else {
			values = ['n', 'o', 't'];
			response.render('student_login.html', {
				'data': rows, 'courses_names': cstr, 'ct_names': ctstr, 'c_att': class_att,
				'lt_names': ltstr, 'l_att': lab_att, 'tt_names': ttstr, 't_att': tut_att, 'open_data': values, 'openc': ostr
			});
		}
	}
	else {
		response.redirect('/');
	}
});

app.post('/teacherlogin', function (request, response) {
	let user = request.body.uname;
	let u_pass = request.body.passs;
	let rows = connection.query('SELECT * from teacher_login where teacher_code=? and password=?', [user, u_pass]);

	if (rows.length > 0) {
		let result1, result2, result3;
		ssn = request.session;
		ssn.teachercode = user;
		result1 = connection.query('select distinct course_name from courses,classes where teacher_code=? && classes.course_code=courses.course_code', [user]);
		result2 = connection.query('select distinct course_name from labs,courses where teacher_code=? && labs.course_code=courses.course_code', [user]);
		result3 = connection.query('select distinct course_name from tuts,courses where teacher_code=? && tuts.course_code=courses.course_code', [user]);
		response.render('choose.html', { classes: result1, lab: result2, tut: result3 });
	}
	else {
		response.redirect('/');
	}
});

app.get('/classes', function (request, response) {
	con.query('Select distinct course_code,department,section from classes where teacher_code=?', [ssn.teachercode], function (err, rows) {
		if (err)
			console.log(err);
		console.log(rows);
		response.render('courses.html', { data: rows });
	})

})

app.get('/labs', function (request, response) {
	con.query('Select distinct course_code,department,section from labs where teacher_code=?', [ssn.teachercode], function (err, rows) {
		if (err)
			console.log(err);
		console.log(rows);
		response.render('courses.html', { data: rows });
	})
})

app.get('/tuts', function (request, response) {
	con.query('Select distinct course_code,department,section from tuts where teacher_code=?', [ssn.teachercode], function (err, rows) {
		if (err)
			console.log(err);
		console.log(rows);
		response.render('courses.html', { data: rows });
	})
})

app.post("/add", function (request, response) {
	var table;
	if (request.body.which == 1)
		table = "classes";
	else if (request.body.which == 2)
		table = "labs";
	else
		table = "tuts";
	ssn.title = table;
	let result;
	let qry = connection.query('Select department from teachers where teacher_code=?', [ssn.teachercode]);
	if (table == "classes")
		result = connection.query('select course_name from courses where class=1 and department=?', [qry[0].department]);
	else if (table == "labs")
		result = connection.query('select course_name from courses where lab=1 and department=?', [qry[0].department]);
	else if (table == "tuts")
		result = connection.query('select course_name from courses where tut=1 and department=?', [qry[0].department]);
	response.render('add.html', { 'which': table, data: result });
})

app.post("/remove", function (request, response) {
	let tbl;
	if (request.body.which == 1)
		table = "classes";
	else if (request.body.which == 2)
		table = "labs";
	else
		table = "tuts";
	ssn.tbl1 = tbl;
	let result;
	if (tbl == "classes")
		result = connection.query('Select courses.course_name from courses,classes where teacher_code=? and courses.course_code=classes.course_code', [ssn.teachercode]);
	else if (tbl == "labs")
		result = connection.query('Select courses.course_name from courses,labs where teacher_code=? and courses.course_code=labs.course_code', [ssn.teachercode]);
	else
		result = connection.query('Select courses.course_name from courses,tuts where teacher_code=? and courses.course_code=tuts.course_code', [ssn.teachercode]);
	response.render('remove.html', { 'which': tbl, 'data': result });
})

app.post("/addfinal", function (request, response) {
	if (ssn.title == "classes") {
		let qry = connection.query('Select * from teachers where teacher_code=?', [ssn.teachercode]);
		let qry2 = connection.query('Select * from courses where course_name=?', [request.body.course]);
		connection.query('Insert into classes (course_code,teacher_code,teacher_name,department,section,semester,tot_class) values(?,?,?,?,?,?,?)'
			, [qry2[0].course_code, ssn.teachercode, qry[0].teacher_name, qry[0].department, request.body.section, request.body.semester, 0]);
	}
	else if (ssn.title == "labs") {
		let qry = connection.query('Select * from teachers where teacher_code=?', [ssn.teachercode]);
		let qry2 = connection.query('Select * from courses where course_name=?', [request.body.course]);
		connection.query('Insert into labs (course_code,teacher_code,teacher_name,department,section,semester,tot_labs) values(?,?,?,?,?,?,?)'
			, [qry2[0].course_code, ssn.teachercode, qry[0].teacher_name, qry[0].department, request.body.section, request.body.semester, 0]);
	}
	else {
		let qry = connection.query('Select * from teachers where teacher_code=?', [ssn.teachercode]);
		let qry2 = connection.query('Select * from courses where course_name=?', [request.body.course]);
		connection.query('Insert into tuts (course_code,teacher_code,teacher_name,department,section,semester,tot_tuts) values(?,?,?,?,?,?,?)'
			, [qry2[0].course_code, ssn.teachercode, qry[0].teacher_name, qry[0].department, request.body.section, request.body.semester, 0]);
	}
	result1 = connection.query('select distinct course_name from courses,classes where teacher_code=? && classes.course_code=courses.course_code', [ssn.teachercode]);
	result2 = connection.query('select distinct course_name from labs,courses where teacher_code=? && labs.course_code=courses.course_code', [ssn.teachercode]);
	result3 = connection.query('select distinct course_name from tuts,courses where teacher_code=? && tuts.course_code=courses.course_code', [ssn.teachercode]);
	response.render('choose.html', { classes: result1, lab: result2, tut: result3 });
})

app.post("/removefinal", function (request, response) {
	if (ssn.tbl1 == "classes") {
		let qry = connection.query('Select course_code from courses where course_name=?', [request.body.rcourse]);
		connection.query('Delete from classes where course_code=? and teacher_code=? and section=? and semester=?',
			[qry[0].course_code, ssn.teachercode, request.body.rsection, request.body.rsemester]);
	}
	else if (ssn.tbl1 == "labs") {
		let qry = connection.query('Select course_code from courses where course_name=?', [request.body.rcourse]);
		connection.query('Delete from labs where course_code=? and teacher_code=? and section=? and semester=?',
			[qry[0].course_code, ssn.teachercode, request.body.rsection, request.body.rsemester]);
	}
	else {
		let qry = connection.query('Select course_code from courses where course_name=?', [request.body.rcourse]);
		connection.query('Delete from tuts where course_code=? and teacher_code=? and section=? and semester=?',
			[qry[0].course_code, ssn.teachercode, request.body.rsection, request.body.rsemester]);
	}
	result1 = connection.query('select distinct course_name from courses,classes where teacher_code=? && classes.course_code=courses.course_code', [ssn.teachercode]);
	result2 = connection.query('select distinct course_name from labs,courses where teacher_code=? && labs.course_code=courses.course_code', [ssn.teachercode]);
	result3 = connection.query('select distinct course_name from tuts,courses where teacher_code=? && tuts.course_code=courses.course_code', [ssn.teachercode]);
	response.render('choose.html', { classes: result1, lab: result2, tut: result3 });
})

app.get('/uploadimage', function (request, response) {
	let ttstr = "";
	let tut_att = "";
	let course_array = [];
	let open_ele = "";
	let values;
	let ostr;
	let ctstr = "";
	let class_att = "";
	let ltstr = "";
	let lab_att = "";
	let cstr = "";
	let rows = connection.query('Select * from student,classes where student.rollno=? &&' +
		'student.department=classes.department && student.section=classes.section' +
		'&& student.semester=classes.semester', [ssn.rollno]);

	{
		course_array.push(rows[0].course1.split(':')[0]); course_array.push(rows[0].course2.split(':')[0]);
		course_array.push(rows[0].course3.split(':')[0]); course_array.push(rows[0].course4.split(':')[0]);
		course_array.push(rows[0].course5.split(':')[0]);
		if (rows[0].course6.split(':')[0].length > 0)
			course_array.push(rows[0].course6.split(':')[0]);
		if (rows[0].course7.split(':')[0].length > 0)
			course_array.push(rows[0].course7.split(':')[0]);
		if (rows[0].course8.split(':')[0].length > 0)
			course_array.push(rows[0].course8.split(':')[0]);

		if (rows[0].openele.split(':')[0].length > 0) {
			open_ele = rows[0].openele.split(':')[0];
			ostr = connection.query('Select course_name from courses where course_code=?', [open_ele])[0].course_name;
			values = connection.query('Select teacher_name,tot_class,tot_labs,tot_tuts from openelective where course_code=?', [open_ele]);
		}
		if (rows[0].course1.length) {
			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select course_name from courses where course_code=?', [course_array[i]]);
				if (i == course_array.length - 1)
					cstr = cstr + value[0].course_name;
				else
					cstr = cstr + value[0].course_name + ":";
			}
			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_class from classes where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (i == course_array.length - 1) {
					ctstr = ctstr + value[0].teacher_name;
					class_att = class_att + value[0].tot_class;
				}
				else {
					ctstr = ctstr + value[0].teacher_name + ":";
					class_att = class_att + value[0].tot_class + ":";
				}
			}

			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_labs from labs where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (value.length > 0) {
					if (i == course_array.length - 1) {
						ltstr = ltstr + value[0].teacher_name;
						lab_att = lab_att + value[0].tot_labs;
					}
					else {
						ltstr = ltstr + value[0].teacher_name + ":";
						lab_att = lab_att + value[0].tot_labs + ":";
					}
				}
				else {
					if (i == course_array.length - 1) {
						ltstr = ltstr + "-1";
						lab_att = lab_att + "-1";
					}
					else {
						ltstr = ltstr + "-1:";
						lab_att = lab_att + "-1:";
					}
				}
			}

			for (let i = 0; i < course_array.length; i++) {
				let value = connection.query('Select teacher_name,tot_tuts from tuts where course_code=? && department=? ' +
					'&& section=? && semester=?', [course_array[i], rows[0].department, rows[0].section, rows[0].semester]);
				if (value.length > 0) {
					if (i == course_array.length - 1) {
						ttstr = ttstr + value[0].teacher_name;
						tut_att = tut_att + value[0].tot_tuts;
					}
					else {
						ttstr = ttstr + value[0].teacher_name + ":";
						tut_att = tut_att + value[0].tot_tuts + ":";
					}
				}
				else {
					if (i == course_array.length - 1) {
						ttstr = ttstr + "-1";
						tut_att = tut_att + "-1";
					}
					else {
						ttstr = ttstr + "-1:";
						tut_att = tut_att + "-1:";
					}
				}
			}
			if (values == undefined)
				values = ['n', 'o', 't'];
			let x = connection.query('select image from student where rollno=?', [ssn.rollno]);
			response.render('imagepage.html', {
				'data': rows, 'courses_names': cstr, 'ct_names': ctstr, 'c_att': class_att,
				'lt_names': ltstr, 'l_att': lab_att, 'tt_names': ttstr, 't_att': tut_att, 'open_data': values, 'openc': ostr, 'rollno': ssn.rollno, image: x[0].rollno, 'department': ssn.department, 'section': ssn.section, 'semester': ssn.semester
			});
		}
		else {
			values = ['n', 'o', 't'];
			let x = connection.query('select image from student where rollno=?', [ssn.rollno]);
			response.render('imagepage.html', {
				'data': rows, 'courses_names': cstr, 'ct_names': ctstr, 'c_att': class_att,
				'lt_names': ltstr, 'l_att': lab_att, 'tt_names': ttstr, 't_att': tut_att, 'open_data': values, 'openc': ostr, 'rollno': ssn.rollno, image: x[0].rollno, 'department': ssn.department, 'section': ssn.section, 'semester': ssn.semester
			});
		}
	}
});

app.post('/adminlogin', function (request, response) {
	let user = request.body.uname;
	let u_pass = request.body.passs;
	if (user == "admin" && u_pass == "admin") {
		response.render('admin_page.html');
	}
	else {
		response.redirect('/');
	}
})

app.post('/addstudent', function (request, response) {
	let stname = request.body.stname;
	let stdepartment = request.body.stdepartment;
	let stsection = request.body.stsection;
	let strollno = request.body.strollno;
	connection.query('Insert into student (rollno,name,department,section,semester,course1,course2,course3,course4,course5,course6,course7,course8,openele,image) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
		, [strollno, stname, stdepartment, stsection, 1,' ',' ',' ',' ',' ',' ',' ',' ',' ',0]);
	connection.query('Insert into student_login (rollno,password) values(?,?)',[strollno,stname]);
	response.render('admin_page.html');

})

app.get('/updatesem', function (request, response) {
	connection.query('Delete from classes where semester>=0');
	connection.query('Delete from labs where semester>=0');
	connection.query('Delete from tuts where semester>=0');
	connection.query('Update student set semester=semester+1');
	let qry = connection.query('Select rollno from student where semester=9 and department="CS" ');
	let myroll = qry[0].rollno;
	let rem = myroll % 100000;
	connection.query('Delete from student where semester=9');
	connection.query('Update student set course1=null,course2=null,course3=null,course4=null,' +
		'course5=null,course6=null,course7=null,course8=null,openele=null');
	connection.query('Update openelective set tot_class=0,tot_tuts=0,tot_labs=0');
	let less = rem * 100000;
	let more = rem * 100000 + 99999;
	connection.query('Delete from student_login where rollno>=? and rollno<=?', [less, more]);
});

app.post('/addcourse', function (request, response) {
	connection.query('Insert into courses (course_code,course_name,department,semester,class,lab,tut) values (?,?,?,?,?,?,?)', [request.body.ccode, request.body.cname, request.body.cdepartment, request.body.csemester, 1, 0, 0]);
	if (request.body.copen == 1) {
		if (request.body.ctype.length == 2) {
			if (request.body.ctype[1] == 2)
				connection.query('Update courses set lab=1 where course_code=?', [request.body.ccode]);
			else
				connection.query('Update courses set tut=1 where course_code=?', [request.body.ccode]);
		}
		else {
			connection.query('Update courses set lab=1,tut=1 where course_code=?', [request.body.ccode]);
		}
		connection.query('Insert into openelective (course_code,tot_class,tot_labs,tot_tuts) values(request.body.ccode,0,0,0)');
	}
	else {
		if (request.body.ctype.length == 2) {
			if (request.body.ctype[1] == 2)
				connection.query('Update courses set lab=1 where course_code=?', [request.body.ccode]);
			else
				connection.query('Update courses set tut=1 where course_code=?', [request.body.ccode]);
		}
		else {
			connection.query('Update courses set lab=1,tut=1 where course_code=?', [request.body.ccode]);
		}
	}
});


app.get('/logout', function (request, response) {
	request.session.destroy();
	response.redirect('/');
})

app.post('/attendance', function (request, response) {
	let result;
	if (request.body.which1 != undefined) {
		let subject = connection.query('select course_code from courses where course_name=?', [request.body.which1]);
		result = connection.query('select department,section,semester from classes where teacher_code=? && course_code=?', [ssn.teachercode, subject[0].course_code]);
		ssn.subject = subject[0].course_code;
		ssn.which = "classes";
		response.render('attendance.html', { which: 'classes', all: result });
	}
	else if (request.body.which2 != undefined) {
		let subject = connection.query('select course_code from courses where course_name=?', [request.body.which2]);
		result = connection.query('select department,section,semester from labs where teacher_code=? && course_code=?', [ssn.teachercode, subject[0].course_code]);
		ssn.subject = subject[0].course_code;
		ssn.which = "labs";
		response.render('attendance.html', { which: 'labs', all: result });
	}
	else {
		let subject = connection.query('select course_code from courses where course_name=?', [request.body.which3]);
		result = connection.query('select department,section,semester from tuts where teacher_code=? && course_code=?', [ssn.teachercode, subject[0].course_code]);
		ssn.subject = subject[0].course_code;
		ssn.which = "tuts";
		response.render('attendance.html', { which: 'tuts', all: result });
	}

})

app.post('/take_attendance', function (request, response) {
	var department = request.body.what.split('_')[0];
	var section = request.body.what.split('_')[1];
	var semester = request.body.what.split('_')[2];
	ssn.department = department;
	ssn.section = section;
	ssn.semester = semester;
	let result = connection.query('select rollno,name from student where department=? and section=? and semester=? and image=1', [department, section, semester]);
	response.render('take_attendance.html', { data: result, department: department, section: section, semester: semester });
})

app.post('/update_attendance', function (request, response) {
	if (ssn.which == "classes") {
		let qry = connection.query('Select tot_class from classes where course_code=? and department=? and section=? and semester=?'
			, [ssn.subject, ssn.department, ssn.section, ssn.semester]);
		let numb = qry[0].tot_class;
		numb++;
		connection.query('Update classes set tot_class=? where course_code=? and department=? and section=? and semester=?'
			, [numb, ssn.subject, ssn.department, ssn.section, ssn.semester]);
	}
	else if (ssn.which == "labs") {
		let qry = connection.query('Select tot_labs from labs where course_code=? and department=? and section=? and semester=?'
			, [ssn.subject, ssn.department, ssn.section, ssn.semester]);
		let numb = qry[0].tot_labs;
		numb++;
		connection.query('Update classes set tot_labs=? where course_code=? and department=? and section=? and semester=?'
			, [numb, ssn.subject, ssn.department, ssn.section, ssn.semester]);
	}
	else {
		let qry = connection.query('Select tot_tuts from tuts where course_code=? and department=? and section=? and semester=?'
			, [ssn.subject, ssn.department, ssn.section, ssn.semester]);
		let numb = qry[0].tot_tuts;
		numb++;
		connection.query('Update classes set tot_tuts=? where course_code=? and department=? and section=? and semester=?'
			, [numb, ssn.subject, ssn.department, ssn.section, ssn.semester]);

	}
	for (let i = 0; i < request.body.data.length; i++) {
		let value = connection.query('Select * from student where rollno=?', [parseInt(request.body.data[i].split(':')[0])]);
		if (ssn.which == "classes") {
			if (ssn.subject == value[0].course1.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course1.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course1.split(':')[0] + ":" + num + ":" + value[0].course1.split(':')[2] + ":" + value[0].course1.split(':')[3];
					connection.query('Update student set course1=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course2.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course2.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course2.split(':')[0] + ":" + num + ":" + value[0].course2.split(':')[2] + ":" + value[0].course2.split(':')[3];
					connection.query('Update student set course2=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course3.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course3.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course3.split(':')[0] + ":" + num + ":" + value[0].course3.split(':')[2] + ":" + value[0].course3.split(':')[3];
					connection.query('Update student set course3=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course4.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course4.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course4.split(':')[0] + ":" + num + ":" + value[0].course4.split(':')[2] + ":" + value[0].course4.split(':')[3];
					connection.query('Update student set course4=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course5.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course5.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course5.split(':')[0] + ":" + num + ":" + value[0].course5.split(':')[2] + ":" + value[0].course5.split(':')[3];
					connection.query('Update student set course5=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course6.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course6.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course6.split(':')[0] + ":" + num + ":" + value[0].course6.split(':')[2] + ":" + value[0].course6.split(':')[3];
					connection.query('Update student set course6=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course7.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course7.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course7.split(':')[0] + ":" + num + ":" + value[0].course7.split(':')[2] + ":" + value[0].course7.split(':')[3];
					connection.query('Update student set course7=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course8.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course8.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course8.split(':')[0] + ":" + num + ":" + value[0].course8.split(':')[2] + ":" + value[0].course8.split(':')[3];
					connection.query('Update student set course8=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].openele.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].openele.split(':')[1]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].openele.split(':')[0] + ":" + num + ":" + value[0].openele.split(':')[2] + ":" + value[0].openele.split(':')[3];
					connection.query('Update student set openele=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
		}
		else if (ssn.which == "labs") {

			if (ssn.subject == value[0].course1.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course1.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course1.split(':')[0] + ":" + value[0].course1.split(':')[1] + ":" + num + ":" + value[0].course1.split(':')[3];
					connection.query('Update student set course1=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course2.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course2.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course2.split(':')[0] + ":" + value[0].course2.split(':')[1] + ":" + num + ":" + value[0].course2.split(':')[3];
					connection.query('Update student set course2=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course3.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course3.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course3.split(':')[0] + ":" + value[0].course3.split(':')[1] + ":" + num + ":" + value[0].course3.split(':')[3];
					connection.query('Update student set course3=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course4.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course4.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course4.split(':')[0] + ":" + value[0].course4.split(':')[1] + ":" + num + ":" + value[0].course4.split(':')[3];
					connection.query('Update student set course4=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course5.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course5.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course5.split(':')[0] + ":" + value[0].course5.split(':')[1] + ":" + num + ":" + value[0].course5.split(':')[3];
					connection.query('Update student set course5=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course6.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course6.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course6.split(':')[0] + ":" + value[0].course6.split(':')[1] + ":" + num + ":" + value[0].course6.split(':')[3];
					connection.query('Update student set course6=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course7.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course7.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course7.split(':')[0] + ":" + value[0].course7.split(':')[1] + ":" + num + ":" + value[0].course7.split(':')[3];
					connection.query('Update student set course7=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course8.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course8.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course8.split(':')[0] + ":" + value[0].course8.split(':')[1] + ":" + num + ":" + value[0].course8.split(':')[3];
					connection.query('Update student set course8=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].openele.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].openele.split(':')[2]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].openele.split(':')[0] + ":" + value[0].openele.split(':')[1] + ":" + num + ":" + value[0].openele.split(':')[3];
					connection.query('Update student set openele=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
		}
		else if (ssn.which == "tuts") {
			if (ssn.subject == value[0].course1.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course1.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course1.split(':')[0] + ":" + value[0].course1.split(':')[1] + ":" + value[0].course1.split(':')[2] + ":" + num;
					connection.query('Update student set course1=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course2.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course2.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course2.split(':')[0] + ":" + value[0].course2.split(':')[1] + ":" + value[0].course2.split(':')[2] + ":" + num;
					connection.query('Update student set course2=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course3.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course3.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course3.split(':')[0] + ":" + value[0].course3.split(':')[1] + ":" + value[0].course3.split(':')[2] + ":" + num;
					connection.query('Update student set course3=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course4.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course4.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course4.split(':')[0] + ":" + value[0].course4.split(':')[1] + ":" + value[0].course4.split(':')[2] + ":" + num;
					connection.query('Update student set course4=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course5.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course5.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course5.split(':')[0] + ":" + value[0].course5.split(':')[1] + ":" + value[0].course5.split(':')[2] + ":" + num;
					connection.query('Update student set course5=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course6.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course6.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course6.split(':')[0] + ":" + value[0].course6.split(':')[1] + ":" + value[0].course6.split(':')[2] + ":" + num;
					connection.query('Update student set course6=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course7.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course7.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course7.split(':')[0] + ":" + value[0].course7.split(':')[1] + ":" + value[0].course7.split(':')[2] + ":" + num;
					connection.query('Update student set course7=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].course8.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].course8.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].course8.split(':')[0] + ":" + value[0].course8.split(':')[1] + ":" + value[0].course8.split(':')[2] + ":" + num;
					connection.query('Update student set course8=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
			if (ssn.subject == value[0].openele.split(':')[0]) {
				let flag = parseInt(request.body.data[i].split(':')[1]);
				if (flag == 1) {
					let num = parseInt(value[0].openele.split(':')[3]);
					if (num == -1)
						num = num + 2;
					else
						num++;
					let mystr = value[0].openele.split(':')[0] + ":" + value[0].openele.split(':')[1] + ":" + value[0].openele.split(':')[2] + ":" + num;
					connection.query('Update student set openele=? where rollno=?', [mystr, parseInt(request.body.data[i].split(':')[0])]);
				}
			}
		}
	}
	// response.redirect('/');
	window.location.reload();
	// let result;
	// if(ssn.which=="classes")
	// {
	// 	console.log("yaha aaya ");
	// 	result = connection.query('select department,section,semester from classes where teacher_code=? && course_code=?', [ssn.teachercode, ssn.subject]);
	// 	console.log("yaha bhi aaya ");
	// 	response.render('attendance.html', { which: 'classes', all: result });
	// 	console.log("yaha bhi aa aaya ");
	// }
	// else if(ssn.which=="labs")
	// {
	// 	result = connection.query('select department,section,semester from labs where teacher_code=? && course_code=?', [ssn.teachercode, ssn.subject]);
	// 	response.render('attendance.html', { which: 'labs', all: result });
	// }
	// else
	// {
	// 	result = connection.query('select department,section,semester from tuts where teacher_code=? && course_code=?', [ssn.teachercode, ssn.subject]);
	// 	response.render('attendance.html', { which: 'tuts', all: result });
	// }
})
app.listen(9000, function () {
	console.log('Server started at http://localhost:9000');
})
process.env.NODE_ENV = "test";

let Course = require("../../src/Backend/Models/course.model");
let Question = require("../../src/Backend/Models/question.model");
let admin = require("../../src/Backend/Firebase/admin");
//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../../src/Backend/server");
let should = chai.should();

let idToken = "";

const rp = require("request-promise");
const API_KEY = "AIzaSyArrokhuYfs5rPYBjqQmY3K9DeRHxLThBg";
const UID = "hW9mWRQ6RePiVcCuV6wF4Dd28mE3";

/**
 * Converts a custom Token into an idToken used for mock validation
 * @param {*} customToken
 * @param {*} callback
 */
function getIdTokenFromCustomToken(customToken, callback) {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${API_KEY}`;
    const data = {
        token: customToken,
        returnSecureToken: true
    };

    var options = {
        method: "POST",
        uri: url,
        body: data,
        json: true // Automatically stringifies the body to JSON
    };

    return (
        rp(options)
            // idToken is the firebase id token that can be used with verifyIdToken
            .then(parsedBody => {
                idToken = parsedBody.idToken;
                callback();
            })
            .catch(function(err) {
                // POST failed...
            })
    );
}

chai.use(chaiHttp);

describe("Course", () => {
    beforeEach(done => {
        Course.deleteMany({}, err => {
            admin
                .auth()
                .createCustomToken(UID)
                .then(token => {
                    getIdTokenFromCustomToken(token, () => {
                        done();
                    });
                });
        });
    });

    /* Test the /POST route */
    describe("Create course /POST", () => {
        it("it should create a course", done => {
            let course = {
                courseName: "Programming",
                courseNumber: "CS506"
            };
            chai.request(server)
                .post("/api/course")
                .send(course)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have
                        .property("courseName")
                        .eql("Programming");
                    done();
                });
        });
        it("it should fail to create a course", done => {
            chai.request(server)
                .post("/api/course")
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });
    });

    describe("Update course /PATCH", () => {
        it("it should update a course", done => {
            let course = new Course({
                courseName: "Test Course",
                courseNumber: "CS432"
            });

            var id;
            course.save((err, course) => {
                course.should.have.property("courseName").eql("Test Course");
                id = course._id;

                let newCourseName = { courseName: "Updated Course" };
                chai.request(server)
                    .patch(`/api/course/${id}`)
                    .send(newCourseName)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have
                            .property("courseName")
                            .eql("Updated Course");
                        done();
                    });
            });
        });

        it("it should fail to update a course", done => {
            chai.request(server)
                .patch(`/api/course/1`)
                .send({})
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });

        it("it should fail to update a course", done => {
            let course = new Course({
                courseName: "Test Course 1",
                courseNumber: "CS432 1"
            });

            var id;
            course.save((err, course) => {
                id = course._id;
                Course.findByIdAndDelete(id, err => {
                    chai.request(server)
                        .patch(`/api/course/${id}`)
                        .send({})
                        .end((err, res) => {
                            res.should.have.status(500);
                            done();
                        });
                });
            });
        });
    });

    describe("Get courses /GET", () => {
        it("it should get a list of all courses", done => {
            new Course({
                courseName: "Course 1",
                courseNumber: "CS4"
            }).save((err, course1) => {
                new Course({
                    courseName: "Course 2",
                    courseNumber: "CS5"
                }).save((err, course2) => {
                    chai.request(server)
                        .get("/api/course")
                        .set("Authentication", "Bearer " + idToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            let courses = res.body;
                            courses.length.should.eql(2);

                            done();
                        });
                });
            });
        });
    });

    describe("Get course /GET", () => {
        it("it should get a single course", done => {
            let course = new Course({
                courseName: "Test Course",
                courseNumber: "CS124"
            });

            var id;
            course.save((err, course) => {
                course.should.have.property("courseName").eql("Test Course");
                id = course._id;

                chai.request(server)
                    .get(`/api/course/${id}`)
                    .set("Authentication", "Bearer " + idToken)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have
                            .property("courseName")
                            .eql("Test Course");
                        done();
                    });
            });
        });

        it("it should faile to get a single course", done => {
            chai.request(server)
                .get("/api/course/1")
                .set("Authentication", "Bearer " + idToken)
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });
    });

    describe("Add Question /POST", () => {
        it("it should add a question to a course", done => {
            let course = new Course({
                courseName: "Test Course",
                courseNumber: "CS543"
            });

            var course_id;
            course.save((err, course) => {
                course_id = course._id;
                let question = new Question({
                    name: "Question 1",
                    content: "Content is here."
                });

                var question_id;
                question.save((err, question) => {
                    question_id = question._id;

                    chai.request(server)
                        .post(`/api/course/${course_id}/addq`)
                        .set("Authentication", "Bearer " + idToken)
                        .send({ question_id: question_id })
                        .end((err, res) => {
                            res.should.have.status(200);
                            let questions = res.body.questions;
                            questions.length.should.eql(1);
                            done();
                        });
                });
            });
        });
        it("it should fail to add the question", done => {
            let course = new Course({
                courseName: "New Course",
                courseNumber: "CS234"
            });

            var course_id;
            course.save((err, course) => {
                var question_id = "1234";

                chai.request(server)
                    .post(`/api/course/${course_id}/addq`)
                    .set("Authentication", "Bearer " + idToken)
                    .send({ question_id: question_id })
                    .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
            });
        });

        it("it should fail to add the question", done => {
            let course = new Course({
                courseName: "New Course",
                courseNumber: "CS234"
            });

            var course_id;
            course.save((err, course) => {
                var question_id = "1234";
                course_id = course._id;
                Course.findByIdAndDelete(course_id, err => {
                    chai.request(server)
                        .post(`/api/course/${course_id}/addq`)
                        .set("Authentication", "Bearer " + idToken)
                        .send({ question_id: question_id })
                        .end((err, res) => {
                            res.should.have.status(500);
                            done();
                        });
                });
            });
        });

        it("it should fail to add the question", done => {
            let course = new Course({
                courseName: "New Course",
                courseNumber: "CS234"
            });

            var course_id;
            course.save((err, course) => {
                var question_id = "1234";
                course_id = course._id;

                chai.request(server)
                    .post(`/api/course/${course_id}/addq`)
                    .set("Authentication", "Bearer " + idToken)
                    .send({ question_id: question_id })
                    .end((err, res) => {
                        res.should.have.status(500);
                        done();
                    });
            });
        });
    });
});

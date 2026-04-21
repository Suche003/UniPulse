import { describe, it, before, after, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import * as studentController from "../../controllers/studentController.js";
import Student from "../../models/Student.js";

describe("Student Controller", () => {
  let req, res, next;
  let findOneStub, createStub, findStub, findByIdStub, findByIdAndDeleteStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();

    // Stub mongoose methods
    findOneStub = sinon.stub(Student, "findOne");
    createStub = sinon.stub(Student, "create");
    findStub = sinon.stub(Student, "find");
    findByIdStub = sinon.stub(Student, "findById");
    findByIdAndDeleteStub = sinon.stub(Student, "findByIdAndDelete");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerStudent", () => {
    it("should successfully register a new student", async () => {
      req.body = {
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
        password: "securePass123",
      };

      const mockStudent = {
        _id: "507f191e810c19729de860ea",
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
      };

      findOneStub.resolves(null);
      createStub.resolves(mockStudent);

      await studentController.registerStudent(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Student registered successfully");
      expect(responseData.student.name).to.equal("John Doe");
    });

    it("should return 409 if student already exists (NIC)", async () => {
      req.body = {
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
        password: "securePass123",
      };

      const existingStudent = { _id: "507f191e810c19729de860ea", nic: "200331310064" };
      findOneStub.resolves(existingStudent);

      await studentController.registerStudent(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.include("Student already exists");
    });

    it("should return 409 if student already exists (RegNo)", async () => {
      req.body = {
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
        password: "securePass123",
      };

      const existingStudent = { _id: "507f191e810c19729de860ea", regNo: "IT12345678" };
      findOneStub.resolves(existingStudent);

      await studentController.registerStudent(req, res);

      expect(res.status.calledWith(409)).to.be.true;
    });

    it("should handle database errors gracefully", async () => {
      req.body = {
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
        password: "securePass123",
      };

      findOneStub.rejects(new Error("Database connection failed"));

      await studentController.registerStudent(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Failed to register student");
    });
  });

  describe("getAllStudents", () => {
    it("should return all students without passwords", async () => {
      const mockStudents = [
        {
          _id: "507f191e810c19729de860ea",
          name: "John Doe",
          nic: "200331310064",
          regNo: "IT12345678",
        },
        {
          _id: "507f191e810c19729de860eb",
          name: "Jane Doe",
          nic: "199012345678",
          regNo: "IT87654321",
        },
      ];

      findStub.returns({
        select: sinon.stub().returns({
          sort: sinon.stub().resolves(mockStudents),
        }),
      });

      await studentController.getAllStudents(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
      expect(responseData[0].name).to.equal("John Doe");
    });

    it("should return empty array when no students exist", async () => {
      findStub.returns({
        select: sinon.stub().returns({
          sort: sinon.stub().resolves([]),
        }),
      });

      await studentController.getAllStudents(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(0);
    });

    it("should handle database errors gracefully", async () => {
      findStub.returns({
        select: sinon.stub().returns({
          sort: sinon.stub().rejects(new Error("Database error")),
        }),
      });

      await studentController.getAllStudents(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Failed to fetch students");
    });
  });

  describe("getStudentById", () => {
    it("should return a student by id", async () => {
      req.params.id = "507f191e810c19729de860ea";

      const mockStudent = {
        _id: "507f191e810c19729de860ea",
        name: "John Doe",
        nic: "200331310064",
        contact: "0712345678",
        address: "123 Main St",
        regNo: "IT12345678",
      };

      findByIdStub.returns({
        select: sinon.stub().resolves(mockStudent),
      });

      await studentController.getStudentById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData._id).to.equal("507f191e810c19729de860ea");
      expect(responseData.name).to.equal("John Doe");
    });

    it("should return 404 if student not found", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdStub.returns({
        select: sinon.stub().resolves(null),
      });

      await studentController.getStudentById(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Student not found");
    });

    it("should handle database errors gracefully", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdStub.returns({
        select: sinon.stub().rejects(new Error("Database error")),
      });

      await studentController.getStudentById(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Failed to fetch student");
    });
  });

  describe("deleteStudent", () => {
    it("should successfully delete a student", async () => {
      req.params.id = "507f191e810c19729de860ea";

      const mockStudent = {
        _id: "507f191e810c19729de860ea",
        name: "John Doe",
      };

      findByIdAndDeleteStub.resolves(mockStudent);

      await studentController.deleteStudent(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Student deleted successfully");
    });

    it("should return 404 if student not found", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdAndDeleteStub.resolves(null);

      await studentController.deleteStudent(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Student not found");
    });

    it("should handle database errors gracefully", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdAndDeleteStub.rejects(new Error("Database error"));

      await studentController.deleteStudent(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Failed to delete student");
    });
  });
});

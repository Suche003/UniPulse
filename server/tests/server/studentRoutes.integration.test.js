import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import express from "express";
import request from "supertest";
import { body, validationResult } from "express-validator";
import studentRouter from "../../routes/studentRoutes.js";
import Student from "../../models/Student.js";

describe("Student Routes Integration Tests", () => {
  let app;
  let findOneStub, createStub, findStub, findByIdStub, findByIdAndDeleteStub;

  before(() => {
    app = express();
    app.use(express.json());
    
    // Middleware to handle validation errors
    app.use((req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      next();
    });

    app.use("/students", studentRouter);
  });

  beforeEach(() => {
    findOneStub = sinon.stub(Student, "findOne");
    createStub = sinon.stub(Student, "create");
    findStub = sinon.stub(Student, "find");
    findByIdStub = sinon.stub(Student, "findById");
    findByIdAndDeleteStub = sinon.stub(Student, "findByIdAndDelete");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /students/register", () => {
    it("should register a new student with valid data", async () => {
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

      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal("Student registered successfully");
      expect(response.body.student.name).to.equal("John Doe");
    });

    it("should register with old NIC format (9 digits + V/X)", async () => {
      const mockStudent = {
        _id: "507f191e810c19729de860ea",
        name: "Jane Doe",
        nic: "199345678V",
        contact: "0787654321",
        address: "456 Oak Ave",
        regNo: "IT87654321",
      };

      findOneStub.resolves(null);
      createStub.resolves(mockStudent);

      const response = await request(app)
        .post("/students/register")
        .send({
          name: "Jane Doe",
          nic: "199345678V",
          contact: "0787654321",
          address: "456 Oak Ave",
          regNo: "IT87654321",
          password: "securePass123",
        });

      expect(response.status).to.equal(201);
    });

    it("should reject registration with duplicate NIC", async () => {
      const existingStudent = { _id: "507f191e810c19729de860ea", nic: "200331310064" };
      findOneStub.resolves(existingStudent);

      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(409);
      expect(response.body.message).to.include("Student already exists");
    });

    it("should reject registration with duplicate RegNo", async () => {
      const existingStudent = { _id: "507f191e810c19729de860ea", regNo: "IT12345678" };
      findOneStub.resolves(existingStudent);

      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(409);
    });

    it("should reject registration with missing name", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Validation failed");
    });

    it("should reject registration with invalid NIC format", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "12345",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors).to.exist;
    });

    it("should reject registration with invalid contact number", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "12345",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(400);
    });

    it("should reject registration with invalid RegNo format", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "INVALID",
          password: "securePass123",
        });

      expect(response.status).to.equal(400);
    });

    it("should reject registration with short password", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          address: "123 Main St",
          regNo: "IT12345678",
          password: "short",
        });

      expect(response.status).to.equal(400);
    });

    it("should reject registration with missing address", async () => {
      const response = await request(app)
        .post("/students/register")
        .send({
          name: "John Doe",
          nic: "200331310064",
          contact: "0712345678",
          regNo: "IT12345678",
          password: "securePass123",
        });

      expect(response.status).to.equal(400);
    });
  });

  describe("GET /students", () => {
    it("should retrieve all students without passwords", async () => {
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

      const response = await request(app).get("/students");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
      expect(response.body[0].name).to.equal("John Doe");
      expect(response.body[0]).to.not.have.property("passwordHash");
    });

    it("should return empty array when no students exist", async () => {
      findStub.returns({
        select: sinon.stub().returns({
          sort: sinon.stub().resolves([]),
        }),
      });

      const response = await request(app).get("/students");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(0);
    });
  });

  describe("GET /students/:id", () => {
    it("should retrieve a specific student by id", async () => {
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

      const response = await request(app).get("/students/507f191e810c19729de860ea");

      expect(response.status).to.equal(200);
      expect(response.body._id).to.equal("507f191e810c19729de860ea");
      expect(response.body.name).to.equal("John Doe");
      expect(response.body).to.not.have.property("passwordHash");
    });

    it("should return 404 when student not found", async () => {
      findByIdStub.returns({
        select: sinon.stub().resolves(null),
      });

      const response = await request(app).get("/students/507f191e810c19729de860ea");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Student not found");
    });
  });

  describe("DELETE /students/:id", () => {
    it("should successfully delete a student", async () => {
      const mockStudent = {
        _id: "507f191e810c19729de860ea",
        name: "John Doe",
      };

      findByIdAndDeleteStub.resolves(mockStudent);

      const response = await request(app).delete("/students/507f191e810c19729de860ea");

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Student deleted successfully");
    });

    it("should return 404 when student not found for deletion", async () => {
      findByIdAndDeleteStub.resolves(null);

      const response = await request(app).delete("/students/507f191e810c19729de860ea");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Student not found");
    });
  });
});

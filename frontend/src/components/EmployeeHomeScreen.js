import React, { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col, Modal } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

const EmployeeHomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState("Hours Completed");
  const [tasks, setTasks] = useState([]);
  const [workingHours, setWorkingHours] = useState({ total: 8, planned: 0, actual: 0 });
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    details: "",
    client: "",
    module: "",
    resource: "",
    type: "",
    subType: "",
    hoursSpent: ""
  });

  const { data: dropdownOptions = {} } = useApi("/api/dropdowns");

  const statusColors = {
    "On Leave": "warning",
    "On Half Day": "warning",
    "Hours Completed": "success",
    "Hours Short": "danger",
    "Not Started": "warning",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handlePrevDate = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
  };

  const handleNextDate = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
  };

  const handleTaskFormChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch(`/api/tasks?date=${selectedDate.toISOString().split("T")[0]}`);
      const data = await response.json();
      setTasks(data);
    }
    fetchTasks();
  }, [selectedDate]);

  return (
    <Container className="mt-4">
      <Card className="mb-4 p-3 shadow-lg border-0 bg-light">
        <Row className="align-items-center">
          <Col>
            <h2 className="text-primary">Hi Avinash, {getGreeting()}!</h2>
          </Col>
          <Col className="text-center">
            <Button variant="outline-primary" onClick={handlePrevDate}>❮</Button>
            <span className="mx-3 fw-bold text-dark">{selectedDate.toDateString()}</span>
            <Button variant="outline-primary" onClick={handleNextDate}>❯</Button>
          </Col>
          <Col className="text-end">
            <strong>Status:</strong> <span className={`badge bg-${statusColors[status]}`}>{status}</span>
          </Col>
        </Row>
        <Row className="mt-3 text-center">
          <Col><strong>Total Working Hours:</strong> <span className="badge bg-primary">{workingHours.total} Hrs</span></Col>
          <Col><strong>Planned Hours:</strong> <span className="badge bg-info">{workingHours.planned} Hrs</span></Col>
          <Col><strong>Actual Hours:</strong> <span className={`badge bg-${workingHours.actual > 0 ? "success" : "warning"}`}>{workingHours.actual} Hrs</span></Col>
        </Row>
        <Row className="mt-3 text-center">
          <Col>
            <Button variant="success" onClick={() => setShowModal(true)}>+ Add New Task</Button>
          </Col>
        </Row>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Task Title *</Form.Label>
              <Form.Control type="text" name="title" onChange={handleTaskFormChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Task Details</Form.Label>
              <Form.Control as="textarea" name="details" onChange={handleTaskFormChange} />
            </Form.Group>
            {/* {Object.keys(dropdownOptions).map((key) => (
              <Form.Group key={key}>
                <Form.Label>{key}</Form.Label>
                <Form.Select name={key} onChange={handleTaskFormChange}>
                  <option value="">Select {key}</option>
                  {dropdownOptions[key]?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            ))} */}
            <Form.Group>
              <Form.Label>Hours Spent</Form.Label>
              <Form.Control type="number" name="hoursSpent" onChange={handleTaskFormChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary">Save Task</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeHomeScreen;
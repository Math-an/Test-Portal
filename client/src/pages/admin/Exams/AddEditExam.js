import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message, Radio, Table } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Tabs } from "antd";
import PageTitle from "../../../components/PageTitle";
import AddEditQuestion from "./AddEditQuestion";
import {
  addExam,
  deleteQuestionById,
  editExamById,
  getExamById,
} from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

const { TabPane } = Tabs;

function AddEditExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [examData, setExamData] = useState(null);
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] = useState(
    false
  );
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [examType, setExamType] = useState("quiz"); // state for exam type

  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, [params.id]);

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response;

      if (params.id) {
        response = await editExamById({
          ...values,
          examType,
          examId: params.id,
        });
      } else {
        response = await addExam({ ...values, examType });
      }

      if (response.success) {
        message.success(response.message);
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({
        examId: params.id,
      });

      if (response.success) {
        setExamData(response.data);
        setExamType(response.data.examType); // Set exam type from fetched data
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteQuestionById({
        questionId,
        examId: params.id,
      });

      if (response.success) {
        message.success(response.message);
        getExamData();
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const questionsColumns = [
    {
      title: "Question",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Options",
      dataIndex: "options",
      key: "options",
      render: (text, record) =>
        record.options
          ? Object.keys(record.options).map((key) => (
              <div key={key}>
                {key} : {record.options[key]}
              </div>
            ))
          : null,
    },
    {
      title: "Correct Option",
      dataIndex: "correctOption",
      key: "correctOption",
      render: (text, record) =>
        record.correctOption
          ? `${record.correctOption} : ${record.options[record.correctOption]}`
          : "",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          <i
            className="ri-pencil-line"
            onClick={() => {
              setSelectedQuestion(record);
              setShowAddEditQuestionModal(true);
            }}
          ></i>
          <i
            className="ri-delete-bin-line"
            onClick={() => {
              deleteQuestion(record._id);
            }}
          ></i>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title={params.id ? "Edit Exam" : "Add Exam"} />
      <div className="divider"></div>

      {(examData || !params.id) && (
        <Form layout="vertical" onFinish={onFinish} initialValues={examData}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Exam Details" key="1">
              <Form.Item label="Exam Type">
                <Radio.Group
                  onChange={(e) => setExamType(e.target.value)}
                  value={examType}
                >
                  <Radio value="quiz">Quiz</Radio>
                  <Radio value="coding">Coding</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Exam Name" name="name">
                <Input />
              </Form.Item>
              <Form.Item label="Exam Duration" name="duration">
                <Input type="number" />
              </Form.Item>
              {examType === "quiz" && (
                <Form.Item label="Category" name="category">
                  <select>
                    <option value="">Select Category</option>
                    <option value="Javascript">Javascript</option>
                    <option value="React">React</option>
                    <option value="Node">Node</option>
                    <option value="MongoDB">MongoDB</option>
                  </select>
                </Form.Item>
              )}
              <Form.Item label="Total Marks" name="totalMarks">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Passing Marks" name="passingMarks">
                <Input type="number" />
              </Form.Item>
            </TabPane>

            {params.id && (
              <TabPane tab="Questions" key="2">
                <div className="flex justify-end w-full mb-2">
                  <Button
                    className="primary-outlined-btn"
                    onClick={() => setShowAddEditQuestionModal(true)}
                  >
                    Add Question
                  </Button>
                </div>
                <Table
                  columns={questionsColumns}
                  dataSource={examData.questions || []}
                />
              </TabPane>
            )}
          </Tabs>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      )}

      {showAddEditQuestionModal && (
        <AddEditQuestion
          showAddEditQuestionModal={showAddEditQuestionModal}
          setShowAddEditQuestionModal={setShowAddEditQuestionModal}
          examId={params.id}
          refreshData={getExamData}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          examType={examType}
        />
      )}
    </div>
  );
}

export default AddEditExam;

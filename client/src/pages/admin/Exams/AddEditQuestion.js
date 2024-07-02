import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { addQuestionToExam, editQuestionById } from "../../../apicalls/exams";
import { HideLoading } from "../../../redux/loaderSlice";

function AddEditQuestion({
  showAddEditQuestionModal,
  setShowAddEditQuestionModal,
  examId,
  refreshData,
  selectedQuestion,
  setSelectedQuestion,
  examType,
}) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false); // State to manage form visibility

  useEffect(() => {
    if (showAddEditQuestionModal) {
      setFormVisible(true); // Show form when modal is open
    }
  }, [showAddEditQuestionModal]);

  useEffect(() => {
    if (selectedQuestion) {
      form.setFieldsValue({
        name: selectedQuestion.name || "",
        options: selectedQuestion.options || {},
        correctOption: selectedQuestion.correctOption || "",
        testCases: selectedQuestion.testCases || "",
      });
    } else if (examType === "quiz") {
      form.setFieldsValue({
        name: "",
        options: {
          A: "",
          B: "",
          C: "",
          D: "",
        },
        correctOption: "",
        testCases: "", // Ensure this field is initialized appropriately
      });
    } else {
      form.resetFields();
    }
  }, [selectedQuestion, examType, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      let response;
      if (selectedQuestion) {
        response = await editQuestionById({
          ...values,
          questionId: selectedQuestion._id,
        });
      } else {
        response = await addQuestionToExam({
          ...values,
          exam: examId,
        });
      }

      if (response.success) {
        message.success(response.message);
        refreshData();
        setSelectedQuestion(null);
        setShowAddEditQuestionModal(false);
      } else {
        message.error(response.message || "Failed to save question.");
      }
    } catch (error) {
      message.error(error.message || "Failed to save question.");
    } finally {
      setLoading(false);
      dispatch(HideLoading());
    }
  };

  const handleCancel = () => {
    setShowAddEditQuestionModal(false);
    setSelectedQuestion(null);
    setFormVisible(false); // Hide form when modal is closed
  };

  return (
    <Modal
      title={selectedQuestion ? "Edit Question" : "Add Question"}
      visible={showAddEditQuestionModal}
      onCancel={handleCancel}
      footer={null}
    >
      {formVisible && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Question"
            name="name"
            rules={[{ required: true, message: "Please enter question!" }]}
          >
            <Input />
          </Form.Item>

          {examType === "quiz" && (
            <>
              <Form.Item label="Options" required>
                <Input.Group compact>
                  {["A", "B", "C", "D"].map((option) => (
                    <Form.Item
                      key={option}
                      name={["options", option]}
                      rules={[
                        {
                          required: true,
                          message: "Please enter option " + option + "!",
                        },
                      ]}
                    >
                      <Input placeholder={`Option ${option}`} />
                    </Form.Item>
                  ))}
                </Input.Group>
              </Form.Item>

              <Form.Item
                label="Correct Option"
                name="correctOption"
                rules={[
                  {
                    required: true,
                    message: "Please select correct option!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </>
          )}

          {examType === "coding" && (
            <Form.Item
              label="Test Cases"
              name="testCases"
              rules={[
                {
                  required: true,
                  message: "Please enter test cases!",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCancel} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}

export default AddEditQuestion;

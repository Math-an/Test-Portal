import React, { useState, useEffect } from "react";
import { message, Table, Button, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllReports } from "../../../apicalls/reports";
import { getAllExams } from "../../../apicalls/exams";
import moment from "moment";
import PageTitle from "../../../components/PageTitle";

const AdminReports = () => {
  const [exams, setExams] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null); // Track selected exam
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users); // Assuming you have a user state in Redux

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(ShowLoading());

        const examsResponse = await getAllExams();
        if (examsResponse.success) {
          setExams(examsResponse.data);
        } else {
          message.error(examsResponse.message);
        }
        dispatch(HideLoading());
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
      }
    };

    fetchData();
  }, [dispatch]);

  const columns = [
    {
      title: "Exam Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button onClick={() => handleViewReports(record)}>View Reports</Button>
      ),
    },
  ];

  const handleViewReports = async (exam) => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReports({ examName: exam.name });
      if (response.success) {
        // Filter out admin reports if user is admin
        const filteredReports = response.data.filter(
          (report) => !report.user.isAdmin && report.exam._id === exam._id
        );
        setReportsData(filteredReports);
        setSelectedExam(exam); // Set selected exam
      } else {
        message.error(response.message || "Failed to fetch reports");
      }
    } catch (error) {
      message.error(error.message || "Failed to fetch reports");
    } finally {
      dispatch(HideLoading());
    }
  };

  const expandedRowRender = () => {
    const reportColumns = [
      {
        title: "User Name",
        dataIndex: "user",
        key: "userName",
        render: (text, record) => <>{record.user.name}</>,
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "date",
        render: (text, record) => (
          <>{moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss")}</>
        ),
      },
      {
        title: "Total Marks",
        dataIndex: "exam",
        key: "totalMarks",
        render: (text, record) => <>{record.exam.totalMarks}</>,
      },
      {
        title: "Passing Marks",
        dataIndex: "exam",
        key: "passingMarks",
        render: (text, record) => <>{record.exam.passingMarks}</>,
      },
      {
        title: "Obtained Marks",
        dataIndex: "result",
        key: "obtainedMarks",
        render: (text, record) => (
          <>
            {record.result.correctAnswers.length} / {record.exam.totalMarks}
          </>
        ),
      },
      {
        title: "Verdict",
        key: "verdict",
        render: (text, record) => (
          <>
            {record.result.verdict === "Pass" ? (
              <Tag color="green">{record.result.verdict}</Tag>
            ) : (
              <Tag color="red">{record.result.verdict}</Tag>
            )}
          </>
        ),
      },
    ];

    return (
      <Table
        columns={reportColumns}
        dataSource={reportsData}
        pagination={false}
      />
    );
  };

  return (
    <div>
      <PageTitle title="Reports" />
      <div className="divider"></div>
      <Table
        columns={columns}
        dataSource={exams} // Display exams data here
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record === selectedExam,
        }}
        className="mt-2"
      />
    </div>
  );
};

export default AdminReports;

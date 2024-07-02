import { Col, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllExams } from "../../../apicalls/exams";
import { getAllReports } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import { useNavigate } from "react-router-dom";

function Home() {
  const [exams, setExams] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user._id) { // Check if user and user._id are not null/undefined
          dispatch(ShowLoading());
          const examsResponse = await getAllExams();
          const reportsResponse = await getAllReports();
          
          if (examsResponse.success) {
            setExams(examsResponse.data);
          } else {
            message.error(examsResponse.message);
          }
  
          if (reportsResponse.success) {
            const userReports = reportsResponse.data.filter(
              (report) => report.user._id === user._id
            );
            setUserReports(userReports);
          } else {
            message.error(reportsResponse.message);
          }
  
          dispatch(HideLoading());
        }
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
      }
    };

    fetchData();
  }, [dispatch, user]);

  const hasUserTakenExam = (examId) => {
    return userReports.some((report) => report.exam._id === examId);
  };

  return (
    user && (
      <div>
        <PageTitle title={`Hi ${user.name}, Welcome to Test Portal`} />
        <div className="divider"></div>
        <Row gutter={[16, 16]}>
          {exams.map((exam) => (
            <Col span={6} key={exam._id}>
              <div className="card-lg flex flex-col gap-1 p-2">
                <h1 className="text-2xl">{exam?.name}</h1>
                <h1 className="text-md">Category : {exam.category}</h1>
                <h1 className="text-md">Total Marks : {exam.totalMarks}</h1>
                <h1 className="text-md">Passing Marks : {exam.passingMarks}</h1>
                <h1 className="text-md">Duration : {exam.duration}</h1>
  
                {hasUserTakenExam(exam._id) && !user.isAdmin ? (
                  <button className="primary-outlined-btn" disabled>
                    Already Attempted
                  </button>
                ) : (
                  <button
                    className="primary-outlined-btn"
                    onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    )
  );
}

export default Home;

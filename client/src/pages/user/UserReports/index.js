import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReportsByUser } from "../../../apicalls/reports";
import { message } from "antd";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function UserReports() {
  const [reports, setReports] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const fetchReports = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReportsByUser({ userId: user._id });
      dispatch(HideLoading());
      if (response.success) {
        setReports(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="mt-2">
      <h1 className="text-center">Your Reports</h1>
      <div className="divider"></div>
      <div className="flex flex-col gap-2">
        {reports.map((report, index) => (
          <div className="report" key={index}>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl">Exam Name: {report.exam.name}</h1>
              {report.exam.examType === "quiz" && (
                <>
                  <h1 className="text-xl">
                    Correct Answers: {report.result.correctAnswers.length}
                  </h1>
                  <h1 className="text-xl">
                    Wrong Answers: {report.result.wrongAnswers.length}
                  </h1>
                </>
              )}
              {report.exam.examType === "coding" && (
                <>
                  <h1 className="text-xl">
                    Total Correct Answers: {report.result.correctAnswers}
                  </h1>
                </>
              )}
              <h1 className="text-xl">Verdict: {report.result.verdict}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserReports;

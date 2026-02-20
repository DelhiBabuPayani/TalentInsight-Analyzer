import { useParams } from "react-router-dom";
import axios from "axios";

function ApplyJob() {
  const { jobId } = useParams();
  const userId = localStorage.getItem("user_id");

  const applyJob = async () => {
    await axios.post("http://127.0.0.1:8000/apply-job", null, {
      params: { user_id: userId, job_id: jobId }
    });
    alert("Application Submitted");
  };

  return (
    <div className="form-card">
      <h2>Apply for Job</h2>
      <button onClick={applyJob}>Confirm Application</button>
    </div>
  );
}

export default ApplyJob;

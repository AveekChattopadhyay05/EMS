import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DepartmentButtons({ id, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.preventDefault();
    axios
      .delete("http://localhost:5000/api/departments/delete", {
        data: { id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        console.log("Deleted successfully");
        onDelete(id); 
      })
      .catch((err) => {
        console.log("Error deleting: ", err);
      });
  };

  return (
    <div className="flex gap-5">
      <button
        className="px-3 py-1 bg-teal-600 rounded text-white"
        onClick={() => navigate(`/admin-dashboard/department/${id}`)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-600 text-white rounded"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}

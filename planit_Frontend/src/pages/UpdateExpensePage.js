import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig"; // Assuming axiosConfig exports the base URL

const UpdateExpensePage = () => {
  const { id } = useParams(); // Expense ID from URL
  const [expense, setExpense] = useState({ name: "", amount: "", description: "" });
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user"))?.jwtToken;

  // Fetch existing expense details
  useEffect(() => {
    const fetchExpense = async () => {
      if (!token) return; // Prevent API call if token is missing
      try {
        const response = await api.get(`/expenses/event/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Log the response to check the data
        console.log("Fetched Expense:", response.data);

        if (response.data) {
          setExpense(response.data[0]); // Populate form with existing expense data
        } else {
          console.error("Expense data not found");
        }
      } catch (error) {
        console.error("Error fetching expense", error);
        alert("Error fetching expense details.");
      } finally {
        setLoading(false); // Set loading to false after the request completes
      }
    };

    fetchExpense();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setExpense((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit updated expense data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expense.name || !expense.amount || !expense.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await api.put(`/expenses/${id}`, expense, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Expense updated successfully!");
      navigate("/my-events"); // Redirect back to My Events page
    } catch (error) {
      console.error("Error updating expense", error);
      alert("Failed to update expense.");
    }
  };

  // Show loading message if the expense data is not yet loaded
  if (loading) {
    return <div className="container mt-5"><h2>Loading expense details...</h2></div>;
  }

  return (
    <div className="container mt-5">
      <h2>Update Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={expense.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={expense.amount}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            name="description"
            value={expense.description}
            onChange={handleChange}
            className="form-control"
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Update Expense</button>
      </form>
    </div>
  );
};

export default UpdateExpensePage;

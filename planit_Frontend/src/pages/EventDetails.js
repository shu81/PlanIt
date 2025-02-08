import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaMapMarkerAlt } from "react-icons/fa"; // Import Geolocation Icon

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [expenses, setExpenses] = useState([]); // State for expenses
  const [isJoined, setIsJoined] = useState(false); // Track if user joined
  const user = JSON.parse(localStorage.getItem("user")); // Get logged-in user
  const token = user?.jwtToken;
  const userId = user?.userId; // Ensure userId is retrieved

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    const fetchParticipants = async () => {
      try {
        const response = await api.get(`/events/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Participants Response:", response.data);

        // Check if the logged-in user is in the participants list
        const userAlreadyJoined = response.data.some(
          (participant) => participant.id === userId
        );

        setIsJoined(userAlreadyJoined);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await api.get(`/expenses/event/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchEventDetails();
    fetchParticipants();
    fetchExpenses();
  }, [id, token, userId]);

  const handleJoinEvent = () => {
    if (isJoined) {
      alert("You have already joined this event.");
      return;
    }

    // Redirect to the payment page
    navigate(`/payment/${id}`);
  };

  const openGoogleMaps = () => {
    if (event?.location?.address) {
      const query = encodeURIComponent(event.location.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    } else {
      alert("Address not available.");
    }
  };

  if (!event) return <div className="container mt-5"><h2>Loading event details...</h2></div>;

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg">
        <h2 className="text-center text-primary">{event.title}</h2>
        <p><strong>Date:</strong> {event.date}</p>
        <p>
          <strong>Location:</strong> {event.location.name}
        </p>
        <p>
          <strong>Address:</strong> {event.location.address}
          <span className="ms-2">
            <FaMapMarkerAlt 
              className="text-danger" 
              style={{ cursor: "pointer" }} 
              onClick={openGoogleMaps} 
            />
          </span>
        </p>
        <p><strong>Description:</strong> {event.description}</p>

        {/* Show 'Join Event' button if user hasn't joined, otherwise 'Joined' */}
        <div className="d-flex justify-content-center">
          <button className={`btn ${isJoined ? "btn-secondary" : "btn-primary"}`} 
            onClick={handleJoinEvent} 
            disabled={isJoined}>
            {isJoined ? "Already Joined" : "Join Event"}
          </button>
        </div>
      </div>

      {/* Expense Details Section */}
      <div className="mt-4">
        <h3 className="text-center">Event Expenses</h3>
        {expenses.length > 0 ? (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.name}</td>
                    <td>{expense.description}</td>
                    <td>₹{expense.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No expenses added for this event.</p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;


import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

const States = () => {
  const [states, setStates] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const API = `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/states`;

  // GET API
  const getStates = async () => {
    try {
      const { data } = await axios.get(
        `${API}/getstates`
      );

      setStates(data.states || data.States || data);
    } catch (error) {
      toast.error("Failed to get states");
    }
  };

  // POST API
  const addState = async () => {
    try {
      await axios.post(`${API}/createstate`, {
        name,
      });

      toast.success("State added successfully");
      setName("");
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add state");
    }
  };

  // PUT API
  const updateState = async () => {
    try {
      await axios.put(`${API}/update-state/${editId}`, {
        name,
      });

      toast.success("State updated successfully");
      setName("");
      setEditId(null);
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update state");
    }
  };

  // DELETE API
  const deleteState = async (id) => {
    if (!window.confirm("Are you sure you want to delete this state?")) return;

    try {
      await axios.delete(`${API}/delete-state/${id}`);

      toast.success("State deleted successfully");
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete state");
    }
  };

  // FORM SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Enter state name");
    }

    if (editId) {
      updateState();
    } else {
      addState();
    }
  };

  // EDIT
  const handleEdit = (state) => {
    setName(state.name);
    setEditId(state._id);
  };

  // CANCEL
  const handleCancel = () => {
    setName("");
    setEditId(null);
  };

  useEffect(() => {
    getStates();
  }, []);

  return (
    <Layout title="States">
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminMenu />

        <div className="flex-1 p-5 md:p-8">

          <h2 className="text-2xl font-bold mb-6">
            State Management
          </h2>

          {/* ADD / UPDATE FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 rounded-xl shadow-sm border mb-6 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Enter state name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {editId ? "Update State" : "Add State"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 px-5 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}
          </form>

          {/* STATE TABLE */}
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">State Name</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {states.map((state, index) => (
                  <tr key={state._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{index + 1}</td>

                    <td className="p-4 font-medium">
                      {state.name}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(state)}
                          className="text-blue-600"
                        >
                          <FaEdit size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteState(state._id)}
                          className="text-red-600"
                        >
                          <FaTrash size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {states.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">
                      No states found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default States;

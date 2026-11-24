import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

const States = () => {
  const [states, setStates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // SEPARATE STATE FOR ADDING
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  // SEPARATE STATE FOR INLINE EDITING
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  // INLINE DELETE CONFIRMATION
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const editInputRef = useRef(null);
  const API = `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/states`;

  // GET API
  const getStates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/getstates`);
      setStates(data.states || data.States || data || []);
    } catch (error) {
      toast.error("Failed to fetch states");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStates();
  }, []);

  // Auto-focus inline edit input when editId changes
  useEffect(() => {
    if (editId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editId]);

  // POST API (ADD ONLY)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      return toast.error("Please enter a state name");
    }

    try {
      setAdding(true);
      await axios.post(`${API}/createstate`, { name: newName.trim() });
      toast.success("State added successfully");
      setNewName("");
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add state");
    } finally {
      setAdding(false);
    }
  };

  // START INLINE EDIT
  const startEdit = (state) => {
    setEditId(state._id);
    setEditName(state.name);
    setConfirmDeleteId(null);
  };

  // CANCEL INLINE EDIT
  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  // PUT API (UPDATE ONLY)
  const handleUpdateSubmit = async (id) => {
    if (!editName.trim()) {
      return toast.error("State name cannot be empty");
    }

    try {
      setUpdating(true);
      await axios.put(`${API}/update-state/${id}`, { name: editName.trim() });
      toast.success("State updated successfully");
      setEditId(null);
      setEditName("");
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update state");
    } finally {
      setUpdating(false);
    }
  };

  // DELETE API
  const deleteState = async (id) => {
    try {
      await axios.delete(`${API}/delete-state/${id}`);
      toast.success("State deleted successfully");
      setConfirmDeleteId(null);
      if (editId === id) cancelEdit();
      getStates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete state");
    }
  };

  // FILTERED STATES
  const filteredStates = states.filter((state) =>
    state.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="States Management">
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50/80 text-slate-800">
        <AdminMenu />

        <div className="flex-1 p-5 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  States
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {states.length} Total
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Add new states above or edit existing ones directly in the list.
              </p>
            </div>
          </div>

          {/* DEDICATED ADD FORM */}
          <div className="bg-white rounded-2xl p-5 md:p-6 mb-8 border border-slate-200/80 shadow-sm">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Add New State
            </span>

            <form
              onSubmit={handleAddSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaMapMarkerAlt size={15} />
                </div>
                <input
                  type="text"
                  placeholder="Enter new state name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={adding}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {adding ? (
                  <FaSpinner className="animate-spin" size={16} />
                ) : (
                  <FaPlus size={14} />
                )}
                <span>{adding ? "Adding..." : "Add State"}</span>
              </button>
            </form>
          </div>

          {/* DATA TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* TABLE TOOLBAR / SEARCH */}
            <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaSearch size={13} />
                </div>
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {searchQuery && (
                <span className="text-xs text-slate-500">
                  Showing <strong>{filteredStates.length}</strong> of{" "}
                  {states.length} states
                </span>
              )}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6 w-20">#</th>
                    <th className="py-3.5 px-6">State Name</th>
                    <th className="py-3.5 px-6 text-right w-52">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    [...Array(4)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6">
                          <div className="h-4 w-6 bg-slate-200 rounded"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 w-40 bg-slate-200 rounded"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredStates.length > 0 ? (
                    filteredStates.map((state, index) => {
                      const isEditing = editId === state._id;
                      const isDeleting = confirmDeleteId === state._id;

                      return (
                        <tr
                          key={state._id}
                          className={`transition-colors ${
                            isEditing
                              ? "bg-amber-50/50"
                              : "hover:bg-slate-50/90"
                          }`}
                        >
                          <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                            {String(index + 1).padStart(2, "0")}
                          </td>

                          {/* STATE NAME OR SEPARATE INLINE EDIT INPUT */}
                          <td className="py-3.5 px-6">
                            {isEditing ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdateSubmit(state._id);
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
                                disabled={updating}
                                className="w-full max-w-sm px-3 py-1.5 bg-white border border-amber-400 rounded-lg text-slate-800 font-medium outline-none ring-4 ring-amber-500/15 transition-all"
                              />
                            ) : (
                              <span className="font-medium text-slate-800">
                                {state.name}
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubmit(state._id)}
                                    disabled={updating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
                                  >
                                    {updating ? (
                                      <FaSpinner className="animate-spin" size={12} />
                                    ) : (
                                      <FaCheck size={12} />
                                    )}
                                    <span>Save</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={updating}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FaTimes size={12} />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              ) : isDeleting ? (
                                <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                  <span className="text-xs font-medium text-red-700 mr-1">
                                    Delete?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteState(state._id)}
                                    className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded transition-colors cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(state)}
                                    title="Edit State"
                                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FaEdit size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDeleteId(state._id)
                                    }
                                    title="Delete State"
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                          <FaMapMarkerAlt size={20} />
                        </div>
                        <p className="text-slate-700 font-medium">
                          {searchQuery
                            ? `No states matching "${searchQuery}"`
                            : "No states added yet"}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          {searchQuery
                            ? "Try adjusting your search term."
                            : "Use the form above to create your first state."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default States;
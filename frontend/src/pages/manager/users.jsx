
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaSearch,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaSync,
  FaTimes,
  FaSave,
  FaUserPlus,
  FaKey,
  FaEyeSlash,
  FaUserCog,
  FaCheckCircle,
} from "react-icons/fa";

const API = import.meta.env.VITE_APP_BACKEND;

const initialNewUser = {
  name: "",
  email: "",
  password: "",
  role: 3,
};

const initialPassword = {
  password: "",
  confirmPassword: "",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newUser, setNewUser] = useState(initialNewUser);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: 3,
  });

  const [passwordData, setPasswordData] = useState(initialPassword);

  // =====================================
  // FETCH USERS
  // =====================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/v1/auth/getusers`
      );

      const data =
        res.data.Users ||
        res.data.users ||
        res.data;

      setUsers(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Fetch users:", error);
      toast.error("Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================
  // ROLE HELPERS
  // =====================================

  const getRole = (role) => {
    if (Number(role) === 1) {
      return {
        label: "Administrator",
        short: "Admin",
        color:
          "bg-purple-100 text-purple-700 border-purple-200",
        icon: <FaShieldAlt />,
      };
    }

    return {
      label: "View Only",
      short: "View Only",
      color:
        "bg-blue-100 text-blue-700 border-blue-200",
      icon: <FaEye />,
    };
  };

  // =====================================
  // STATISTICS
  // =====================================

  const admins = users.filter(
    (u) => Number(u.role) === 1
  ).length;

  const viewers = users.filter(
    (u) => Number(u.role) === 3
  ).length;

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        user.name,
        user.username,
        user.email,
        user._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      const matchesRole =
        roleFilter === "ALL" ||
        Number(user.role) === Number(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // =====================================
  // REGISTER NEW USER
  // =====================================

  const registerUser = async (e) => {
    e.preventDefault();

    // if (newUser.password.length < 8) {
    //   return toast.error(
    //     "Password must contain at least 8 characters"
    //   );
    // }

    try {
      setSaving(true);

      await axios.post(
        `${API}/api/v1/auth/register`,
        {
          ...newUser,
          role: Number(newUser.role),
        }
      );

      toast.success("User registered successfully!");

      setNewUser(initialNewUser);
      setShowRegister(false);

      await fetchUsers();

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // OPEN EDIT MODAL
  // =====================================

  const openEdit = (user) => {
    setSelectedUser(user);

    setEditData({
      name: user.name || user.username || "",
      email: user.email || "",
      role: Number(user.role) === 1 ? 1 : 3,
    });

    setShowEdit(true);
  };

  // =====================================
  // UPDATE USER
  // =====================================

  const updateUser = async (e) => {
    e.preventDefault();

    if (!selectedUser?._id) return;

    try {
      setSaving(true);

      await axios.put(
        `${API}/api/v1/auth/profile/${selectedUser._id}`,
        {
          name: editData.name,
          email: editData.email,
          role: Number(editData.role),
        }
      );

      toast.success("User updated successfully!");

      setShowEdit(false);
      setSelectedUser(null);

      await fetchUsers();

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Unable to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // QUICK ROLE CHANGE
  // =====================================

  const changeRole = async (user, role) => {
    const newRole = Number(role);

    if (![1, 3].includes(newRole)) return;

    if (Number(user.role) === newRole) return;

    if (
      !window.confirm(
        `Change ${user.name || user.username} to ${
          newRole === 1 ? "Administrator" : "View Only"
        }?`
      )
    ) {
      return;
    }

    try {
      await axios.put(
        `${API}/api/v1/auth/profile/${user._id}`,
        { role: newRole }
      );

      toast.success("User role updated!");

      await fetchUsers();

    } catch (error) {
      console.error(error);
      toast.error("Role update failed");
    }
  };

  // =====================================
  // OPEN PASSWORD MODAL
  // =====================================

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordData(initialPassword);
    setShowPasswordModal(true);
  };

  // =====================================
  // UPDATE PASSWORD
  // =====================================

  const updatePassword = async (e) => {
    e.preventDefault();

    // if (passwordData.password.length < 8) {
    //   return toast.error(
    //     "Password must contain at least 8 characters"
    //   );
    // }

    if (
      passwordData.password !==
      passwordData.confirmPassword
    ) {
      return toast.error("Passwords do not match");
    }

    try {
      setSaving(true);

      await axios.put(
        `${API}/api/v1/auth/resetpassword/${selectedUser._id}`,
        {
          password: passwordData.password,
        }
      );

      toast.success("Password updated successfully!");

      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordData(initialPassword);

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Password update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE USER
  // =====================================

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Permanently delete ${
        user.name || user.username
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API}/api/v1/auth/deleteuser/${user._id}`
      );

      toast.success("User deleted successfully!");

      await fetchUsers();

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Unable to delete user"
      );
    }
  };

  // =====================================
  // REUSABLE INPUT
  // =====================================

  const inputClass =
    "w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm";

  // =====================================
  // USER CARD
  // =====================================

  const UserCard = ({ user }) => {
    const role = getRole(user.role);

    return (
      <div className="p-4 sm:p-5 hover:bg-slate-50 transition space-y-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
            <FaUserCircle />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 truncate">
              {user.name || user.username || "Unknown User"}
            </h3>

            <p className="text-xs text-slate-400 mt-1 truncate">
              ID: {user._id}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold ${role.color}`}
          >
            {role.icon}
            {role.short}
          </span>

        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-500">

          <p className="flex items-center gap-2 break-all">
            <FaEnvelope className="text-blue-500 shrink-0" />
            {user.email || "No email"}
          </p>

        

        </div>

        <div>
          <label className="text-xs font-bold text-slate-500">
            ACCESS PERMISSION
          </label>

          <select
            value={Number(user.role) === 1 ? 1 : 3}
            onChange={(e) =>
              changeRole(user, e.target.value)
            }
            className="w-full mt-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold outline-none"
          >
            <option value={1}>Administrator </option>
            <option value={3}>View Only </option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">

          <button
            onClick={() => openEdit(user)}
            className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
          >
            <FaEdit /> Edit
          </button>

          <button
            onClick={() => openPasswordModal(user)}
            className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition"
          >
            <FaKey /> Password
          </button>

          <button
            onClick={() => deleteUser(user)}
            className="flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
          >
            <FaTrash /> Delete
          </button>

        </div>

      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">

        <div className="flex flex-col lg:flex-row gap-5">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-64 shrink-0">
            <AdminMenu />
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* HEADER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <FaUserCog />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Administration / Access Control
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Users Management
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage accounts, registration, passwords and permissions.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => {
                      setNewUser(initialNewUser);
                      setShowRegister(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
                  >
                    <FaUserPlus />
                    Add User
                  </button>

                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold transition disabled:opacity-50"
                  >
                    <FaSync className={loading ? "animate-spin" : ""} />
                    Refresh
                  </button>

                </div>

              </div>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <StatCard
                title="Total Users"
                value={users.length}
                icon={<FaUsers />}
                color="blue"
              />

              <StatCard
                title="Administrators"
                value={admins}
                icon={<FaShieldAlt />}
                color="purple"
              />

              <StatCard
                title="View Only"
                value={viewers}
                icon={<FaEye />}
                color="emerald"
              />

            </div>

            {/* ROLE GUIDE */}
            <div className="grid sm:grid-cols-2 gap-4">

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3">
                <FaShieldAlt className="text-purple-600 text-xl mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 text-sm">
                    Administrator 
                  </h3>
                  <p className="text-xs text-purple-700 mt-1">
                    Full access to permitted system administration and management features.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <FaEye className="text-blue-600 text-xl mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 text-sm">
                    View Only 
                  </h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Read-only access to permitted information.
                  </p>
                </div>
              </div>

            </div>

            {/* SEARCH */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

              <div className="flex flex-col md:flex-row gap-3">

                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search name, email or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="1">Administrators</option>
                  <option value="3">View Only</option>
                </select>

              </div>

            </div>

            {/* USER LIST */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-800">
                    Registered Accounts
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    User details and access management.
                  </p>
                </div>

                <span className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap">
                  {filteredUsers.length} Users
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-500 mt-3">
                    Loading users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center">
                  <FaUsers className="text-4xl text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 mt-3">
                    No Users Found
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Try another search keyword.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden xl:block overflow-x-auto">

                    <table className="w-full text-left">

                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-4">User</th>
                          <th className="px-5 py-4">Contact</th>
                          <th className="px-5 py-4">Role</th>
                          <th className="px-5 py-4">Change Role</th>
                          <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredUsers.map((user) => {
                          const role = getRole(user.role);

                          return (
                            <tr key={user._id} className="hover:bg-slate-50 transition">

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                                    <FaUserCircle />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-bold text-sm text-slate-800">
                                      {user.name || user.username || "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      ID: {user._id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm text-slate-600 flex items-center gap-2 break-all">
                                  <FaEnvelope className="text-blue-500 shrink-0" />
                                  {user.email || "No email"}
                                </p>

                              
                              </td>

                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${role.color}`}>
                                  {role.icon}
                                  {role.label}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <select
                                  value={Number(user.role) === 1 ? 1 : 3}
                                  onChange={(e) =>
                                    changeRole(user, e.target.value)
                                  }
                                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white outline-none"
                                >
                                  <option value={1}>Admin </option>
                                  <option value={3}>View Only </option>
                                </select>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-2">

                                  <button
                                    onClick={() => openEdit(user)}
                                    title="Edit User"
                                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                  >
                                    <FaEdit />
                                  </button>

                                  <button
                                    onClick={() => openPasswordModal(user)}
                                    title="Update Password"
                                    className="p-2.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition"
                                  >
                                    <FaKey />
                                  </button>

                                  <button
                                    onClick={() => deleteUser(user)}
                                    title="Delete User"
                                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                                  >
                                    <FaTrash />
                                  </button>

                                </div>
                              </td>

                            </tr>
                          );
                        })}

                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE AND TABLET */}
                  <div className="xl:hidden divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>

                </>
              )}
            </div>

          </main>
        </div>
      </div>

      {/* =====================================
          REGISTER USER MODAL
      ===================================== */}

      {showRegister && (
        <Modal
          title="Register New User"
          subtitle="Create a new system account"
          onClose={() => setShowRegister(false)}
          color="bg-blue-600"
        >
          <form onSubmit={registerUser} className="p-5 space-y-4">

            <FormField
              label="Full Name"
              value={newUser.name}
              onChange={(v) => setNewUser({ ...newUser, name: v })}
              required
              placeholder="Enter full name"
            />

            <FormField
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(v) => setNewUser({ ...newUser, email: v })}
              required
              placeholder="Enter email address"
            />

       

            <PasswordField
              label="Password"
              value={newUser.password}
              onChange={(v) => setNewUser({ ...newUser, password: v })}
              visible={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              placeholder="Password"
            />

            <div>
              <label className="text-xs font-bold text-slate-600">
                USER ROLE
              </label>

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: Number(e.target.value),
                  })
                }
                className={inputClass}
              >
                <option value={3}>View Only </option>
                <option value={1}>Administrator </option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <FaUserPlus />
                {saving ? "Registering..." : "Create Account"}
              </button>

            </div>

          </form>
        </Modal>
      )}

      {/* =====================================
          EDIT USER MODAL
      ===================================== */}

      {showEdit && selectedUser && (
        <Modal
          title="Edit User Account"
          subtitle="Update user information and permissions"
          onClose={() => setShowEdit(false)}
          color="bg-slate-900"
        >
          <form onSubmit={updateUser} className="p-5 space-y-4">

            <FormField
              label="Full Name"
              value={editData.name}
              onChange={(v) => setEditData({ ...editData, name: v })}
              required
            />

            <FormField
              label="Email Address"
              type="email"
              value={editData.email}
              onChange={(v) => setEditData({ ...editData, email: v })}
            />

         

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <label className="text-xs font-bold text-slate-600">
                ACCESS PERMISSION
              </label>

              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    role: Number(e.target.value),
                  })
                }
                className={inputClass}
              >
                <option value={1}>Administrator</option>
                <option value={3}>View Only </option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>
        </Modal>
      )}

      {/* =====================================
          UPDATE PASSWORD MODAL
      ===================================== */}

      {showPasswordModal && selectedUser && (
        <Modal
          title="Update Password"
          subtitle={`Account: ${selectedUser.name || selectedUser.username || selectedUser.email}`}
          onClose={() => setShowPasswordModal(false)}
          color="bg-slate-900"
        >
          <form onSubmit={updatePassword} className="p-5 space-y-4">

            <PasswordField
              label="New Password"
              value={passwordData.password}
              onChange={(v) =>
                setPasswordData({
                  ...passwordData,
                  password: v,
                })
              }
              visible={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              placeholder="Enter new password"
            />

            <PasswordField
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(v) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: v,
                })
              }
              visible={showConfirmPassword}
              toggle={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              placeholder="Confirm new password"
            />

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800">
              <FaKey className="inline mr-2" />
              This action will replace the user's existing password.
            </div>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaKey />
                {saving ? "Updating..." : "Update Password"}
              </button>

            </div>

          </form>
        </Modal>
      )}

    </Layout>
  );
};

// =====================================
// STATISTICS CARD
// =====================================

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// =====================================
// MODAL COMPONENT
// =====================================

const Modal = ({ title, subtitle, onClose, color, children }) => (
  <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">

    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">

      <div className={`${color} text-white p-5 flex justify-between items-center`}>
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs text-white/70 mt-1">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <FaTimes />
        </button>
      </div>

      {children}

    </div>
  </div>
);

// =====================================
// FORM FIELD
// =====================================

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) => (
  <div>
    <label className="text-xs font-bold text-slate-600">
      {label}
    </label>

    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
);

// =====================================
// PASSWORD FIELD
// =====================================

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  toggle,
  placeholder,
}) => (
  <div>
    <label className="text-xs font-bold text-slate-600">
      {label}
    </label>

    <div className="relative mt-2">
      <input
        type={visible ? "text" : "password"}
        value={value}
        required
        
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>
);

export default Users;

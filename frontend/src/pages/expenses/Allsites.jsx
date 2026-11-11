
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBuilding,
  FaSyncAlt,
  FaEnvelope,
  FaLock,
  FaCopy,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaArrowRight,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
  FaPhoneAlt,
} from "react-icons/fa";

const API = import.meta.env.VITE_APP_BACKENDEXP;

// Date Format
const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Allsites = () => {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [copiedField, setCopiedField] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [editingSite, setEditingSite] = useState(null);
  const [deletingSite, setDeletingSite] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    sitename: "",
  });

  // ==========================================
  // FETCH SITES
  // ==========================================

  const fetchSites = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/v2/expenses/getsites`
      );

      const data = res.data.sites || res.data;

      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load sites");
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // ==========================================
  // COPY EMAIL / PASSWORD
  // ==========================================

  const handleCopy = async (value, field, siteId) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      const copyId = `${siteId}-${field}`;

      setCopiedField(copyId);

      toast.success(`${field} copied successfully!`);

      setTimeout(() => {
        setCopiedField((prev) =>
          prev === copyId ? "" : prev
        );
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Unable to copy!");
    }
  };

  // ==========================================
  // SHOW / HIDE PASSWORD
  // ==========================================

  const togglePassword = (siteId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [siteId]: !prev[siteId],
    }));
  };

  // ==========================================
  // EDIT SITE
  // ==========================================

  const handleEdit = (site) => {
    setEditingSite(site);

    setFormData({
      name: site.name || "",
      phone: site.phone || "",
      email: site.email || "",
      password: site.password || "",
      sitename: site.sitename || "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSite = async (e) => {
    e.preventDefault();

    if (!editingSite || saving) return;

    try {
      setSaving(true);

      await axios.put(
        `${API}/api/v2/expenses/update-site/${editingSite._id}`,
        formData
      );

      // Update UI immediately
      setSites((prev) =>
        prev.map((site) =>
          site._id === editingSite._id
            ? { ...site, ...formData }
            : site
        )
      );

      toast.success("Site updated successfully!");

      setEditingSite(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.msg || "Unable to update site"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE SITE + RELATED BILLS
  // ==========================================

  const handleDeleteSite = async () => {
    if (!deletingSite || deleting) return;

    try {
      setDeleting(true);

      const res = await axios.delete(
        `${API}/api/v2/expenses/delete-site/${deletingSite.email}`
      );

      // Remove from UI immediately
      setSites((prev) =>
        prev.filter(
          (site) => site._id !== deletingSite._id
        )
      );

      // Clear password visibility
      setVisiblePasswords((prev) => {
        const updated = { ...prev };
        delete updated[deletingSite._id];
        return updated;
      });

      toast.success(
        `Site deleted successfully!`
      );

      setDeletingSite(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.msg || "Unable to delete site"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredSites = sites.filter((site) =>
    Object.values(site)
      .filter(
        (value) =>
          value !== null && value !== undefined
      )
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      )
  );

  // ==========================================
  // INPUT CLASS
  // ==========================================

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout title={"All Sites - Tharu & Sons"}>
    <div className="min-h-screen bg-slate-50 p-3 pb-24 sm:p-5 lg:p-6">

      <div className="mx-auto max-w-[1700px] space-y-4">

        {/* HEADER */}

        <div className="flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <FaBuilding size={17} />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                All Sites
              </h1>

              <p className="text-[11px] text-slate-500 sm:text-xs">
                Manage registered sites and credentials
              </p>
            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            <button
              onClick={fetchSites}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
            >
              <FaSyncAlt
                className={loading ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <Link
              to="/dashboard/manager/addexpmanager"
              className="flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-100"
            >
              <FaPlus size={12} />

              <span className="hidden sm:inline">
                Add Site
              </span>
            </Link>

          </div>

        </div>

        {/* SEARCH */}

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">

          <div className="relative flex-1">

            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

            <input
              type="text"
              placeholder="Search site, phone, email, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <FaTimes size={12} />
              </button>
            )}

          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 sm:min-w-[130px]">

            <span className="text-xs font-semibold text-blue-600">
              Total Sites
            </span>

            <span className="text-lg font-extrabold text-blue-700">
              {filteredSites.length}
            </span>

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">

            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-lg bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                    <div className="h-2 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="mt-4 h-8 rounded-lg bg-slate-100" />
                <div className="mt-2 h-10 rounded-lg bg-slate-100" />
                <div className="mt-2 h-10 rounded-lg bg-slate-100" />
              </div>
            ))}

          </div>

        ) : filteredSites.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-xl border border-slate-200 bg-white py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FaBuilding size={24} />
            </div>

            <h3 className="mt-3 font-bold text-slate-700">
              No Sites Found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {search
                ? "Try searching with another keyword."
                : "No sites are available at the moment."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}

          </div>

        ) : (

          /* SITE CARDS */

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">

            {filteredSites.map((site, index) => {

              const siteId = site._id || index;

              const emailCopyId = `${siteId}-Email`;
              const passwordCopyId = `${siteId}-Password`;

              return (

                <div
                  key={siteId}
                  className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >

                  {/* TOP ACCENT */}

                  <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition group-hover:opacity-100" />

                  {/* HEADER */}

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <FaBuilding size={15} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3
                        className="truncate text-sm font-bold text-slate-800"
                        title={site.name || ""}
                      >
                        {site.name || "Unnamed Site"}
                      </h3>

                      <p className="truncate text-[10px] text-slate-500">
                        <FaPhoneAlt className="mr-1 inline" />
                        {site.phone || "No phone number"}
                      </p>

                    </div>

                    <span className="shrink-0 rounded-md bg-slate-50 px-1.5 py-1 text-[9px] font-bold text-slate-400">
                      #{index + 1}
                    </span>

                    <Link
                      to={`/dashboard/manager/cashbookdetails/${encodeURIComponent(site.email || "")}`}
                      title="Open site dashboard"
                      className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    >
                      <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                  </div>

                  {/* EDIT / DELETE */}

                  <div className="mt-2 flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() => handleEdit(site)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 py-1.5 text-[10px] font-bold text-blue-600 transition hover:border-blue-300 hover:bg-blue-600 hover:text-white"
                    >
                      <FaEdit size={11} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingSite(site)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 py-1.5 text-[10px] font-bold text-red-500 transition hover:border-red-300 hover:bg-red-500 hover:text-white"
                    >
                      <FaTrash size={10} />
                      Delete
                    </button>

                  </div>

                  {/* EMAIL */}

                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 transition hover:bg-blue-50">

                    <FaEnvelope
                      className="shrink-0 text-blue-500"
                      size={12}
                    />

                    <div className="min-w-0 flex-1">

                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Email
                      </p>

                      <p
                        className="truncate text-xs font-semibold text-slate-700"
                        title={site.email || ""}
                      >
                        {site.email || "-"}
                      </p>

                    </div>

                    <button
                      type="button"
                      disabled={!site.email}
                      onClick={() =>
                        handleCopy(site.email, "Email", siteId)
                      }
                      className={`shrink-0 rounded-md p-1.5 transition ${
                        copiedField === emailCopyId
                          ? "bg-green-100 text-green-600"
                          : "text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                      } disabled:opacity-30`}
                      title="Copy email"
                    >
                      {copiedField === emailCopyId ? (
                        <FaCheck size={12} />
                      ) : (
                        <FaCopy size={12} />
                      )}
                    </button>

                  </div>

                  {/* PASSWORD */}

                  <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 transition hover:bg-indigo-50">

                    <FaLock
                      className="shrink-0 text-indigo-500"
                      size={12}
                    />

                    <div className="min-w-0 flex-1">

                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Password
                      </p>

                      <p
                        className="truncate text-xs font-semibold text-slate-700"
                        title={
                          visiblePasswords[siteId]
                            ? site.password || ""
                            : ""
                        }
                      >
                        {site.password
                          ? visiblePasswords[siteId]
                            ? site.password
                            : "•".repeat(
                                Math.min(
                                  String(site.password).length,
                                  12
                                )
                              )
                          : "-"}
                      </p>

                    </div>

                    <button
                      type="button"
                      disabled={!site.password}
                      onClick={() => togglePassword(siteId)}
                      className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-30"
                      title="Show / Hide password"
                    >
                      {visiblePasswords[siteId] ? (
                        <FaEyeSlash size={12} />
                      ) : (
                        <FaEye size={12} />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!site.password}
                      onClick={() =>
                        handleCopy(site.password, "Password", siteId)
                      }
                      className={`shrink-0 rounded-md p-1.5 transition ${
                        copiedField === passwordCopyId
                          ? "bg-green-100 text-green-600"
                          : "text-slate-400 hover:bg-indigo-100 hover:text-indigo-600"
                      } disabled:opacity-30`}
                      title="Copy password"
                    >
                      {copiedField === passwordCopyId ? (
                        <FaCheck size={12} />
                      ) : (
                        <FaCopy size={12} />
                      )}
                    </button>

                  </div>

                  {/* LOCATION AND DATE */}

                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">

                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">

                      <FaMapMarkerAlt className="shrink-0 text-blue-500" />

                      <span
                        className="truncate"
                        title={site.sitename || ""}
                      >
                        {site.sitename || "No location"}
                      </span>

                    </div>

                    {site.createdAt && (
                      <span className="shrink-0 text-[9px] text-slate-400">
                        {formatDate(site.createdAt)}
                      </span>
                    )}

                  </div>

                </div>

              );
            })}

          </div>

        )}

        {/* FOOTER */}

        {!loading && filteredSites.length > 0 && (

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400">

            <span>
              Showing{" "}
              <span className="font-bold text-slate-600">
                {filteredSites.length}
              </span>{" "}
              of {sites.length} sites
            </span>

            <span className="font-medium">
              Site Management
            </span>

          </div>

        )}

      </div>

      {/* ====================================== */}
      {/* EDIT SITE MODAL */}
      {/* ====================================== */}

      {editingSite && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setEditingSite(null);
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">

              <div>
                <h2 className="text-lg font-bold">
                  Edit Site
                </h2>

                <p className="text-xs text-blue-100">
                  Update site information and credentials
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingSite(null)}
                disabled={saving}
                className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:opacity-50"
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleUpdateSite}
              className="space-y-3 p-5"
            >

              {[
                {
                  name: "name",
                  label: "Site Name",
                  placeholder: "Enter site name",
                },
                {
                  name: "phone",
                  label: "Phone",
                  placeholder: "Enter phone number",
                },
                {
                  name: "email",
                  label: "Email",
                  placeholder: "Enter email",
                  type: "email",
                },
                {
                  name: "password",
                  label: "Password",
                  placeholder: "Enter password",
                },
                {
                  name: "sitename",
                  label: "Location",
                  placeholder: "Enter location",
                },
              ].map((field) => (

                <div key={field.name}>

                  <label className="mb-1 block text-xs font-bold text-slate-600">
                    {field.label}
                  </label>

                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleFormChange}
                    placeholder={field.placeholder}
                    className={inputClass}
                    required={
                      field.name === "name" ||
                      field.name === "email"
                    }
                  />

                </div>

              ))}

              <div className="flex gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ====================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ====================================== */}

      {deletingSite && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">

            <div className="p-6 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <FaExclamationTriangle size={24} />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-slate-800">
                Delete Site?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {deletingSite.name}
                </span>?
              </p>

              {/* WARNING */}

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left">

                <p className="text-xs font-bold text-red-600">
                  Permanent deletion
                </p>

                <p className="mt-1 text-xs leading-5 text-red-500">
                  The site and all bills associated with this email address will be permanently deleted.
                </p>

                <p className="mt-2 break-all text-xs font-bold text-red-700">
                  {deletingSite.email}
                </p>

              </div>

              {/* BUTTONS */}

              <div className="mt-5 flex gap-2">

                <button
                  type="button"
                  onClick={() => setDeletingSite(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSite}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrash />
                  )}

                  {deleting ? "Deleting..." : "Delete Site"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
    </Layout>
  );
};

export default Allsites;

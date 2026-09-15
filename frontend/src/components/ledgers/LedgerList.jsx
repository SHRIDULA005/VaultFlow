import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./LedgerList.css";

const API_BASE_URL = "http://localhost:8080";

const SESSION_EXPIRED = "Session expired. Please log in again.";

const LedgerList = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [editingLedger, setEditingLedger] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // =========================================================
  // AUTH / ROLE
  // =========================================================

  const getRole = () =>
    (localStorage.getItem("role") || "")
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");

  const role = getRole();

  const canManageLedgers =
    role === "ADMIN" || role === "AUDITOR";

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  // =========================================================
  // NAVIGATION
  // =========================================================
  // Router-independent so Jest tests can render this component
  // without wrapping it in BrowserRouter.

  const navigate = (path, replace = false) => {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // =========================================================
  // ERROR HANDLING
  // =========================================================

  const handleApiError = (error, fallbackMessage) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      setErrorMessage(SESSION_EXPIRED);
      return;
    }

    if (status === 403) {
      setErrorMessage("You are not authorized to perform this action.");
      return;
    }

    const backendMessage = error?.response?.data?.message;

    setErrorMessage(backendMessage || fallbackMessage);
  };

  // =========================================================
  // LOAD LEDGERS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadLedgers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setErrorMessage(SESSION_EXPIRED);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axios.get(
          `${API_BASE_URL}/api/ledgers`,
          getAuthConfig()
        );

        if (!mounted) return;

        const data = response.data;

        if (Array.isArray(data)) {
          setLedgers(data);
        } else if (Array.isArray(data?.content)) {
          setLedgers(data.content);
        } else {
          setLedgers([]);
        }
      } catch (error) {
        console.error("Error loading ledgers:", error);

        if (mounted) {
          handleApiError(
            error,
            "Unable to load ledgers. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLedgers();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredLedgers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...ledgers]
      .filter((ledger) => {
        if (!search) return true;

        const id = String(ledger.id ?? "").toLowerCase();
        const description = String(
          ledger.description ?? ""
        ).toLowerCase();

        return (
          id.includes(search) ||
          description.includes(search)
        );
      })
      .sort((a, b) => {
        const idA = Number(a.id || 0);
        const idB = Number(b.id || 0);

        return sortOrder === "asc"
          ? idA - idB
          : idB - idA;
      });
  }, [ledgers, searchTerm, sortOrder]);

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreateLedger = () => {
    if (!canManageLedgers) {
      setErrorMessage(
        "You are not authorized to create ledgers."
      );
      return;
    }

    navigate("/ledgers/new");
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (ledger) => {
    if (!canManageLedgers) {
      setErrorMessage(
        "You are not authorized to edit ledgers."
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setEditingLedger(ledger);
    setEditDescription(ledger.description || "");

    setEditCreatedAt(
      ledger.createdAt
        ? String(ledger.createdAt).substring(0, 10)
        : ""
    );
  };

  const closeEditModal = () => {
    if (savingEdit) return;

    setEditingLedger(null);
    setEditDescription("");
    setEditCreatedAt("");
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingLedger) return;

    if (!canManageLedgers) {
      setErrorMessage(
        "You are not authorized to edit ledgers."
      );
      return;
    }

    const description = editDescription.trim();

    if (!description) {
      setErrorMessage(
        "Ledger description cannot be empty."
      );
      return;
    }

    const payload = {
      description,
    };

    if (editCreatedAt) {
      payload.createdAt = editCreatedAt;
    }

    try {
      setSavingEdit(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await axios.put(
        `${API_BASE_URL}/api/ledgers/${editingLedger.id}`,
        payload,
        getAuthConfig()
      );

      const updatedLedger = response.data || {};

      setLedgers((current) =>
        current.map((ledger) =>
          ledger.id === editingLedger.id
            ? {
                ...ledger,
                ...updatedLedger,
                description:
                  updatedLedger.description ?? description,
                createdAt:
                  updatedLedger.createdAt ?? ledger.createdAt,
              }
            : ledger
        )
      );

      setSuccessMessage(
        `Ledger #${editingLedger.id} updated successfully.`
      );

      closeEditModal();
    } catch (error) {
      console.error("Error updating ledger:", error);

      const status = error?.response?.status;

      if (status === 403) {
        setErrorMessage(
          "You are not authorized to edit this ledger."
        );
      } else {
        handleApiError(
          error,
          "Unable to update ledger. Please try again."
        );
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (ledgerId) => {
    if (!canManageLedgers) {
      setErrorMessage(
        "You are not authorized to delete ledgers."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Ledger #${ledgerId}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(ledgerId);
      setErrorMessage("");
      setSuccessMessage("");

      await axios.delete(
        `${API_BASE_URL}/api/ledgers/${ledgerId}`,
        getAuthConfig()
      );

      setLedgers((current) =>
        current.filter((ledger) => ledger.id !== ledgerId)
      );

      setSuccessMessage(
        `Ledger #${ledgerId} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting ledger:", error);

      const status = error?.response?.status;

      if (status === 403) {
        setErrorMessage(
          "You are not authorized to delete this ledger."
        );
      } else {
        handleApiError(
          error,
          "Unable to delete ledger. Please try again."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).substring(0, 10);
    }

    return date.toISOString().substring(0, 10);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="ledger-page">
        <div className="ledger-main">
          <div className="ledger-loading-card">
            <div className="ledger-spinner"></div>

            <h3>Loading ledgers...</h3>

            <p>
              Please wait while we retrieve your financial
              ledgers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="ledger-page">
      <main className="ledger-main">

        {/* HEADER */}
        <section className="ledger-page-header">
          <div>
            <div className="ledger-brand-label">
              <span className="ledger-brand-dot"></span>
              VAULTFLOW
            </div>

            <h1>Ledgers</h1>

            <p>
              View and manage your financial ledgers.
            </p>
          </div>

          {canManageLedgers && (
            <button
              className="ledger-create-button"
              onClick={handleCreateLedger}
              type="button"
            >
              <span className="button-plus">+</span>
              Create Ledger
            </button>
          )}
        </section>

        {/* ERROR */}
        {errorMessage && (
          <div className="ledger-alert ledger-alert-error">
            <span className="alert-icon">!</span>

            <div>
              <strong>Action failed</strong>
              <p>{errorMessage}</p>
            </div>

            <button
              type="button"
              className="alert-close"
              onClick={() => setErrorMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="ledger-alert ledger-alert-success">
            <span className="alert-icon">✓</span>

            <div>
              <strong>Success</strong>
              <p>{successMessage}</p>
            </div>

            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* TOOLBAR */}
        <section className="ledger-toolbar">

          <div className="ledger-search-section">
            <label>Search Ledgers</label>

            <div className="ledger-search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Ledger ID or Description"
              />

              {searchTerm && (
                <button
                  className="search-clear"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="ledger-sort-section">
            <label>Sort By</label>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">
                Ledger ID (Ascending)
              </option>

              <option value="desc">
                Ledger ID (Descending)
              </option>
            </select>
          </div>

          <div className="ledger-total-section">
            <div className="ledger-total-icon">▱</div>

            <div>
              <span>Total Ledgers</span>
              <strong>{ledgers.length}</strong>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="ledger-content">

          {filteredLedgers.length === 0 ? (
            <div className="ledger-empty-state">
              <div className="empty-icon">▱</div>

              <h3>
                {searchTerm
                  ? "No ledgers found"
                  : "No ledgers available"}
              </h3>

              <p>
                {searchTerm
                  ? "Try changing your search criteria."
                  : "Create your first financial ledger to get started."}
              </p>

              {!searchTerm && canManageLedgers && (
                <button
                  className="ledger-create-button"
                  onClick={handleCreateLedger}
                  type="button"
                >
                  <span className="button-plus">+</span>
                  Create Ledger
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="ledger-grid">
                {filteredLedgers.map((ledger) => (
                  <article
                    className="ledger-card"
                    key={ledger.id}
                  >
                    <div className="ledger-card-top-line"></div>

                    {/* CARD HEADER */}
                    <div className="ledger-card-header">
                      <div>
                        <span className="ledger-card-label">
                          LEDGER ID
                        </span>

                        <h2>#{ledger.id}</h2>
                      </div>

                      <div className="ledger-card-icon">
                        L
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="ledger-card-body">

                      <div className="ledger-info-block">
                        <span>Description</span>

                        <strong>
                          {ledger.description ||
                            "No description"}
                        </strong>
                      </div>

                      <div className="ledger-divider"></div>

                      <div className="ledger-info-block">
                        <span>Created Date</span>

                        <strong className="ledger-date">
                          <span className="calendar-icon">
                            ▣
                          </span>

                          {formatDate(ledger.createdAt)}
                        </strong>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    {canManageLedgers && (
                      <div className="ledger-card-footer">
                        <span className="actions-label">
                          Actions
                        </span>

                        <div className="ledger-actions">

                          <button
                            className="ledger-edit-button"
                            type="button"
                            onClick={() =>
                              handleEdit(ledger)
                            }
                          >
                            <span>✎</span>
                            Edit
                          </button>

                          <button
                            className="ledger-delete-button"
                            type="button"
                            onClick={() =>
                              handleDelete(ledger.id)
                            }
                            disabled={
                              deletingId === ledger.id
                            }
                          >
                            <span>♲</span>

                            {deletingId === ledger.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              <div className="ledger-result-count">
                Showing{" "}
                <strong>
                  {filteredLedgers.length}
                </strong>{" "}
                ledger
                {filteredLedgers.length !== 1
                  ? "s"
                  : ""}
              </div>
            </>
          )}
        </section>
      </main>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingLedger && (
        <div
          className="ledger-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingEdit
            ) {
              closeEditModal();
            }
          }}
        >
          <div className="ledger-edit-modal">

            {/* MODAL HEADER */}
            <div className="ledger-modal-header">
              <div className="ledger-modal-title-area">
                <div className="ledger-modal-icon">
                  ✎
                </div>

                <div>
                  <h2>Edit Ledger</h2>

                  <p>
                    Update the ledger information.
                  </p>
                </div>
              </div>

              <button
                className="ledger-modal-close"
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
              >
                ×
              </button>
            </div>

            {/* LEDGER ID */}
            <div className="ledger-id-preview">
              <div>
                <span>LEDGER ID</span>

                <strong>
                  #{editingLedger.id}
                </strong>
              </div>

              <div className="ledger-id-preview-icon">
                L
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSaveEdit}
              className="ledger-edit-form"
            >
              <div className="form-field">
                <label>
                  Ledger Description
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  placeholder="Enter ledger description"
                  autoFocus
                  required
                  disabled={savingEdit}
                />
              </div>

              <div className="form-field">
                <label>Created Date</label>

                <div className="date-input-wrapper">
                  <input
                    type="date"
                    value={editCreatedAt}
                    onChange={(e) =>
                      setEditCreatedAt(e.target.value)
                    }
                    disabled={savingEdit}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="ledger-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-button"
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>▣</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerList;
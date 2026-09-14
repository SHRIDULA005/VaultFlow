import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LedgerList.css";

const API_BASE_URL = "http://localhost:8080";

const LedgerList = () => {

  const navigate = useNavigate();

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

  // Edit modal
  const [editingLedger, setEditingLedger] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // =========================================================
  // AUTH HELPERS
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getRole = () => {

    const role =
      localStorage.getItem("role") || "";

    return role
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");
  };

  const role = getRole();

  const canManageLedgers =
    role === "AUDITOR" ||
    role === "ADMIN";

  const authHeaders = () => {

    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // =========================================================
  // LOAD LEDGERS
  // =========================================================
  // IMPORTANT:
  // The function is kept INSIDE useEffect so ESLint does not
  // report react-hooks/exhaustive-deps.
  // =========================================================

  useEffect(() => {

    let isMounted = true;

    const loadLedgers = async () => {

      try {

        if (isMounted) {
          setLoading(true);
          setErrorMessage("");
        }

        const token =
          localStorage.getItem("token");

        // =====================================================
        // NO TOKEN
        // =====================================================

        if (!token) {

          if (isMounted) {

            setErrorMessage(
              "Your session has expired. Please login again."
            );

            setLoading(false);
          }

          return;
        }

        // =====================================================
        // GET LEDGERS
        // =====================================================

        const response = await axios.get(
          `${API_BASE_URL}/api/ledgers`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

        if (!isMounted) {
          return;
        }

        const data = response.data;

        // =====================================================
        // ARRAY RESPONSE
        // =====================================================

        if (Array.isArray(data)) {

          setLedgers(data);

        }

        // =====================================================
        // SPRING PAGE RESPONSE
        // =====================================================

        else if (
          data &&
          Array.isArray(data.content)
        ) {

          setLedgers(data.content);

        }

        // =====================================================
        // INVALID RESPONSE
        // =====================================================

        else {

          setLedgers([]);

        }

      } catch (error) {

        console.error(
          "Error loading ledgers:",
          error
        );

        if (!isMounted) {
          return;
        }

        const status =
          error?.response?.status;

        // =====================================================
        // 401 - SESSION EXPIRED
        // =====================================================

        if (status === 401) {

          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");

          setErrorMessage(
            "Your session has expired. Please login again."
          );

        }

        // =====================================================
        // 403 - FORBIDDEN
        // =====================================================

        else if (status === 403) {

          setErrorMessage(
            "You are not authorized to view ledgers."
          );

        }

        // =====================================================
        // OTHER ERROR
        // =====================================================

        else {

          setErrorMessage(
            "Unable to load ledgers. Please try again."
          );

        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }
    };

    loadLedgers();

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      isMounted = false;
    };

  }, []);

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredLedgers = useMemo(() => {

    const filtered =
      ledgers.filter((ledger) => {

        const id =
          String(
            ledger.id ?? ""
          ).toLowerCase();

        const description =
          String(
            ledger.description ?? ""
          ).toLowerCase();

        const search =
          searchTerm
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          id.includes(search) ||
          description.includes(search)
        );
      });

    return [...filtered].sort(
      (a, b) => {

        const idA =
          Number(a.id || 0);

        const idB =
          Number(b.id || 0);

        return sortOrder === "asc"
          ? idA - idB
          : idB - idA;
      }
    );

  }, [
    ledgers,
    searchTerm,
    sortOrder,
  ]);

  // =========================================================
  // CREATE LEDGER
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
  // OPEN EDIT MODAL
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

    setEditDescription(
      ledger.description || ""
    );

    if (ledger.createdAt) {

      setEditCreatedAt(
        String(
          ledger.createdAt
        ).substring(0, 10)
      );

    } else {

      setEditCreatedAt("");

    }
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {

    if (savingEdit) {
      return;
    }

    setEditingLedger(null);
    setEditDescription("");
    setEditCreatedAt("");
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const handleSaveEdit = async (event) => {

    event.preventDefault();

    if (!editingLedger) {
      return;
    }

    // =======================================================
    // ROLE CHECK
    // =======================================================

    if (!canManageLedgers) {

      setErrorMessage(
        "You are not authorized to edit ledgers."
      );

      return;
    }

    // =======================================================
    // DESCRIPTION VALIDATION
    // =======================================================

    if (!editDescription.trim()) {

      setErrorMessage(
        "Ledger description cannot be empty."
      );

      return;
    }

    try {

      setSavingEdit(true);

      setErrorMessage("");
      setSuccessMessage("");

      // =====================================================
      // REQUEST PAYLOAD
      // =====================================================

      const payload = {
        description:
          editDescription.trim(),
      };

      if (editCreatedAt) {

        payload.createdAt =
          editCreatedAt;

      }

      // =====================================================
      // PUT REQUEST
      // =====================================================

      const response =
        await axios.put(
          `${API_BASE_URL}/api/ledgers/${editingLedger.id}`,
          payload,
          {
            headers:
              authHeaders(),
          }
        );

      const updatedLedger =
        response.data;

      // =====================================================
      // UPDATE UI WITHOUT RELOADING
      // =====================================================

      setLedgers(
        (previousLedgers) =>
          previousLedgers.map(
            (ledger) => {

              if (
                ledger.id !==
                editingLedger.id
              ) {
                return ledger;
              }

              return {
                ...ledger,

                ...updatedLedger,

                description:
                  updatedLedger.description ??
                  editDescription.trim(),

                createdAt:
                  updatedLedger.createdAt ??
                  ledger.createdAt,
              };
            }
          )
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccessMessage(
        `Ledger #${editingLedger.id} updated successfully.`
      );

      // =====================================================
      // CLOSE MODAL
      // =====================================================

      setEditingLedger(null);
      setEditDescription("");
      setEditCreatedAt("");

    } catch (error) {

      console.error(
        "Error updating ledger:",
        error
      );

      const status =
        error?.response?.status;

      // =====================================================
      // 401
      // =====================================================

      if (status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setErrorMessage(
          "Your session has expired. Please login again."
        );

      }

      // =====================================================
      // 403
      // =====================================================

      else if (status === 403) {

        setErrorMessage(
          "You are not authorized to edit this ledger."
        );

      }

      // =====================================================
      // BACKEND MESSAGE
      // =====================================================

      else if (
        error?.response?.data?.message
      ) {

        setErrorMessage(
          error.response.data.message
        );

      }

      // =====================================================
      // GENERIC
      // =====================================================

      else {

        setErrorMessage(
          "Unable to update ledger. Please try again."
        );

      }

    } finally {

      setSavingEdit(false);

    }
  };

  // =========================================================
  // DELETE LEDGER
  // =========================================================

  const handleDelete = async (ledgerId) => {

    if (!canManageLedgers) {

      setErrorMessage(
        "You are not authorized to delete ledgers."
      );

      return;
    }

    // =======================================================
    // CONFIRM
    // =======================================================

    const confirmed =
      window.confirm(
        `Are you sure you want to delete Ledger #${ledgerId}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(ledgerId);

      setErrorMessage("");
      setSuccessMessage("");

      // =====================================================
      // DELETE REQUEST
      // =====================================================

      await axios.delete(
        `${API_BASE_URL}/api/ledgers/${ledgerId}`,
        {
          headers:
            authHeaders(),
        }
      );

      // =====================================================
      // REMOVE FROM UI
      // =====================================================

      setLedgers(
        (previousLedgers) =>
          previousLedgers.filter(
            (ledger) =>
              ledger.id !== ledgerId
          )
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccessMessage(
        `Ledger #${ledgerId} deleted successfully.`
      );

    } catch (error) {

      console.error(
        "Error deleting ledger:",
        error
      );

      const status =
        error?.response?.status;

      // =====================================================
      // 401
      // =====================================================

      if (status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setErrorMessage(
          "Your session has expired. Please login again."
        );

      }

      // =====================================================
      // 403
      // =====================================================

      else if (status === 403) {

        setErrorMessage(
          "You are not authorized to delete this ledger."
        );

      }

      // =====================================================
      // OTHER ERROR
      // =====================================================

      else {

        setErrorMessage(
          "Unable to delete ledger. Please try again."
        );

      }

    } finally {

      setDeletingId(null);

    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        dateValue
      ).substring(0, 10);
    }

    return date
      .toISOString()
      .substring(0, 10);
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {

    return (

      <div className="ledger-page">

        <div className="ledger-main">

          <div className="ledger-loading-card">

            <div className="ledger-spinner"></div>

            <h3>
              Loading ledgers...
            </h3>

            <p>
              Please wait while we retrieve
              your financial ledgers.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="ledger-page">

      <main className="ledger-main">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="ledger-page-header">

          <div>

            <div className="ledger-brand-label">

              <span
                className="ledger-brand-dot"
              ></span>

              VAULTFLOW

            </div>

            <h1>
              Ledgers
            </h1>

            <p>
              View and manage your financial ledgers.
            </p>

          </div>


          {/* CREATE BUTTON */}

          {canManageLedgers && (

            <button
              className="ledger-create-button"
              onClick={handleCreateLedger}
            >

              <span className="button-plus">
                +
              </span>

              Create Ledger

            </button>

          )}

        </section>


        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {errorMessage && (

          <div
            className="
              ledger-alert
              ledger-alert-error
            "
          >

            <span className="alert-icon">
              !
            </span>

            <div>

              <strong>
                Action failed
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

            <button
              onClick={() =>
                setErrorMessage("")
              }
              className="alert-close"
              type="button"
            >
              ×
            </button>

          </div>

        )}


        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {successMessage && (

          <div
            className="
              ledger-alert
              ledger-alert-success
            "
          >

            <span className="alert-icon">
              ✓
            </span>

            <div>

              <strong>
                Success
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

            <button
              onClick={() =>
                setSuccessMessage("")
              }
              className="alert-close"
              type="button"
            >
              ×
            </button>

          </div>

        )}


        {/* ===================================================
            SEARCH / SORT / TOTAL
        =================================================== */}

        <section className="ledger-toolbar">

          {/* SEARCH */}

          <div className="ledger-search-section">

            <label>
              Search Ledgers
            </label>

            <div className="ledger-search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search by Ledger ID or Description"
              />

              {searchTerm && (

                <button
                  className="search-clear"
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  ×
                </button>

              )}

            </div>

          </div>


          {/* SORT */}

          <div className="ledger-sort-section">

            <label>
              Sort By
            </label>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value
                )
              }
            >

              <option value="asc">
                Ledger ID (Ascending)
              </option>

              <option value="desc">
                Ledger ID (Descending)
              </option>

            </select>

          </div>


          {/* TOTAL */}

          <div className="ledger-total-section">

            <div className="ledger-total-icon">
              ▱
            </div>

            <div>

              <span>
                Total Ledgers
              </span>

              <strong>
                {ledgers.length}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            LEDGER CONTENT
        =================================================== */}

        <section className="ledger-content">

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredLedgers.length === 0 ? (

            <div className="ledger-empty-state">

              <div className="empty-icon">
                ▱
              </div>

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


              {!searchTerm &&
                canManageLedgers && (

                  <button
                    className="ledger-create-button"
                    onClick={handleCreateLedger}
                  >

                    <span className="button-plus">
                      +
                    </span>

                    Create Ledger

                  </button>

                )}

            </div>

          ) : (

            <>

              {/* =================================================
                  LEDGER GRID
              ================================================= */}

              <div className="ledger-grid">

                {filteredLedgers.map(
                  (ledger) => (

                    <article
                      className="ledger-card"
                      key={ledger.id}
                    >

                      {/* BLUE TOP LINE */}

                      <div
                        className="ledger-card-top-line"
                      ></div>


                      {/* CARD HEADER */}

                      <div className="ledger-card-header">

                        <div>

                          <span
                            className="ledger-card-label"
                          >
                            LEDGER ID
                          </span>

                          <h2>
                            #{ledger.id}
                          </h2>

                        </div>

                        <div
                          className="ledger-card-icon"
                        >
                          L
                        </div>

                      </div>


                      {/* CARD BODY */}

                      <div className="ledger-card-body">

                        {/* DESCRIPTION */}

                        <div
                          className="ledger-info-block"
                        >

                          <span>
                            Description
                          </span>

                          <strong>
                            {ledger.description ||
                              "No description"}
                          </strong>

                        </div>


                        <div
                          className="ledger-divider"
                        ></div>


                        {/* DATE */}

                        <div
                          className="ledger-info-block"
                        >

                          <span>
                            Created Date
                          </span>

                          <strong
                            className="ledger-date"
                          >

                            <span
                              className="calendar-icon"
                            >
                              ▣
                            </span>

                            {formatDate(
                              ledger.createdAt
                            )}

                          </strong>

                        </div>

                      </div>


                      {/* ACTIONS */}

                      {canManageLedgers && (

                        <div
                          className="ledger-card-footer"
                        >

                          <span
                            className="actions-label"
                          >
                            Actions
                          </span>


                          <div
                            className="ledger-actions"
                          >

                            {/* EDIT */}

                            <button
                              className="ledger-edit-button"
                              type="button"
                              onClick={() =>
                                handleEdit(ledger)
                              }
                            >

                              <span>
                                ✎
                              </span>

                              Edit

                            </button>


                            {/* DELETE */}

                            <button
                              className="ledger-delete-button"
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  ledger.id
                                )
                              }
                              disabled={
                                deletingId ===
                                ledger.id
                              }
                            >

                              <span>
                                ♲
                              </span>

                              {deletingId ===
                              ledger.id
                                ? "Deleting..."
                                : "Delete"}

                            </button>

                          </div>

                        </div>

                      )}

                    </article>

                  )
                )}

              </div>


              {/* =================================================
                  RESULT COUNT
              ================================================= */}

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
              event.target ===
                event.currentTarget &&
              !savingEdit
            ) {

              closeEditModal();

            }

          }}
        >

          <div className="ledger-edit-modal">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="ledger-modal-header"
            >

              <div
                className="ledger-modal-title-area"
              >

                <div
                  className="ledger-modal-icon"
                >
                  ✎
                </div>

                <div>

                  <h2>
                    Edit Ledger
                  </h2>

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


            {/* =================================================
                LEDGER ID PREVIEW
            ================================================= */}

            <div
              className="ledger-id-preview"
            >

              <div>

                <span>
                  LEDGER ID
                </span>

                <strong>
                  #{editingLedger.id}
                </strong>

              </div>

              <div
                className="ledger-id-preview-icon"
              >
                L
              </div>

            </div>


            {/* =================================================
                EDIT FORM
            ================================================= */}

            <form
              onSubmit={handleSaveEdit}
              className="ledger-edit-form"
            >

              {/* DESCRIPTION */}

              <div className="form-field">

                <label>
                  Ledger Description
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value
                    )
                  }
                  placeholder="Enter ledger description"
                  autoFocus
                  required
                  disabled={savingEdit}
                />

              </div>


              {/* CREATED DATE */}

              <div className="form-field">

                <label>
                  Created Date
                </label>

                <div
                  className="date-input-wrapper"
                >

                  <input
                    type="date"
                    value={editCreatedAt}
                    onChange={(event) =>
                      setEditCreatedAt(
                        event.target.value
                      )
                    }
                    disabled={savingEdit}
                  />

                </div>

              </div>


              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div
                className="ledger-modal-footer"
              >

                {/* CANCEL */}

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Cancel
                </button>


                {/* SAVE */}

                <button
                  type="submit"
                  className="modal-save-button"
                  disabled={savingEdit}
                >

                  {savingEdit ? (

                    <>

                      <span
                        className="button-spinner"
                      ></span>

                      Saving...

                    </>

                  ) : (

                    <>

                      <span>
                        ▣
                      </span>

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
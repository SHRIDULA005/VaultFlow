import React, { useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import "./TransactionApproval.css";

const API_BASE_URL = "http://localhost:8080/api";

const TransactionApproval = ({ transactionId: propTransactionId }) => {
    const { transactionId: urlTransactionId } = useParams();
    const [searchParams] = useSearchParams();

    const queryTransactionId =
        searchParams.get("transactionId");

    const resolvedTransactionId =
        propTransactionId ||
        urlTransactionId ||
        queryTransactionId ||
        "";

    const transactionId =
        String(resolvedTransactionId).trim();

    const isValidTransactionId =
        transactionId !== "" &&
        /^\d+$/.test(transactionId);

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleApprove = async () => {
        if (loading) {
            return;
        }

        if (!isValidTransactionId) {
            setError(
                "A valid transaction ID is required to approve this transaction."
            );
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            const response = await axios.put(
                `${API_BASE_URL}/transactions/${transactionId}`,
                {
                    status: "APPROVED",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(
                "Transaction approved successfully:",
                response.data
            );

            setStatus("APPROVED");
            setError("");

        } catch (error) {

            console.error(
                "Transaction approval failed:",
                error
            );

            const httpStatus =
                error?.response?.status;

            if (httpStatus === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (httpStatus === 403) {
                setError(
                    "You are not authorized to approve this transaction."
                );
            } else if (httpStatus === 404) {
                setError(
                    "Transaction not found."
                );
            } else if (httpStatus === 400) {
                setError(
                    "Invalid transaction approval request."
                );
            } else {
                setError(
                    "Unable to approve this transaction. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    const isApproved =
        status === "APPROVED";

    return (
        <main className="approval-page">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <header className="approval-page-header">

                <div className="approval-heading">

                    <div className="approval-eyebrow">
                        VAULTFLOW
                    </div>

                    <h1>
                        Transaction Approvals
                    </h1>

                    <p>
                        Review and authorize pending
                        financial transactions.
                    </p>

                </div>

                <div
                    className={`approval-status ${
                        isApproved
                            ? "approval-status-approved"
                            : "approval-status-pending"
                    }`}
                >
                    <span className="approval-status-dot"></span>

                    {isApproved
                        ? "Approved"
                        : "Pending Review"}
                </div>

            </header>

            {/* =====================================================
                MAIN CARD
            ===================================================== */}

            <section className="approval-main-card">

                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="approval-card-top">

                    <div className="approval-card-title">

                        <div className="approval-shield">
                            ✓
                        </div>

                        <div>

                            <span>
                                FINANCIAL CONTROL
                            </span>

                            <h2>
                                Transaction Authorization
                            </h2>

                        </div>

                    </div>

                    <div className="approval-transaction-id">

                        <span>
                            TRANSACTION ID
                        </span>

                        <strong>
                            #{isValidTransactionId
                                ? transactionId
                                : "PENDING"}
                        </strong>

                    </div>

                </div>

                <div className="approval-divider"></div>

                {/* =================================================
                    AMOUNT
                ================================================= */}

                <div className="approval-amount-section">

                    <span className="approval-amount-label">
                        TRANSACTION AMOUNT
                    </span>

                    <div className="approval-amount">
                        ₹20,000
                    </div>

                    <div className="approval-amount-subtitle">
                        Financial transaction awaiting
                        authorization
                    </div>

                </div>

                {/* =================================================
                    TRANSFER FLOW
                ================================================= */}

                <div className="approval-transfer">

                    <div className="approval-account">

                        <div className="account-icon">
                            S
                        </div>

                        <div className="account-content">

                            <span>
                                SOURCE ACCOUNT
                            </span>

                            <strong>
                                Account 3
                            </strong>

                            <small>
                                Funds will be debited
                            </small>

                        </div>

                    </div>

                    <div className="transfer-arrow">

                        <div className="transfer-line"></div>

                        <div className="transfer-icon">
                            →
                        </div>

                    </div>

                    <div className="approval-account">

                        <div className="account-icon destination">
                            D
                        </div>

                        <div className="account-content">

                            <span>
                                DESTINATION ACCOUNT
                            </span>

                            <strong>
                                Account 4
                            </strong>

                            <small>
                                Funds will be credited
                            </small>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    DETAILS
                ================================================= */}

                <div className="approval-details-grid">

                    <div className="approval-detail">

                        <span>
                            REFERENCE ID
                        </span>

                        <strong>
                            TRX-2026-ARC-00444
                        </strong>

                    </div>

                    <div className="approval-detail">

                        <span>
                            REQUEST TYPE
                        </span>

                        <strong>
                            Fund Transfer
                        </strong>

                    </div>

                    <div className="approval-detail">

                        <span>
                            AUTHORIZATION
                        </span>

                        <strong>
                            Treasurer
                        </strong>

                    </div>

                    <div className="approval-detail">

                        <span>
                            CURRENT STATUS
                        </span>

                        <strong
                            className={
                                isApproved
                                    ? "detail-approved"
                                    : "detail-pending"
                            }
                        >
                            {isApproved
                                ? "APPROVED"
                                : "PENDING"}
                        </strong>

                    </div>

                </div>

                {/* =================================================
                    SECURITY PANEL
                ================================================= */}

                <div className="approval-security">

                    <div className="security-check">
                        ✓
                    </div>

                    <div className="security-content">

                        <strong>
                            Secure authorization required
                        </strong>

                        <p>
                            Verify the transaction details
                            before approving. This action will
                            update the transaction status and
                            authorize the financial operation.
                        </p>

                    </div>

                    <div className="security-badge">
                        JWT
                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && !isApproved && (

                    <div
                        className="approval-error"
                        role="alert"
                    >

                        <div className="approval-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Authorization failed
                            </strong>

                            <span>
                                {error}
                            </span>

                        </div>

                    </div>

                )}

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {isApproved && (

                    <div
                        className="approval-success"
                        role="status"
                    >

                        <div className="approval-success-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Transaction Approved Successfully
                            </strong>

                            <span>
                                The transaction has been
                                successfully authorized.
                            </span>

                        </div>

                        <div className="approved-badge">
                            APPROVED
                        </div>

                    </div>

                )}

                {/* =================================================
                    ACTION AREA
                ================================================= */}

                <div className="approval-action-area">

                    <div className="approval-action-info">

                        <span className="action-lock">
                            🔒
                        </span>

                        <div>

                            <strong>
                                Authorized action
                            </strong>

                            <span>
                                Only privileged users can
                                approve transactions.
                            </span>

                        </div>

                    </div>

                    {!isApproved && (

                        <button
                            type="button"
                            className="approval-button"
                            onClick={handleApprove}
                            disabled={
                                loading ||
                                !isValidTransactionId
                            }
                            aria-busy={loading}
                        >

                            {loading ? (

                                <>
                                    <span className="approval-spinner"></span>

                                    <span>
                                        Authorizing...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <span className="approve-button-icon">
                                        ✓
                                    </span>

                                    <span>
                                        Approve Transaction
                                    </span>

                                    <span className="approve-arrow">
                                        →
                                    </span>
                                </>

                            )}

                        </button>

                    )}

                    {isApproved && (

                        <div className="approved-action">

                            <span>
                                ✓
                            </span>

                            Transaction Authorized

                        </div>

                    )}

                </div>

            </section>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="approval-footer">

                <span>
                    VaultFlow Financial Management
                </span>

                <span>
                    Secure • Audited • Controlled
                </span>

            </footer>

        </main>
    );
};

export default TransactionApproval;
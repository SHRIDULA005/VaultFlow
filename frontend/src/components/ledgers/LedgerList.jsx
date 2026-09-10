import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LedgerList.css";

const LedgerList = () => {
    const [ledgers, setLedgers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        axios
            .get("/api/ledgers")
            .then((response) => {

                /*
                 * Backend returns Page<LedgerDTO>.
                 * Therefore the actual ledger array is
                 * inside response.data.content.
                 *
                 * This also supports a normal array response.
                 */
                const data = response.data;

                if (Array.isArray(data)) {
                    setLedgers(data);
                } else if (data && Array.isArray(data.content)) {
                    setLedgers(data.content);
                } else {
                    setLedgers([]);
                }
            })
            .catch((error) => {
                if (
                    error.response &&
                    error.response.status === 401
                ) {
                    localStorage.removeItem("token");

                    setErrorMessage(
                        "Session expired. Please log in again"
                    );
                } else {
                    setLedgers([]);
                }
            });
    }, []);

    return (
        <div className="ledger-list-page">

            <div className="ledger-list-header">
                <div>
                    <span className="ledger-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>Ledgers</h2>

                    <p>
                        View and manage financial ledgers.
                    </p>
                </div>

                <div className="ledger-count">
                    {ledgers.length} Ledger
                    {ledgers.length !== 1 ? "s" : ""}
                </div>
            </div>

            {errorMessage && (
                <div className="ledger-list-error">
                    {errorMessage}
                </div>
            )}

            {ledgers.length > 0 ? (
                <div className="ledger-cards">

                    {ledgers.map((ledger) => (
                        <div
                            className="ledger-card"
                            key={ledger.id}
                        >

                            <div className="ledger-card-top">

                                <div>
                                    <span className="ledger-card-label">
                                        Ledger ID
                                    </span>

                                    <h3>
                                        #{ledger.id}
                                    </h3>
                                </div>

                                <div className="ledger-icon">
                                    L
                                </div>

                            </div>

                            <div className="ledger-card-divider" />

                            <div className="ledger-description">
                                <span>Description</span>

                                <strong>
                                    {ledger.description || "-"}
                                </strong>
                            </div>

                            {ledger.createdAt && (
                                <div className="ledger-created">
                                    <span>Created</span>

                                    <strong>
                                        {String(
                                            ledger.createdAt
                                        ).split("T")[0]}
                                    </strong>
                                </div>
                            )}

                        </div>
                    ))}

                </div>
            ) : (
                !errorMessage && (
                    <div className="no-ledgers">
                        <div className="ledger-empty-icon">
                            L
                        </div>

                        <h3>No ledgers found</h3>

                        <p>
                            Create a ledger to start managing
                            financial records.
                        </p>
                    </div>
                )
            )}

        </div>
    );
};

export default LedgerList;
import React, { useEffect, useState } from "react";
import axios from "axios";

const LedgerList = () => {
    const [ledgers, setLedgers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        axios
            .get("/api/ledgers")
            .then((response) => {
                setLedgers(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");

                    setErrorMessage(
                        "Session expired. Please log in again"
                    );
                }
            });
    }, []);

    return (
        <div>
            <h2>Ledger List</h2>

            {errorMessage && (
                <p>{errorMessage}</p>
            )}

            {ledgers.length > 0 && (
                <div>
                    {ledgers.map((ledger) => (
                        <div key={ledger.id}>
                            <p>Ledger ID: {ledger.id}</p>
                            <p>
                                Description: {ledger.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LedgerList;
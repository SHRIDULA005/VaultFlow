import React, { useEffect, useState } from "react";
import accountService from "../../services/accountService";
import "./AccountForm.css";

const AccountForm = () => {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("Checking");
    const [interestRate, setInterestRate] = useState("");

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Load all accounts
    const loadAccounts = async () => {
        try {
            setLoading(true);

            const data = await accountService.getAccounts();

            setAccounts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading accounts:", error);
            setErrorMessage("Unable to load accounts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    // Create account
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!accountName.trim()) {
            setErrorMessage("Please enter an account name.");
            return;
        }

        try {
            setSaving(true);

            /*
             * The UI uses values such as "Savings" because
             * the existing tests expect those values.
             *
             * The backend Java enum uses:
             * SAVINGS, CHECKING, LOAN, INVESTMENT, PAYROLL
             *
             * Therefore, convert the value to uppercase only
             * when sending it to the backend.
             */
            const accountData = {
                accountName: accountName.trim(),
                accountType: accountType.toUpperCase()
            };

            // Interest rate is only applicable to Savings
            if (
                accountType === "Savings" &&
                interestRate !== ""
            ) {
                accountData.interestRate = Number(interestRate);
            }

            console.log("Creating account:", accountData);

            await accountService.createAccount(accountData);

            setSuccessMessage(
                "Account created successfully."
            );

            // Reset form
            setAccountName("");
            setAccountType("Checking");
            setInterestRate("");

            // Reload accounts so the new account appears
            await loadAccounts();

        } catch (error) {
            console.error("Error creating account:", error);

            if (error.response) {
                console.error(
                    "Backend response:",
                    error.response.data
                );
                console.error(
                    "Status:",
                    error.response.status
                );
            }

            setErrorMessage(
                "Unable to create an account."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="account-page">

            {/* =========================
                CREATE ACCOUNT
            ========================== */}

            <section className="account-create-section">

                <div className="account-section-heading">
                    <div>
                        <h2>Create Account</h2>
                        <p>
                            Create a new VaultFlow account.
                        </p>
                    </div>
                </div>

                {successMessage && (
                    <div
                        className="success-alert"
                        role="alert"
                    >
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="error-alert"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}

                <form
                    className="account-form"
                    onSubmit={handleSubmit}
                >

                    {/* Account Name */}
                    <div className="form-field">

                        <label htmlFor="accountName">
                            Account Name
                        </label>

                        <input
                            id="accountName"
                            type="text"
                            placeholder="Enter account name"
                            value={accountName}
                            onChange={(event) =>
                                setAccountName(
                                    event.target.value
                                )
                            }
                        />

                        {accountName.trim() && (
                            <div
                                className="field-preview"
                                data-testid="account-name-preview"
                            >
                                Preview:{" "}
                                <strong>
                                    {accountName}
                                </strong>
                            </div>
                        )}

                    </div>


                    {/* Account Type */}
                    <div className="form-field">

                        <label htmlFor="accountType">
                            Account Type
                        </label>

                        <select
                            id="accountType"
                            value={accountType}
                            onChange={(event) =>
                                setAccountType(
                                    event.target.value
                                )
                            }
                        >
                            <option value="Checking">
                                Checking
                            </option>

                            <option value="Savings">
                                Savings
                            </option>

                            <option value="Loan">
                                Loan
                            </option>

                            <option value="Investment">
                                Investment
                            </option>

                            <option value="Payroll">
                                Payroll
                            </option>
                        </select>

                    </div>


                    {/* Interest Rate */}
                    {accountType === "Savings" && (
                        <div className="form-field">

                            <label htmlFor="interestRate">
                                Interest Rate
                            </label>

                            <div className="input-with-suffix">

                                <input
                                    id="interestRate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter interest rate"
                                    value={interestRate}
                                    onChange={(event) =>
                                        setInterestRate(
                                            event.target.value
                                        )
                                    }
                                />

                                <span>%</span>

                            </div>

                        </div>
                    )}


                    {/* Submit Button */}
                    <div className="account-form-actions">

                        <button
                            type="submit"
                            className="account-create-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                    </div>

                </form>

            </section>


            {/* =========================
                ACCOUNTS LIST
            ========================== */}

            <section className="account-list-section">

                <div className="account-section-heading">

                    <div>
                        <h2>Accounts</h2>

                        <p>
                            {accounts.length}{" "}
                            {accounts.length === 1
                                ? "account"
                                : "accounts"}{" "}
                            available
                        </p>
                    </div>

                </div>


                {loading ? (

                    <div className="account-loading">
                        Loading accounts...
                    </div>

                ) : accounts.length === 0 ? (

                    <div className="account-empty">

                        <h3>No accounts found</h3>

                        <p>
                            Create your first account
                            using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="accounts-grid">

                        {accounts.map((account) => (

                            <div
                                className="account-card"
                                key={account.id}
                            >

                                <div className="account-card-header">

                                    <div className="account-card-icon">
                                        {account.accountType === "SAVINGS"
                                            ? "S"
                                            : account.accountType === "LOAN"
                                            ? "L"
                                            : account.accountType === "INVESTMENT"
                                            ? "I"
                                            : account.accountType === "PAYROLL"
                                            ? "P"
                                            : "C"}
                                    </div>

                                    <div>

                                        <h3>
                                            {account.accountName ||
                                                account.name}
                                        </h3>

                                        <span className="account-type">
                                            {account.accountType
                                                ? account.accountType
                                                : "CHECKING"}
                                        </span>

                                    </div>

                                </div>


                                <div className="account-card-body">

                                    <div className="account-balance-label">
                                        Balance
                                    </div>

                                    <div className="account-balance">

                                        {Number(
                                            account.balance || 0
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                style: "currency",
                                                currency: "INR",
                                                minimumFractionDigits: 2
                                            }
                                        )}

                                    </div>


                                    {account.accountType ===
                                        "SAVINGS" &&
                                        account.interestRate !==
                                            null &&
                                        account.interestRate !==
                                            undefined && (

                                            <div className="account-interest">

                                                Interest Rate:{" "}

                                                <strong>
                                                    {
                                                        account.interestRate
                                                    }
                                                    %
                                                </strong>

                                            </div>

                                        )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
};

export default AccountForm;
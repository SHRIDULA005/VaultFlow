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

            const accountData = {
                accountName: accountName.trim(),
                accountType: accountType.toUpperCase()
            };

            if (
                accountType === "Savings" &&
                interestRate !== ""
            ) {
                accountData.interestRate = Number(interestRate);
            }

            await accountService.createAccount(accountData);

            setSuccessMessage(
                "Account created successfully."
            );

            setAccountName("");
            setAccountType("Checking");
            setInterestRate("");

            await loadAccounts();

        } catch (error) {
            console.error("Error creating account:", error);

            setErrorMessage(
                "Unable to create an account."
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE ACCOUNT
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this account?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSuccessMessage("");
            setErrorMessage("");

            await accountService.deleteAccount(id);

            setSuccessMessage(
                "Account deleted successfully."
            );

            await loadAccounts();

        } catch (error) {
            console.error("Error deleting account:", error);

            setErrorMessage(
                "Unable to delete account. Please try again."
            );
        }
    };

    return (
        <div className="account-page">

            {/* CREATE ACCOUNT */}

            <section className="account-create-section">

                <div className="account-section-heading">
                    <div>
                        <span className="section-eyebrow">
                            VAULTFLOW
                        </span>

                        <h2>Create Account</h2>

                        <p>
                            Create a new VaultFlow account.
                        </p>
                    </div>
                </div>

                {successMessage && (
                    <div
                        className="account-alert account-success"
                        role="alert"
                    >
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="account-alert account-error"
                        role="alert"
                    >
                        <span>!</span>
                        {errorMessage}
                    </div>
                )}

                <form
                    className="account-form"
                    onSubmit={handleSubmit}
                >

                    {/* ACCOUNT NAME */}

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
                                <span>Preview:</span>

                                <strong>
                                    {accountName}
                                </strong>
                            </div>
                        )}

                    </div>

                    {/* ACCOUNT TYPE */}

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

                    {/* INTEREST RATE */}

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

                    {/* CREATE BUTTON */}

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

            {/* ACCOUNTS LIST */}

            <section className="accounts-list-section">

                <div className="account-section-heading">

                    <div>
                        <span className="section-eyebrow">
                            VAULTFLOW
                        </span>

                        <h2>Accounts</h2>

                        <p>
                            {accounts.length}{" "}
                            {accounts.length === 1
                                ? "account"
                                : "accounts"}{" "}
                            available
                        </p>
                    </div>

                    <div className="account-count">
                        {accounts.length}{" "}
                        <span>
                            {accounts.length === 1
                                ? "Account"
                                : "Accounts"}
                        </span>
                    </div>

                </div>

                {loading ? (

                    <div className="accounts-state">
                        <div className="loading-spinner"></div>
                        <p>Loading accounts...</p>
                    </div>

                ) : accounts.length === 0 ? (

                    <div className="accounts-empty">

                        <div className="empty-account-icon">
                            +
                        </div>

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

                                <div className="account-card-top">

                                    <div className="account-icon">
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

                                    <span className="account-status">
                                        ACTIVE
                                    </span>

                                </div>

                                <div className="account-card-body">

                                    <h3>
                                        {account.accountName ||
                                            account.name}
                                    </h3>

                                    <span className="account-type">
                                        {account.accountType
                                            ? account.accountType
                                            : "CHECKING"}
                                    </span>

                                    <div className="account-card-balance">

                                        <span>
                                            BALANCE
                                        </span>

                                        <strong>
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
                                        </strong>

                                    </div>

                                    {account.accountType === "SAVINGS" &&
                                        account.interestRate !== null &&
                                        account.interestRate !== undefined && (

                                            <div className="account-interest">

                                                <span>
                                                    Interest Rate
                                                </span>

                                                <strong>
                                                    {account.interestRate}%
                                                </strong>

                                            </div>

                                        )}

                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        className="account-delete-button"
                                        onClick={() =>
                                            handleDelete(account.id)
                                        }
                                    >
                                        Delete
                                    </button>

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
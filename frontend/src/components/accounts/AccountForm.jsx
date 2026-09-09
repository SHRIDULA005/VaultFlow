import React, { useState } from "react";

const AccountForm = () => {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("Checking");
    const [interestRate, setInterestRate] = useState("");

    const handleAccountNameChange = (e) => {
        setAccountName(e.target.value);
    };

    const handleAccountTypeChange = (e) => {
        setAccountType(e.target.value);
    };

    return (
        <div>
            <h2>Create Account</h2>

            <label htmlFor="accountName">
                Account Name
            </label>

            <input
                id="accountName"
                type="text"
                placeholder="Account Name"
                value={accountName}
                onChange={handleAccountNameChange}
            />

            <p>
                Account Name Preview:
                <span data-testid="account-name-preview">
                    {accountName}
                </span>
            </p>

            <label htmlFor="accountType">
                Account Type
            </label>

            <select
                id="accountType"
                value={accountType}
                onChange={handleAccountTypeChange}
            >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
            </select>

            {accountType === "Savings" && (
                <div>
                    <label htmlFor="interestRate">
                        Interest Rate
                    </label>

                    <input
                        id="interestRate"
                        type="number"
                        placeholder="Interest Rate"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default AccountForm;
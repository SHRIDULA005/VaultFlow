import React, { useState } from "react";

const AccountForm = () => {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("");

    return (
        <div>
            <h2>Create Account</h2>

            <label htmlFor="account-name">
                Account Name
            </label>

            <input
                id="account-name"
                type="text"
                placeholder="Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
            />

            <div data-testid="account-name-preview">
                {accountName}
            </div>

            <label htmlFor="account-type">
                Account Type
            </label>

            <select
                id="account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
            >
                <option value="">Select Account Type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
            </select>

            {accountType === "Savings" && (
                <div>
                    <label htmlFor="interest-rate">
                        Interest Rate
                    </label>

                    <input
                        id="interest-rate"
                        type="number"
                        placeholder="Interest Rate"
                    />
                </div>
            )}
        </div>
    );
};

export default AccountForm;
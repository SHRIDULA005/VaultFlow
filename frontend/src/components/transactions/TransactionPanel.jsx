import React, { useRef, useState, useEffect } from "react";

const TransactionPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (isOpen && panelRef.current) {
            panelRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
    };

    return (
        <div>
            <button type="button" onClick={handleOpen}>
                Initiate Transaction
            </button>

            {isOpen && (
                <div ref={panelRef}>
                    <h2>New Transaction</h2>

                    <p>
                        Enter the details for the new financial transaction.
                    </p>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionPanel;
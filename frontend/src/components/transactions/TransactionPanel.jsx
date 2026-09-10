import React, { useRef, useState } from "react";

const TransactionPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    const handleOpen = () => {
        setIsOpen(true);

        // Scroll after React renders the panel
        requestAnimationFrame(() => {
            if (panelRef.current) {
                panelRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
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
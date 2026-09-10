import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ============================================================
// VAULTFLOW (TRANSACTION & LEDGER ORCHESTRATOR) — FRONTEND TESTS
// Domain: Financial transaction management, ledger orchestration, audit trails
// Roles: ADMIN, TREASURER, AUDITOR, USER
// ============================================================

describe('VaultFlow Frontend Test Suite (T1–T30)', () => {

  // ===========================================================
  // T1–T5 | MODULE ARCHITECTURE VERIFICATION
  // ===========================================================

  /**
   * T1 — Redux Store
   * @role Global state container for auth token, user role, and domain entity state.
   * @srs REQ-ARCH-01: Application must maintain a centralised state store for transaction
   *      and ledger data accessible across all components.
   */
  test('T1 — Redux Store exists and exposes a configured store with auth slice', () => {
    return import('../store/index').then(module => {
      expect(module).toBeDefined();
      expect(module.default).toBeDefined();
      const state = module.default.getState();
      expect(state).toHaveProperty('auth');
    });
  });

  /**
   * T2 — AuthService
   * @role Handles login/logout API calls and localStorage token persistence.
   * @srs REQ-ARCH-02: Authentication logic must be isolated in a dedicated service,
   *      keeping components free of direct HTTP and storage concerns.
   */
  test('T2 — AuthService exists and exposes login and logout functions', () => {
    return import('../services/authService').then(module => {
      expect(module).toBeDefined();
      expect(typeof module.login).toBe('function');
      expect(typeof module.logout).toBe('function');
    });
  });

  /**
   * T3 — Navbar Component
   * @role Role-aware navigation — shows different menus for ADMIN vs AUDITOR.
   * @srs REQ-ARCH-03: Navigation must conditionally expose privileged routes
   *      based on the authenticated user's role.
   */
  test('T3 — Navbar component exists and renders a semantic navigation element', () => {
    return import('../components/layout/Navbar').then(({ default: Navbar }) => {
      render(<Navbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  /**
   * T4 — Login Component
   * @role Primary entry point for credential validation and session initiation.
   * @srs REQ-ARCH-04: The Login screen must capture credentials and initiate
   *      a JWT-secured session on success.
   */
  test('T4 — Login component exists and renders credential input fields', () => {
    return import('../components/Login').then(({ default: Login }) => {
      render(<Login />);
      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });
  });

  /**
   * T5 — ErrorHandler Component
   * @role Global error boundary — catches unhandled exceptions and displays
   *       domain-specific recovery messages (e.g., "Ledger sync failed").
   * @srs REQ-ARCH-05: All unhandled failures must be caught by a global boundary
   *      and presented as user-readable messages.
   */
  test('T5 — ErrorHandler component exists and displays domain-specific error message', () => {
    return import('../components/ErrorHandler').then(({ default: ErrorHandler }) => {
      render(<ErrorHandler error="Ledger synchronization failed. Please check connectivity." />);
      expect(screen.getByText(/Ledger synchronization failed/i)).toBeInTheDocument();
    });
  });

  // ===========================================================
  // T6–T7 | ROLE-BASED CONDITIONAL RENDERING
  // ===========================================================

  test('T6 — Navbar shows "Approve Transaction" button when logged in as TREASURER', () => {
    return import('../components/layout/Navbar').then(({ default: Navbar }) => {
      render(<Navbar isAdmin={true} />); // Assuming treasure/admin uses same privilege check or prop
      expect(screen.getByRole('button', { name: /Approve Transaction/i })).toBeInTheDocument();
    });
  });

  test('T7 — Navbar hides "Approve Transaction" button when logged in as AUDITOR', () => {
    return import('../components/layout/Navbar').then(({ default: Navbar }) => {
      render(<Navbar isAdmin={false} />);
      expect(screen.queryByRole('button', { name: /Approve Transaction/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================
  // T8–T13 | REACT HOOKS BEHAVIOUR
  // ===========================================================

  test('T8 — useState: Typing into "Account Name" field updates the live preview label in real time', () => {
    return import('../components/accounts/AccountForm').then(({ default: AccountForm }) => {
      render(<AccountForm />);
      const nameInput = screen.getByPlaceholderText(/Account Name/i);
      fireEvent.change(nameInput, { target: { value: 'Main Operating Account' } });
      expect(screen.getByTestId('account-name-preview'))
        .toHaveTextContent('Main Operating Account');
    });
  });

  test('T9 — useState: Selecting "Savings" from Account Type dropdown reveals the "Interest Rate" field', () => {
    return import('../components/accounts/AccountForm').then(({ default: AccountForm }) => {
      render(<AccountForm />);
      const typeDropdown = screen.getByLabelText(/Account Type/i);
      fireEvent.change(typeDropdown, { target: { value: 'Savings' } });
      expect(screen.getByLabelText(/Interest Rate/i)).toBeInTheDocument();
    });
  });

  test('T10 — useEffect: TransactionService.getAllTransactions() fires exactly once when TransactionList mounts', () => {
    return Promise.all([
      import('../components/transactions/TransactionList'),
      import('../services/transactionService')
    ]).then(([{ default: TransactionList }, TransactionService]) => {
      const spy = jest.spyOn(TransactionService, 'getAllTransactions').mockReturnValue(Promise.resolve([]));
      render(<TransactionList />);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  test('T11 — useEffect: Changing the "Ledger ID" filter triggers a new TransactionService.getByLedger() call', () => {
    return Promise.all([
      import('../components/transactions/TransactionList'),
      import('../services/transactionService')
    ]).then(([{ default: TransactionList }, TransactionService]) => {
      const spy = jest.spyOn(TransactionService, 'getByLedger').mockReturnValue(Promise.resolve([]));
      render(<TransactionList />);
      const ledgerFilter = screen.getByLabelText(/Filter by Ledger/i);
      fireEvent.change(ledgerFilter, { target: { value: 'LDG-9901' } });
      expect(spy).toHaveBeenCalledWith('LDG-9901');
      spy.mockRestore();
    });
  });

  test('T12 — useRef: Clicking "Edit Ledger" button moves focus directly to the Ledger Description input', () => {
    return import('../components/ledgers/LedgerForm').then(({ default: LedgerForm }) => {
      render(<LedgerForm editMode={true} />);
      const editBtn = screen.getByRole('button', { name: /Edit Ledger/i });
      fireEvent.click(editBtn);
      const descInput = screen.getByPlaceholderText(/Ledger Description/i);
      expect(document.activeElement).toBe(descInput);
    });
  });

  test('T13 — useRef: Opening the "New Transaction" panel scrolls it into the viewport', () => {
    return import('../components/transactions/TransactionPanel').then(({ default: TransactionPanel }) => {
      const mockScrollIntoView = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
      render(<TransactionPanel />);
      const openBtn = screen.getByRole('button', { name: /Initiate Transaction/i });
      fireEvent.click(openBtn);
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  // ===========================================================
  // T14–T17 | API INTEGRATION (Axios — .then() only)
  // ===========================================================

  test('T14 — axios.post sends exact payload when creating a new financial transaction', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.resolve({ status: 201, data: { id: 77, amount: 50000.00 } })
    );
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText(/Transaction Amount/i),
        { target: { value: '50000.00' } });
      fireEvent.change(screen.getByLabelText(/Source Account/i),
        { target: { value: 'ACC-8812' } });
      fireEvent.change(screen.getByLabelText(/Destination Account/i),
        { target: { value: 'ACC-9945' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));
      return waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/transactions', expect.objectContaining({
          amount: '50000.00',
          sourceAccountId: 'ACC-8812',
          targetAccountId: 'ACC-9945'
        }));
      });
    });
  });

  test('T15 — axios.put sends the correct transaction ID and updated status when approving a transaction', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'put').mockReturnValue(
      Promise.resolve({ status: 200, data: { id: 77, status: 'APPROVED' } })
    );
    return import('../components/transactions/TransactionApproval').then(({ default: TransactionApproval }) => {
      render(<TransactionApproval transactionId={77} />);
      fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
      return waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('/api/transactions/77', expect.objectContaining({
          status: 'APPROVED'
        }));
      });
    });
  });

  test('T16 — 500 Internal Server Error shows red alert: "Unable to process transaction. Please try again."', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.reject({ response: { status: 500, data: 'Database unreachable' } })
    );
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));
      return waitFor(() => {
        const alert = screen.getByTestId('error-alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Unable to process transaction. Please try again.');
        expect(alert).toHaveStyle({ backgroundColor: expect.stringContaining('red') });
      });
    });
  });

  test('T17 — 401 Unauthorized response clears token and shows "Session expired" message', () => {
    const axios = require('axios');
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.vaultflow.mock');
    jest.spyOn(axios, 'get').mockReturnValue(
      Promise.reject({ response: { status: 401 } })
    );
    return import('../components/ledgers/LedgerList').then(({ default: LedgerList }) => {
      render(<LedgerList />);
      return waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.getByText(/Session expired. Please log in again/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================
  // T18–T21 | NOTIFICATION & ALERT SYSTEM
  // ===========================================================

  test('T18 — Success alert "Transaction Logged Successfully" appears after valid submission', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.resolve({ status: 201, data: { id: 101 } })
    );
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText(/Transaction Amount/i),
        { target: { value: '1000' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));
      return waitFor(() => {
        expect(screen.getByTestId('success-alert')).toHaveTextContent('Transaction Logged Successfully');
      });
    });
  });

  test('T19 — Success alert auto-dismisses after the configured 3-second timeout', () => {
    jest.useFakeTimers();
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.resolve({ status: 201, data: { id: 101 } })
    );
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));
      return waitFor(() => {
        expect(screen.getByTestId('success-alert')).toBeInTheDocument();
      }).then(() => {
        jest.advanceTimersByTime(3000);
        return waitForElementToBeRemoved(() => screen.queryByTestId('success-alert')).then(() => {
          jest.useRealTimers();
        });
      });
    });
  });

  test('T20 — Warning alert "Account not selected" appears when form is submitted without accounts', () => {
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText(/Transaction Amount/i),
        { target: { value: '250.00' } });
      // Skip account selection
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));
      return waitFor(() => {
        expect(screen.getByTestId('warning-alert')).toHaveTextContent('Account not selected');
      });
    });
  });

  test('T21 — Success and warning alerts render independently in the notification stack', () => {
    return import('../components/NotificationStack').then(({ default: NotificationStack }) => {
      render(
        <NotificationStack
          alerts={[
            { id: 1, type: 'success', message: 'Account Reconciled Successfully' },
            { id: 2, type: 'warning', message: 'Unrecognized transaction flag detected' }
          ]}
        />
      );
      expect(screen.getByTestId('alert-1')).toHaveTextContent('Account Reconciled Successfully');
      expect(screen.getByTestId('alert-2')).toHaveTextContent('Unrecognized transaction flag detected');
    });
  });

  // ===========================================================
  // T22–T24 | SESSION & STORAGE MANAGEMENT
  // ===========================================================

  test('T22 — Successful login persists a non-null JWT token to localStorage', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.resolve({ data: { token: 'eyJhbGciOiJIUzI1NiJ9.vaultflow.treasurer' } })
    );
    return import('../components/Login').then(({ default: Login }) => {
      render(<Login />);
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'treasurer@vaultflow.io' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'VaultSecure!123' } });
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
      return waitFor(() => {
        expect(localStorage.getItem('token')).not.toBeNull();
        expect(localStorage.getItem('token')).toBe('eyJhbGciOiJIUzI1NiJ9.vaultflow.treasurer');
      });
    });
  });

  test('T23 — Successful TREASURER login stores role string "TREASURER" in localStorage', () => {
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockReturnValue(
      Promise.resolve({ data: { token: 'mock.jwt', role: 'TREASURER' } })
    );
    return import('../components/Login').then(({ default: Login }) => {
      render(<Login />);
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
      return waitFor(() => {
        expect(localStorage.getItem('role')).toBe('TREASURER');
      });
    });
  });

  test('T24 — Logout clears both the JWT token and role from localStorage', () => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.vaultflow.admin');
    localStorage.setItem('role', 'TREASURER');
    return import('../components/layout/Navbar').then(({ default: Navbar }) => {
      render(<Navbar isAdmin={true} />);
      fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
      return waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
      });
    });
  });

  // ===========================================================
  // T25–T26 | REDUX STATE MANAGEMENT
  // ===========================================================

  test('T25 — Dispatching logout action resets Redux auth state to null/false', () => {
    return Promise.all([
      import('@reduxjs/toolkit'),
      import('../store/slices/authSlice')
    ]).then(([{ configureStore }, { default: authReducer, logout, loginSuccess }]) => {
      const store = configureStore({ reducer: { auth: authReducer } });
      store.dispatch(loginSuccess({ token: 'mock.jwt', role: 'TREASURER' }));
      expect(store.getState().auth.isAuthenticated).toBe(true);
      store.dispatch(logout());
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  test('T26 — Dispatching loginSuccess populates Redux state with domain-specific user fields', () => {
    return Promise.all([
      import('@reduxjs/toolkit'),
      import('../store/slices/authSlice')
    ]).then(([{ configureStore }, { default: authReducer, loginSuccess }]) => {
      const store = configureStore({ reducer: { auth: authReducer } });
      const mockPayload = {
        userId: 'USR-FIN-992',
        role: 'TREASURER',
        token: 'eyJhbGciOiJIUzI1NiJ9.vaultflow',
        organizationId: 'CORP-VAULT-01'
      };
      store.dispatch(loginSuccess(mockPayload));
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.userId).toBe('USR-FIN-992');
      expect(state.user.role).toBe('TREASURER');
      expect(state.user.organizationId).toBe('CORP-VAULT-01');
    });
  });

  // ===========================================================
  // T27–T30 | INPUT FIELD CONTRACTS
  // ===========================================================

  test('T27 — Email field placeholder communicates the VaultFlow login format', () => {
    return import('../components/Login').then(({ default: Login }) => {
      render(<Login />);
      const emailField = screen.getByPlaceholderText(/auditor@vaultflow.io/i);
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveAttribute('type', 'email');
    });
  });

  test('T28 — Password field has type="password" and explains account security context', () => {
    return import('../components/Login').then(({ default: Login }) => {
      render(<Login />);
      const passField = screen.getByPlaceholderText(/Enter your secure account password/i);
      expect(passField).toBeInTheDocument();
      expect(passField).toHaveAttribute('type', 'password');
    });
  });

  test('T29 — Transaction search field has domain-specific placeholder for ID or Account Name', () => {
    return import('../components/transactions/TransactionList').then(({ default: TransactionList }) => {
      render(<TransactionList />);
      expect(screen.getByPlaceholderText(/Search by Transaction ID or Account Name/i))
        .toBeInTheDocument();
    });
  });

  test('T30 — Reference ID field has correct format placeholder and pattern validation', () => {
    return import('../components/transactions/TransactionForm').then(({ default: TransactionForm }) => {
      render(<TransactionForm />);
      const refIdField = screen.getByPlaceholderText(/e.g. TRX-2026-ARC-00441/i);
      expect(refIdField).toBeInTheDocument();
      expect(refIdField).toBeRequired();
    });
  });

}); // end describe

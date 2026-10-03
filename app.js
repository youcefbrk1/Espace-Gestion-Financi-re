/**
 * MAT EMBALLAGES - Application Logic
 * Pure JavaScript (ES6) - Zero External Frameworks
 * Features:
 *  - Authentication & Session Persistence
 *  - Customer Files Dashboard with Real-time Search
 *  - Dynamic Financial Ledger with Auto-calculations
 *  - Dynamic Custom Column Creation & Deletion
 *  - CSV Export & Print/PDF Styling
 *  - LocalStorage Data Persistence
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_KEYS = {
    AUTH_USER: "mat_emballages_auth_user",
    CUSTOMERS: "mat_emballages_customers_v2"
  };

  // Hardcoded Credentials
  const AUTH_CREDENTIALS = {
    username: "rafikgarti",
    password: "091082"
  };

  // Default Column Definitions for any new customer ledger
  const DEFAULT_COLUMNS = [
    { id: "date", label: "Date", type: "date", removable: false, width: "130px" },
    { id: "receiptNo", label: "N° Reçu / Bon", type: "text", removable: false, width: "140px" },
    { id: "product", label: "Produit (Dimensions / Type)", type: "text", removable: false, width: "260px" },
    { id: "quantity", label: "Quantité", type: "number", removable: false, width: "110px" },
    { id: "unitPrice", label: "Prix Unitaire (HT)", type: "number", removable: false, width: "140px" },
    { id: "totalPrice", label: "Prix Total (HT)", type: "calculated", removable: false, width: "150px" }
  ];

  // Realistic starter seed data for MAT EMBALLAGES (Algeria - DA)
  const SEED_CUSTOMERS = [
    {
      id: "cust_seed_1",
      name: "SARL ALGÉRIE EMBALLAGES INDUSTRIELS",
      phone: "+213 23 45 67 89",
      createdAt: "2026-09-15T09:00:00.000Z",
      columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
      rows: [
        {
          id: "row_101",
          date: "2026-09-20",
          receiptNo: "BL-2026/089",
          product: "Caisse Carton Double Cannelure 600x400x350 mm",
          quantity: 1200,
          unitPrice: 145.00
        },
        {
          id: "row_102",
          date: "2026-09-25",
          receiptNo: "BL-2026/102",
          product: "Boîte Télescopique Simple Cannelure 300x200x150 mm",
          quantity: 800,
          unitPrice: 85.00
        },
        {
          id: "row_103",
          date: "2026-10-01",
          receiptNo: "FA-2026/044",
          product: "Plateau Carton Maraîcher Renforcé 500x300x120 mm",
          quantity: 2500,
          unitPrice: 92.00
        }
      ]
    },
    {
      id: "cust_seed_2",
      name: "COMPTOIR DU CARTON MODERNE - ALGER",
      phone: "+213 21 89 12 34",
      createdAt: "2026-09-18T11:30:00.000Z",
      columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
      rows: [
        {
          id: "row_201",
          date: "2026-09-22",
          receiptNo: "BL-2026/094",
          product: "Caisse Carton Export Qualité Lourde 800x600x500 mm",
          quantity: 450,
          unitPrice: 320.00
        },
        {
          id: "row_202",
          date: "2026-09-29",
          receiptNo: "BL-2026/115",
          product: "Intercalaires Carton Ondulé 1200x800 mm",
          quantity: 1500,
          unitPrice: 35.00
        }
      ]
    },
    {
      id: "cust_seed_3",
      name: "INDUSTRIES CARTONNAGE D'ORAN",
      phone: "+213 41 55 66 77",
      createdAt: "2026-09-24T14:15:00.000Z",
      columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
      rows: [
        {
          id: "row_301",
          date: "2026-10-02",
          receiptNo: "BL-2026/128",
          product: "Carton Pliant avec Poignées Découpées 400x300x250 mm",
          quantity: 3000,
          unitPrice: 115.00
        }
      ]
    }
  ];

  // Application State
  const state = {
    currentUser: null,
    customers: [],
    activeScreen: "login", // 'login' | 'dashboard' | 'ledger'
    activeCustomerId: null,
    searchTerm: "",
    pendingDeleteAction: null
  };

  // DOM Elements Cache
  const elements = {
    // Screens
    screenLogin: document.getElementById("screen-login"),
    screenDashboard: document.getElementById("screen-dashboard"),
    screenLedger: document.getElementById("screen-ledger"),
    mainHeader: document.getElementById("main-header"),
    headerBrandLogo: document.getElementById("header-brand-logo"),

    // Auth
    loginForm: document.getElementById("login-form"),
    loginUsername: document.getElementById("login-username"),
    loginPassword: document.getElementById("login-password"),
    btnTogglePassword: document.getElementById("btn-toggle-password"),
    eyeIconShow: document.getElementById("eye-icon-show"),
    eyeIconHide: document.getElementById("eye-icon-hide"),
    loginError: document.getElementById("login-error"),
    userDisplayName: document.getElementById("user-display-name"),
    userAvatarInitials: document.getElementById("user-avatar-initials"),
    btnLogout: document.getElementById("btn-logout"),

    // Dashboard
    customerSearchInput: document.getElementById("customer-search-input"),
    btnClearSearch: document.getElementById("btn-clear-search"),
    customerCountIndicator: document.getElementById("customer-count-indicator"),
    foldersGrid: document.getElementById("folders-grid"),
    btnOpenNewCustomerModal: document.getElementById("btn-open-new-customer-modal"),

    // Ledger
    btnBackToDashboard: document.getElementById("btn-back-to-dashboard"),
    ledgerCustomerTitle: document.getElementById("ledger-customer-title"),
    ledgerCustomerMeta: document.getElementById("ledger-customer-meta"),
    btnAddRow: document.getElementById("btn-add-row"),
    btnTableBottomAdd: document.getElementById("btn-table-bottom-add"),
    btnOpenColumnModal: document.getElementById("btn-open-column-modal"),
    ledgerTableHeaderRow: document.getElementById("ledger-table-header-row"),
    ledgerTableBody: document.getElementById("ledger-table-body"),
    summaryRowCount: document.getElementById("summary-row-count"),
    summaryTotalQty: document.getElementById("summary-total-qty"),
    summaryGrandTotal: document.getElementById("summary-grand-total"),

    // Export
    exportDropdownContainer: document.getElementById("export-dropdown-container"),
    btnExportToggle: document.getElementById("btn-export-toggle"),
    btnExportCsv: document.getElementById("btn-export-csv"),
    btnExportPdf: document.getElementById("btn-export-pdf"),
    printCustomerName: document.getElementById("print-customer-name"),
    printDate: document.getElementById("print-date"),

    // Modals
    modalAddCustomer: document.getElementById("modal-add-customer"),
    formAddCustomer: document.getElementById("form-add-customer"),
    newCustomerName: document.getElementById("new-customer-name"),
    newCustomerPhone: document.getElementById("new-customer-phone"),

    modalAddColumn: document.getElementById("modal-add-column"),
    formAddColumn: document.getElementById("form-add-column"),
    newColumnName: document.getElementById("new-column-name"),
    newColumnType: document.getElementById("new-column-type"),

    modalConfirmDelete: document.getElementById("modal-confirm-delete"),
    deleteModalTitle: document.getElementById("delete-modal-title"),
    deleteModalMessage: document.getElementById("delete-modal-message"),
    btnConfirmDeleteAction: document.getElementById("btn-confirm-delete-action"),

    // Toasts
    toastContainer: document.getElementById("toast-container")
  };

  /* =========================================================
     Storage Operations
  ========================================================= */
  function loadData() {
    // 1. Check logged-in session (using sessionStorage so closing browser/tab auto signs out)
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER); // purge any legacy persistent storage logins
    } catch (e) {}

    const savedUser = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      state.currentUser = savedUser;
    }

    // 2. Load Customers
    const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (savedCustomers) {
      try {
        state.customers = JSON.parse(savedCustomers);
      } catch (e) {
        console.error("Error parsing stored customers, resetting to seed:", e);
        state.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
        saveCustomers();
      }
    } else {
      // First run: initialize with realistic seed data
      state.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
      saveCustomers();
    }
  }

  function saveCustomers() {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(state.customers));
    } catch (e) {
      console.error("Error saving data to localStorage:", e);
      showToast("Erreur de sauvegarde locale", "error");
    }
  }

  /* =========================================================
     Toast Notifications
  ========================================================= */
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "toast";
    
    // Icon
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* =========================================================
     Screen Navigation
  ========================================================= */
  function navigateTo(screenName, customerId = null) {
    state.activeScreen = screenName;

    // Hide all
    elements.screenLogin.classList.add("hidden");
    elements.screenDashboard.classList.add("hidden");
    elements.screenLedger.classList.add("hidden");
    elements.mainHeader.classList.add("hidden");

    if (screenName === "login") {
      elements.screenLogin.classList.remove("hidden");
      elements.loginUsername.value = "";
      elements.loginPassword.value = "";
      elements.loginError.classList.add("hidden");
      document.title = "Connexion - MAT EMBALLAGES";
    } else if (screenName === "dashboard") {
      elements.mainHeader.classList.remove("hidden");
      elements.screenDashboard.classList.remove("hidden");
      state.activeCustomerId = null;
      renderDashboard();
      document.title = "Dossiers Clients - MAT EMBALLAGES";
    } else if (screenName === "ledger") {
      elements.mainHeader.classList.remove("hidden");
      elements.screenLedger.classList.remove("hidden");
      state.activeCustomerId = customerId;
      renderLedger();
      const customer = getCustomerById(customerId);
      if (customer) {
        document.title = `${customer.name} - Ledger MAT EMBALLAGES`;
      }
    }
  }

  /* =========================================================
     Authentication Handling
  ========================================================= */
  function handleLogin(e) {
    e.preventDefault();
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value.trim();

    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
      state.currentUser = username;
      sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, username);
      updateUserDisplay();
      navigateTo("dashboard");
      showToast(`Bienvenue, ${username} !`);
    } else {
      elements.loginError.classList.remove("hidden");
      // Trigger shake animation
      elements.loginError.style.animation = "none";
      elements.loginError.offsetHeight; // trigger reflow
      elements.loginError.style.animation = null;
    }
  }

  function handleLogout() {
    state.currentUser = null;
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (e) {}
    navigateTo("login");
    showToast("Déconnexion réussie");
  }

  function updateUserDisplay() {
    if (state.currentUser) {
      elements.userDisplayName.textContent = state.currentUser;
      const initials = state.currentUser.substring(0, 2).toUpperCase();
      elements.userAvatarInitials.textContent = initials;
    }
  }

  /* =========================================================
     Customer Files Dashboard (Screen 2)
  ========================================================= */
  function getCustomerById(id) {
    return state.customers.find((c) => c.id === id);
  }

  function calculateCustomerTotal(customer) {
    if (!customer || !customer.rows) return 0;
    return customer.rows.reduce((sum, row) => {
      const q = parseFloat(row.quantity) || 0;
      const u = parseFloat(row.unitPrice) || 0;
      return sum + q * u;
    }, 0);
  }

  function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function renderDashboard() {
    // 1. Filter customers by search term
    const search = state.searchTerm.toLowerCase().trim();
    const filtered = state.customers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(search);
      const phoneMatch = c.phone && c.phone.toLowerCase().includes(search);
      return nameMatch || phoneMatch;
    });

    elements.customerCountIndicator.textContent = `${filtered.length} dossier(s) affiché(s)`;
    elements.foldersGrid.innerHTML = "";

    if (filtered.length === 0) {
      elements.foldersGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </div>
          <h3>Aucun dossier client trouvé</h3>
          <p>${
            search
              ? `Aucun résultat pour la recherche "${escapeHtml(search)}".`
              : "Créez votre premier dossier client pour commencer à gérer vos finances."
          }</p>
          <button class="btn btn-primary btn-sm" id="btn-empty-state-add">
            + Créer un Dossier Client
          </button>
        </div>
      `;

      const emptyAddBtn = document.getElementById("btn-empty-state-add");
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener("click", () => openModal(elements.modalAddCustomer));
      }
      return;
    }

    // Render folder cards
    filtered.forEach((customer) => {
      const card = document.createElement("div");
      card.className = "customer-folder-card";
      card.setAttribute("data-id", customer.id);

      const rowCount = (customer.rows || []).length;
      const totalAmount = calculateCustomerTotal(customer);
      const updatedDate = customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })
        : "-";

      card.innerHTML = `
        <div>
          <div class="folder-card-top">
            <div class="folder-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="folder-actions">
              <button class="folder-action-btn delete" data-action="delete" title="Supprimer le dossier">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="folder-card-content">
            <h3 class="folder-customer-name">${escapeHtml(customer.name)}</h3>
            <div class="folder-meta">
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                ${rowCount} bon(s) / ligne(s)
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${updatedDate}
              </span>
            </div>
          </div>
        </div>

        <div class="folder-card-footer">
          <span class="folder-total-label">Total (HT)</span>
          <span class="folder-total-value">${formatMoney(totalAmount)} DA</span>
        </div>
      `;

      // Event listener for opening ledger
      card.addEventListener("click", (e) => {
        // Prevent opening if delete button was clicked
        if (e.target.closest('[data-action="delete"]')) {
          e.stopPropagation();
          confirmDeleteCustomer(customer);
          return;
        }
        navigateTo("ledger", customer.id);
      });

      elements.foldersGrid.appendChild(card);
    });
  }

  function handleCreateCustomer(e) {
    e.preventDefault();
    const name = elements.newCustomerName.value.trim();
    const phone = elements.newCustomerPhone.value.trim();

    if (!name) return;

    const newCustomer = {
      id: "cust_" + Date.now(),
      name: name,
      phone: phone,
      createdAt: new Date().toISOString(),
      columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
      rows: [
        {
          id: "row_" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          receiptNo: "",
          product: "",
          quantity: "",
          unitPrice: ""
        }
      ]
    };

    state.customers.unshift(newCustomer);
    saveCustomers();
    closeModal(elements.modalAddCustomer);
    elements.formAddCustomer.reset();

    showToast(`Dossier client "${name}" créé avec succès !`);
    navigateTo("ledger", newCustomer.id);
  }

  function confirmDeleteCustomer(customer) {
    elements.deleteModalTitle.textContent = "Supprimer le dossier client";
    elements.deleteModalMessage.innerHTML = `Êtes-vous sûr de vouloir supprimer définitivement le dossier <strong>${escapeHtml(
      customer.name
    )}</strong> ainsi que toutes ses transactions ?`;

    state.pendingDeleteAction = () => {
      state.customers = state.customers.filter((c) => c.id !== customer.id);
      saveCustomers();
      closeModal(elements.modalConfirmDelete);
      renderDashboard();
      showToast(`Dossier "${customer.name}" supprimé.`);
    };

    openModal(elements.modalConfirmDelete);
  }

  /* =========================================================
     Customer Financial Ledger (Screen 3)
  ========================================================= */
  function renderLedger() {
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer) {
      navigateTo("dashboard");
      return;
    }

    // Set Customer Info Heading
    elements.ledgerCustomerTitle.textContent = customer.name;
    const rowCount = (customer.rows || []).length;
    elements.ledgerCustomerMeta.textContent = `${rowCount} ligne(s) enregistrée(s)${
      customer.phone ? ` • Contact: ${customer.phone}` : ""
    }`;

    // Update Print Info
    elements.printCustomerName.textContent = `Client : ${customer.name}`;
    elements.printDate.textContent = `Date : ${new Date().toLocaleDateString("fr-FR")}`;

    // Render Table Header
    renderTableHeader(customer);

    // Render Table Rows
    renderTableBody(customer);

    // Update Summary Footer
    updateLedgerSummary(customer);
  }

  function renderTableHeader(customer) {
    elements.ledgerTableHeaderRow.innerHTML = "";

    // 1. Render all dynamic columns
    customer.columns.forEach((col) => {
      const th = document.createElement("th");
      if (col.width) {
        th.style.minWidth = col.width;
      }

      const content = document.createElement("div");
      content.className = "th-content";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = col.label;
      content.appendChild(titleSpan);

      // If it's a custom removable column, add delete column button
      if (col.removable) {
        const deleteColBtn = document.createElement("button");
        deleteColBtn.className = "th-delete-col";
        deleteColBtn.title = "Supprimer cette colonne";
        deleteColBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        deleteColBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          confirmDeleteColumn(col);
        });
        content.appendChild(deleteColBtn);
      }

      th.appendChild(content);
      elements.ledgerTableHeaderRow.appendChild(th);
    });

    // 2. Trailing header cell for "+" Add Column quick trigger & Row Action header
    const thAction = document.createElement("th");
    thAction.style.width = "100px";
    thAction.style.textAlign = "center";
    thAction.innerHTML = `
      <button id="btn-th-add-col" class="th-add-col-btn" title="Ajouter une colonne personnalisée">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Colonne
      </button>
    `;
    elements.ledgerTableHeaderRow.appendChild(thAction);

    const btnThAdd = thAction.querySelector("#btn-th-add-col");
    if (btnThAdd) {
      btnThAdd.addEventListener("click", () => openModal(elements.modalAddColumn));
    }
  }

  function renderTableBody(customer) {
    elements.ledgerTableBody.innerHTML = "";

    if (!customer.rows || customer.rows.length === 0) {
      const emptyTr = document.createElement("tr");
      emptyTr.innerHTML = `
        <td colspan="${customer.columns.length + 1}" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          Aucune ligne enregistrée dans ce dossier.<br>
          <button class="btn btn-outline btn-sm" id="btn-inline-add-row" style="margin-top: 12px;">
            + Ajouter la première ligne
          </button>
        </td>
      `;
      elements.ledgerTableBody.appendChild(emptyTr);

      const btnInlineAdd = emptyTr.querySelector("#btn-inline-add-row");
      if (btnInlineAdd) {
        btnInlineAdd.addEventListener("click", addRowToActiveCustomer);
      }
      return;
    }

    customer.rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-row-id", row.id);

      // Render each column cell
      customer.columns.forEach((col) => {
        const td = document.createElement("td");

        if (col.id === "totalPrice") {
          // Calculated Column: Quantity x Unit Price
          td.className = "total-cell-value";
          const qty = parseFloat(row.quantity) || 0;
          const unit = parseFloat(row.unitPrice) || 0;
          const total = qty * unit;
          td.id = `total-cell-${row.id}`;
          td.textContent = `${formatMoney(total)} DA`;
        } else {
          // Input Column
          const input = document.createElement("input");
          input.className = "table-input";
          input.setAttribute("data-row-id", row.id);
          input.setAttribute("data-col-id", col.id);

          // Type assignment
          if (col.type === "date") {
            input.type = "date";
            input.value = row[col.id] || "";
          } else if (col.type === "number") {
            input.type = "number";
            input.step = "any";
            input.className += " text-right";
            input.value = row[col.id] !== undefined ? row[col.id] : "";
            if (col.id === "quantity") {
              input.placeholder = "0";
            } else if (col.id === "unitPrice") {
              input.placeholder = "0.000";
            }
          } else {
            input.type = "text";
            input.value = row[col.id] || "";
            if (col.id === "product") {
              input.placeholder = "Caisse 600x400x300 Double Cannelure...";
            } else if (col.id === "receiptNo") {
              input.placeholder = "BL-0001";
            }
          }

          // Real-time input change handling
          input.addEventListener("input", (e) => {
            handleTableCellChange(row.id, col.id, e.target.value);
          });

          td.appendChild(input);
        }

        tr.appendChild(td);
      });

      // Trailing Action Cell (Delete Row Button)
      const tdAction = document.createElement("td");
      tdAction.style.textAlign = "center";
      tdAction.innerHTML = `
        <button class="row-delete-btn" title="Supprimer la ligne" data-action="delete-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      tdAction.querySelector('[data-action="delete-row"]').addEventListener("click", () => {
        deleteRow(row.id);
      });

      tr.appendChild(tdAction);
      elements.ledgerTableBody.appendChild(tr);
    });
  }

  function handleTableCellChange(rowId, colId, value) {
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer) return;

    const row = customer.rows.find((r) => r.id === rowId);
    if (!row) return;

    // Save field
    if (colId === "quantity" || colId === "unitPrice") {
      row[colId] = value === "" ? "" : parseFloat(value);
      // Auto-recalculate Total Price cell for this row immediately
      const totalCell = document.getElementById(`total-cell-${rowId}`);
      if (totalCell) {
        const q = parseFloat(row.quantity) || 0;
        const u = parseFloat(row.unitPrice) || 0;
        const rowTotal = q * u;
        totalCell.textContent = `${formatMoney(rowTotal)} DA`;
      }
      // Update summary footer in real time
      updateLedgerSummary(customer);
    } else {
      row[colId] = value;
    }

    // Persist changes
    saveCustomers();
  }

  function updateLedgerSummary(customer) {
    let rowCount = 0;
    let totalQty = 0;
    let grandTotal = 0;

    if (customer && customer.rows) {
      rowCount = customer.rows.length;
      customer.rows.forEach((row) => {
        const q = parseFloat(row.quantity) || 0;
        const u = parseFloat(row.unitPrice) || 0;
        totalQty += q;
        grandTotal += q * u;
      });
    }

    elements.summaryRowCount.textContent = rowCount;
    elements.summaryTotalQty.textContent = totalQty.toLocaleString("fr-FR");
    elements.summaryGrandTotal.textContent = formatMoney(grandTotal);
  }

  function addRowToActiveCustomer() {
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer) return;

    const newRow = {
      id: "row_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      receiptNo: "",
      product: "",
      quantity: "",
      unitPrice: ""
    };

    // Initialize custom columns if any exist
    customer.columns.forEach((col) => {
      if (newRow[col.id] === undefined && col.id !== "totalPrice") {
        newRow[col.id] = "";
      }
    });

    customer.rows.push(newRow);
    saveCustomers();
    renderLedger();

    // Auto-focus the new row's product input for fast data entry
    setTimeout(() => {
      const inputs = elements.ledgerTableBody.querySelectorAll(
        `input[data-row-id="${newRow.id}"][data-col-id="receiptNo"], input[data-row-id="${newRow.id}"][data-col-id="product"]`
      );
      if (inputs.length > 0) {
        inputs[0].focus();
      }
    }, 50);

    showToast("Nouvelle ligne ajoutée");
  }

  function deleteRow(rowId) {
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer) return;

    customer.rows = customer.rows.filter((r) => r.id !== rowId);
    saveCustomers();
    renderLedger();
    showToast("Ligne supprimée");
  }

  function handleCreateColumn(e) {
    e.preventDefault();
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer) return;

    const label = elements.newColumnName.value.trim();
    const type = elements.newColumnType.value;

    if (!label) return;

    const colId = "custom_" + Date.now();
    const newCol = {
      id: colId,
      label: label,
      type: type,
      removable: true,
      width: type === "number" ? "120px" : type === "date" ? "130px" : "180px"
    };

    // Insert custom column before the "totalPrice" column so totalPrice stays at the right
    const totalPriceIndex = customer.columns.findIndex((c) => c.id === "totalPrice");
    if (totalPriceIndex !== -1) {
      customer.columns.splice(totalPriceIndex, 0, newCol);
    } else {
      customer.columns.push(newCol);
    }

    // Initialize this column in all rows
    customer.rows.forEach((row) => {
      row[colId] = "";
    });

    saveCustomers();
    closeModal(elements.modalAddColumn);
    elements.formAddColumn.reset();
    renderLedger();

    showToast(`Colonne "${label}" ajoutée`);
  }

  function confirmDeleteColumn(column) {
    elements.deleteModalTitle.textContent = "Supprimer la colonne";
    elements.deleteModalMessage.innerHTML = `Êtes-vous sûr de vouloir supprimer la colonne <strong>${escapeHtml(
      column.label
    )}</strong> ? Les données associées dans cette colonne seront effacées.`;

    state.pendingDeleteAction = () => {
      const customer = getCustomerById(state.activeCustomerId);
      if (customer) {
        customer.columns = customer.columns.filter((c) => c.id !== column.id);
        customer.rows.forEach((row) => {
          delete row[column.id];
        });
        saveCustomers();
        renderLedger();
        showToast(`Colonne "${column.label}" supprimée`);
      }
      closeModal(elements.modalConfirmDelete);
    };

    openModal(elements.modalConfirmDelete);
  }

  /* =========================================================
     Exports: CSV & PDF / Print
  ========================================================= */
  function exportCustomerToCsv() {
    const customer = getCustomerById(state.activeCustomerId);
    if (!customer || !customer.rows) {
      showToast("Aucune donnée à exporter", "error");
      return;
    }

    // Columns to export
    const headers = customer.columns.map((c) => `"${c.label.replace(/"/g, '""')}"`);
    const csvRows = [headers.join(";")];

    customer.rows.forEach((row) => {
      const rowValues = customer.columns.map((col) => {
        if (col.id === "totalPrice") {
          const q = parseFloat(row.quantity) || 0;
          const u = parseFloat(row.unitPrice) || 0;
          return `"${(q * u).toFixed(3)}"`;
        }
        const val = row[col.id] !== undefined && row[col.id] !== null ? String(row[col.id]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(rowValues.join(";"));
    });

    // Add summary row at bottom
    const grandTotal = calculateCustomerTotal(customer);
    const summaryLine = customer.columns.map((col) => {
      if (col.id === "totalPrice") return `"${grandTotal.toFixed(2)} DA"`;
      if (col.id === "product") return `"TOTAL GENERAL (HT)"`;
      return `""`;
    });
    csvRows.push(summaryLine.join(";"));

    // Add UTF-8 BOM so Excel opens accents cleanly
    const csvContent = "\uFEFF" + csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedName = customer.name.replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, "_");
    const today = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `MAT_EMBALLAGES_${sanitizedName}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    elements.exportDropdownContainer.classList.remove("open");
    showToast("Exportation CSV réussie !");
  }

  function exportCustomerToPdf() {
    elements.exportDropdownContainer.classList.remove("open");
    // Trigger clean window print preview formatted with print styles
    window.print();
  }

  /* =========================================================
     Modals Management
  ========================================================= */
  function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add("active");
    const firstInput = modalElement.querySelector("input:not([type=hidden])");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove("active");
  }

  /* =========================================================
     Helper Utilities
  ========================================================= */
  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     Event Listeners Setup
  ========================================================= */
  function setupEventListeners() {
    // 1. Auth & Login
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.btnLogout.addEventListener("click", handleLogout);
    
    if (elements.btnTogglePassword) {
      elements.btnTogglePassword.addEventListener("click", () => {
        const isPassword = elements.loginPassword.type === "password";
        elements.loginPassword.type = isPassword ? "text" : "password";
        if (isPassword) {
          elements.eyeIconShow.classList.add("hidden");
          elements.eyeIconHide.classList.remove("hidden");
        } else {
          elements.eyeIconShow.classList.remove("hidden");
          elements.eyeIconHide.classList.add("hidden");
        }
      });
    }

    elements.headerBrandLogo.addEventListener("click", () => {
      if (state.currentUser) {
        navigateTo("dashboard");
      }
    });

    // 2. Dashboard Navigation & Search
    elements.btnOpenNewCustomerModal.addEventListener("click", () => {
      openModal(elements.modalAddCustomer);
    });

    elements.customerSearchInput.addEventListener("input", (e) => {
      state.searchTerm = e.target.value;
      if (state.searchTerm) {
        elements.btnClearSearch.classList.remove("hidden");
      } else {
        elements.btnClearSearch.classList.add("hidden");
      }
      renderDashboard();
    });

    elements.btnClearSearch.addEventListener("click", () => {
      elements.customerSearchInput.value = "";
      state.searchTerm = "";
      elements.btnClearSearch.classList.add("hidden");
      renderDashboard();
      elements.customerSearchInput.focus();
    });

    // 3. Ledger Actions
    elements.btnBackToDashboard.addEventListener("click", () => {
      navigateTo("dashboard");
    });

    elements.btnAddRow.addEventListener("click", addRowToActiveCustomer);
    elements.btnTableBottomAdd.addEventListener("click", addRowToActiveCustomer);

    elements.btnOpenColumnModal.addEventListener("click", () => {
      openModal(elements.modalAddColumn);
    });

    // 4. Modals Submissions
    elements.formAddCustomer.addEventListener("submit", handleCreateCustomer);
    elements.formAddColumn.addEventListener("submit", handleCreateColumn);

    // Generic Modal Close Buttons
    document.querySelectorAll(".modal-close-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-modal");
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Close modal on click outside backdrop
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeModal(overlay);
        }
      });
    });

    // Confirm Delete Action button
    elements.btnConfirmDeleteAction.addEventListener("click", () => {
      if (typeof state.pendingDeleteAction === "function") {
        state.pendingDeleteAction();
        state.pendingDeleteAction = null;
      }
    });

    // 5. Export Dropdown Menu
    elements.btnExportToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      elements.exportDropdownContainer.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#export-dropdown-container")) {
        elements.exportDropdownContainer.classList.remove("open");
      }
    });

    elements.btnExportCsv.addEventListener("click", exportCustomerToCsv);
    elements.btnExportPdf.addEventListener("click", exportCustomerToPdf);

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(closeModal);
        elements.exportDropdownContainer.classList.remove("open");
      }
    });
  }

  /* =========================================================
     Application Bootstrap
  ========================================================= */
  function init() {
    loadData();
    setupEventListeners();

    if (state.currentUser) {
      updateUserDisplay();
      navigateTo("dashboard");
    } else {
      navigateTo("login");
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

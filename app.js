// ------------------------------------------------------------
// Only Events Frontend - Updated to use Backend API
// ------------------------------------------------------------

// Base URL of the backend API — includes /api/v1 prefix matching backend route mounting
const BASE_URL = 'http://localhost:5000/api/v1';

// Package pricing definition (referenced throughout the UI)
const PACKAGES = {
  Bronze: {
    price: 50000,
    name: 'Bronze',
    features: ['Basic tent setup', 'Standard chairs & tables', 'Basic lighting', 'Setup & teardown']
  },
  Silver: {
    price: 100000,
    name: 'Silver',
    features: ['Premium tent setup', 'Cushioned chairs & decorated tables', 'Professional lighting & sound', 'Decor & flowers', 'Setup & teardown', 'Event coordination']
  },
  Gold: {
    price: 200000,
    name: 'Gold',
    features: ['Luxury marquee tent', 'Premium furniture & linens', 'Professional lighting, sound & visual', 'Premium decor, flowers & centerpieces', 'Full event coordination', 'Photography coverage', 'Catering coordination', 'VIP setup area']
  }
};

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Read a cookie value by name (works for non-httpOnly cookies). */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[]\\])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Return Authorization header value when an accessToken cookie is present. */
function getAuthHeaders() {
  const token = getCookie('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/** Attempt to refresh the access token using the stored refreshToken cookie. */
async function tryRefreshToken() {
  try {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) return false;
    const resp = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
      credentials: 'include'
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// Utility: generic API request wrapper
async function apiRequest(path, method = 'GET', data = null, _retry = false) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),          // inject Bearer token when available
    },
    credentials: 'include',        // also send httpOnly cookies (accessToken)
  };
  if (data) options.body = JSON.stringify(data);
  try {
    const resp = await fetch(url, options);

    // If unauthorised and we haven't already retried, attempt token refresh
    if (resp.status === 401 && !_retry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) return apiRequest(path, method, data, true);
      // Refresh failed – redirect to login / show admin login modal
      const adminLoginModal = document.getElementById('admin-login-modal');
      if (adminLoginModal) {
        sessionStorage.removeItem('adminAuth');
        showModal('admin-login-modal');
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API ${method} ${path} failed: ${resp.status} ${err}`);
    }
    // For DELETE that returns no body, just return true
    if (resp.status === 204) return true;
    return await resp.json();
  } catch (e) {
    console.error(e);
    showToast(e.message, 'error');
    throw e;
  }
}

// ------------------------------------------------------------
// Event APIs
// ------------------------------------------------------------
async function fetchEvents() {
  const res = await apiRequest('/events');
  // Backend: { status, data: { events } }
  return { data: res.data?.events ?? res.data ?? [] };
}

async function createEvent(event) {
  return await apiRequest('/events', 'POST', event);
}

async function updateEvent(id, updates) {
  return await apiRequest(`/events/${id}`, 'PATCH', updates);
}

async function deleteEventApi(id) {
  return await apiRequest(`/events/${id}`, 'DELETE');
}

// ------------------------------------------------------------
// Vendor APIs
// ------------------------------------------------------------
async function fetchVendors() {
  const res = await apiRequest('/vendors');
  return { data: res.data?.vendors ?? res.data ?? [] };
}

async function createVendor(vendor) {
  return await apiRequest('/vendors', 'POST', vendor);
}

// ------------------------------------------------------------
// Equipment APIs
// ------------------------------------------------------------
async function fetchEquipment() {
  const res = await apiRequest('/equipment');
  return { data: res.data?.equipment ?? res.data ?? [] };
}

// ------------------------------------------------------------
// Truck APIs
// ------------------------------------------------------------
async function fetchTrucks() {
  const res = await apiRequest('/trucks');
  return { data: res.data?.trucks ?? res.data ?? [] };
}

// ------------------------------------------------------------
// Payment APIs (if any custom endpoints exist)
// ------------------------------------------------------------
async function fetchPayments() {
  const res = await apiRequest('/payments');
  return { data: res.data?.payments ?? res.data ?? [] };
}

// ------------------------------------------------------------
// UI Helpers – replace old localStorage utilities
// ------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add('toast-show');
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// ------------------------------------------------------------
// Dashboard & Admin – load data from API
// ------------------------------------------------------------
async function loadDashboardStats() {
  try {
    const { data: events } = await fetchEvents();
    const { data: equipment } = await fetchEquipment();
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'In Progress').length;
    const totalEquipment = equipment.reduce((s, e) => s + (e.totalQuantity || 0), 0);
    const totalRevenue = events.reduce((s, e) => s + (e.amountPaid || 0), 0);

    animateCounter(document.getElementById('stat-total-events'), totalEvents);
    animateCounter(document.getElementById('stat-active-events'), activeEvents);
    animateCounter(document.getElementById('stat-equipment'), totalEquipment);
    animateCounter(document.getElementById('stat-revenue'), totalRevenue);
  } catch (e) {
    console.warn('Failed to load dashboard stats', e);
  }
}

async function loadAdminEvents() {
  try {
    const { data: events } = await fetchEvents();
    const tbody = document.getElementById('events-table-body');
    if (!tbody) return;
    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No events found.</td></tr>';
      return;
    }
    tbody.innerHTML = events.map(event => {
      const displayType = event.eventType === 'Other' ? event.customEventType : event.eventType;
      const statusClass = getStatusBadgeClass(event.status);
      const pkgClass = event.package ? event.package.toLowerCase() : '';
      return `
        <tr>
          <td>${event.id}</td>
          <td>${event.clientName}</td>
          <td>${displayType}</td>
          <td>${formatDate(event.eventDate)}</td>
          <td>${event.venue}</td>
          <td><span class="badge badge-${pkgClass}">${event.package}</span></td>
          <td><span class="badge ${statusClass}">${event.status}</span></td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary" onclick="viewEventDetail('${event.id}')">View</button>
            <select class="form-control form-control-sm status-select" onchange="updateEventStatus('${event.id}', this.value)">
              <option value="Upcoming" ${event.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
              <option value="In Progress" ${event.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${event.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${event.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-sm btn-danger" onclick="deleteEventApi('${event.id}').then(loadAdminEvents).catch(()=>{})">Delete</button>
          </td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error('Failed to load admin events', e);
  }
}

async function loadEquipment() {
  try {
    const { data: equipment } = await fetchEquipment();
    const tbody = document.getElementById('equipment-table-body');
    if (!tbody) return;
    tbody.innerHTML = equipment.map(eq => `
      <tr>
        <td>${eq.id}</td>
        <td>${eq.name}</td>
        <td>${eq.category}</td>
        <td>${eq.totalQuantity}</td>
        <td>${eq.availableQuantity}</td>
        <td>${eq.condition}</td>
        <td>${eq.status}</td>
      </tr>`).join('');
  } catch (e) {
    console.error('Failed to load equipment', e);
  }
}

async function loadTrucks() {
  try {
    const { data: trucks } = await fetchTrucks();
    const tbody = document.getElementById('trucks-table-body');
    if (!tbody) return;
    tbody.innerHTML = trucks.map(trk => `
      <tr>
        <td>${trk.id}</td>
        <td>${trk.plateNumber}</td>
        <td>${trk.driverName}</td>
        <td>${trk.driverPhone}</td>
        <td>${trk.capacity}</td>
        <td>${trk.status}</td>
        <td>${trk.assignedEventId || 'N/A'}</td>
      </tr>`).join('');
  } catch (e) {
    console.error('Failed to load trucks', e);
  }
}

async function loadPayments() {
  try {
    const { data: payments } = await fetchPayments();
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;
    tbody.innerHTML = payments.map(pmt => `
      <tr>
        <td>${pmt.id}</td>
        <td>${pmt.eventId}</td>
        <td>${formatCurrency(pmt.amount)}</td>
        <td>${pmt.status}</td>
        <td>${formatDate(pmt.createdAt)}</td>
      </tr>`).join('');
  } catch (e) {
    console.error('Failed to load payments', e);
  }
}

async function loadVendors(filterCategory = 'All', searchQuery = '') {
  try {
    const { data: vendors } = await fetchVendors();
    const grid = document.getElementById('vendors-grid');
    if (!grid) return;
    let filtered = vendors;
    if (filterCategory && filterCategory !== 'All') {
      filtered = filtered.filter(v => v.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v => v.businessName.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
    }
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="no-results"><p>No vendors found matching your criteria.</p></div>';
      return;
    }
    grid.innerHTML = filtered.map(vendor => {
      const initials = vendor.businessName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="vendor-card">
          <div class="vendor-image"><div class="vendor-avatar">${initials}</div></div>
          <div class="vendor-info">
            <h3>${vendor.businessName}</h3>
            <span class="vendor-category">${vendor.category}</span>
            <div class="vendor-rating"><span class="stars">${getStarRating(vendor.rating)}</span> (${vendor.reviews} reviews)</div>
            <p>${vendor.description}</p>
            <p class="vendor-location"><i>📍</i> ${vendor.location}</p>
            <div class="vendor-actions">
              <button class="btn btn-sm btn-primary" onclick="contactVendor('${vendor.id}')">Contact</button>
              <button class="btn btn-sm btn-secondary" onclick="viewVendorProfile('${vendor.id}')">View Profile</button>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (e) {
    console.error('Failed to load vendors', e);
  }
}

// ------------------------------------------------------------
// Event Booking – submit to API instead of localStorage
// ------------------------------------------------------------
async function handleBookingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const clientName = form.querySelector('#client-name').value.trim();
  const clientEmail = form.querySelector('#client-email').value.trim();
  const clientPhone = form.querySelector('#client-phone').value.trim();
  const eventType = form.querySelector('#event-type').value;
  const customEventType = form.querySelector('#custom-event-type')?.value.trim() || '';
  const eventDate = form.querySelector('#event-date').value;
  const venue = form.querySelector('#event-venue').value.trim();
  const packageName = form.querySelector('#event-package').value;
  const guests = parseInt(form.querySelector('#event-guests').value, 10) || 0;
  const specialRequirements = form.querySelector('#special-requirements').value.trim();

  if (!clientName || !clientEmail || !clientPhone || !eventType || !eventDate || !venue || !packageName) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  if (eventType === 'Other' && !customEventType) {
    showToast('Please specify the custom event type.', 'error');
    return;
  }

  const pkg = PACKAGES[packageName];
  const amount = pkg ? pkg.price : 0;

  const newEvent = {
    clientName,
    clientEmail,
    clientPhone,
    eventType,
    customEventType,
    eventDate,
    venue,
    package: packageName,
    guests,
    specialRequirements,
    amount,
    paymentStatus: 'Pending',
    amountPaid: 0,
    status: 'Upcoming',
    allocatedEquipment: [],
    assignedTruck: null,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await createEvent(newEvent);
    const created = res.data?.event ?? res.data;
    if (!created?.id) throw new Error('Event creation returned no ID');
    showToast(`Event booked successfully! Your Event ID is ${created.id}`, 'success');
    // Proceed to payment flow – same as before (Payment Request API or fallback)
    const paymentOptions = {
      total: { label: 'Total', amount: { currency: 'KES', value: amount.toString() } },
      displayItems: [{ label: `${pkg.name} Package`, amount: { currency: 'KES', value: amount.toString() } }]
    };
    if (window.PaymentRequest) {
      const request = new PaymentRequest([
        { supportedMethods: ['basic-card'], data: { supportedNetworks: ['visa', 'mastercard', 'maestro'], supportedTypes: ['debit', 'credit'] } }
      ], paymentOptions);
      request.show()
        .then(result => {
          result.complete('success');
          showToast('Payment successful via native UI!', 'success');
          // Update event payment status on server
          updateEvent(created.id, { paymentStatus: 'Paid', amountPaid: amount }).catch(()=>{});
        })
        .catch(() => fallbackToMpesamodal(created.id, amount));
    } else {
      fallbackToMpesamodal(created.id, amount);
    }
  } catch (err) {
    console.error('Event creation failed', err);
  }

  form.reset();
  const summaryEl = document.getElementById('payment-summary');
  if (summaryEl) {
    summaryEl.style.display = 'none';
    summaryEl.innerHTML = '';
  }
  const customGroup = document.getElementById('custom-type-group');
  if (customGroup) customGroup.style.display = 'none';
}

function fallbackToMpesamodal(eventId, amount) {
  const modalBody = document.querySelector('#payment-prompt-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="payment-instructions">
        <h3>Complete Your Payment</h3>
        <p>To confirm your booking, please make payment via M-Pesa:</p>
        <div class="payment-details-box">
          <p><strong>Paybill Number:</strong> 123456</p>
          <p><strong>Account Number:</strong> ${eventId}</p>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
        </div>
        <p class="payment-note">Your booking reference is <strong>${eventId}</strong>. Use this as the account number when paying.</p>
        <div class="payment-modal-actions">
          <button class="btn btn-secondary" onclick="hideModal('payment-prompt-modal')">Pay Later</button>
        </div>
      </div>`;
  }
  showModal('payment-prompt-modal');
}

// ------------------------------------------------------------
// Miscellaneous UI helpers (unchanged from original where possible)
// ------------------------------------------------------------
function getStarRating(rating) {
  let stars = '';
  const full = Math.floor(rating);
  const empty = 5 - full;
  for (let i = 0; i < full; i++) stars += '★';
  for (let i = 0; i < empty; i++) stars += '☆';
  return stars;
}

function formatCurrency(amount) {
  return 'KES ' + Number(amount).toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function animateCounter(el, target, duration = 1500) {
  if (!el) return;
  let start = 0;
  const startTime = performance.now();
  const isRevenue = el.id === 'stat-revenue';
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = isRevenue ? formatCurrency(current) : current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Upcoming': return 'badge-upcoming';
    case 'In Progress': return 'badge-active';
    case 'Completed': return 'badge-completed';
    case 'Cancelled': return 'badge-cancelled';
    default: return '';
  }
}

// ------------------------------------------------------------
// Initialisation – load data on page load / navigation
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Load dashboard stats for home view
  await loadDashboardStats();
  // Preload admin sections (they will be refreshed when navigated to)
  if (document.getElementById('events-table-body')) await loadAdminEvents();
  if (document.getElementById('equipment-table-body')) await loadEquipment();
  if (document.getElementById('trucks-table-body')) await loadTrucks();
  if (document.getElementById('payments-table-body')) await loadPayments();
  // Load vendors for marketplace view
  if (document.getElementById('vendors-grid')) await loadVendors();
});

// ------------------------------------------------------------
// Export functions for HTML event handlers (window scope)
// ------------------------------------------------------------
window.handleBookingSubmit = handleBookingSubmit;
window.handleVendorFormSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const businessName = form.querySelector('#vendor-business-name').value.trim();
  const category = form.querySelector('#vendor-category').value;
  const contactName = form.querySelector('#vendor-contact-name').value.trim();
  const contactEmail = form.querySelector('#vendor-contact-email').value.trim();
  const contactPhone = form.querySelector('#vendor-contact-phone').value.trim();
  const description = form.querySelector('#vendor-description').value.trim();
  const location = form.querySelector('#vendor-location').value.trim();
  if (!businessName || !category || !contactName || !contactEmail || !contactPhone || !description || !location) {
    showToast('Please fill in all vendor fields.', 'error');
    return;
  }
  const newVendor = {
    businessName,
    category,
    contactName,
    contactEmail,
    contactPhone,
    description,
    location,
    rating: 0,
    reviews: 0,
    featured: false,
    createdAt: new Date().toISOString()
  };
  try {
    await createVendor(newVendor);
    await loadVendors();
    hideModal('vendor-modal');
    showToast('Your business has been listed successfully!', 'success');
    form.reset();
  } catch (e) {
    console.error('Vendor creation failed', e);
  }
};

window.updateEventStatus = async function(eventId, newStatus) {
  try {
    await updateEvent(eventId, { status: newStatus });
    await loadAdminEvents();
    await loadDashboardStats();
    showToast(`Event ${eventId} status updated to "${newStatus}".`, 'success');
  } catch (e) {
    console.error('Failed to update event status', e);
  }
};

window.deleteEvent = async function(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await deleteEventApi(eventId);
      await loadAdminEvents();
      showToast(`Event ${eventId} deleted.`, 'success');
    } catch (e) {
      console.error('Delete failed', e);
    }
  }
};

window.contactVendor = function(vendorId) {
  // Simple contact via stored vendor data (fetch if needed)
  fetchVendors().then(res => {
    const vendor = res.data.find(v => v.id === vendorId);
    if (vendor) {
      showToast(`Contact ${vendor.contactName} at ${vendor.contactPhone} or ${vendor.contactEmail}`, 'info');
    }
  });
};

window.viewVendorProfile = async function(vendorId) {
  try {
    const res = await apiRequest(`/vendors/${vendorId}`, 'GET');
    const vendor = res.data?.vendor ?? res.data;
    if (!vendor) return;
    const modalBody = document.querySelector('#event-detail-modal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="vendor-profile-detail">
          <h2>${vendor.businessName}</h2>
          <span class="vendor-category">${vendor.category}</span>
          <div class="vendor-rating" style="margin: 1rem 0;">
            <span class="stars" style="font-size: 1.2rem;">${getStarRating(vendor.rating)}</span>
            <span>${vendor.rating}/5 (${vendor.reviews} reviews)</span>
          </div>
          <p>${vendor.description}</p>
          <hr>
          <h4>Contact Information</h4>
          <p><strong>Contact Person:</strong> ${vendor.contactName}</p>
          <p><strong>Email:</strong> ${vendor.contactEmail}</p>
          <p><strong>Phone:</strong> ${vendor.contactPhone}</p>
          <p><strong>Location:</strong> 📍 ${vendor.location}</p>
        </div>`;
    }
    const modalTitle = document.querySelector('#event-detail-modal .modal-title');
    if (modalTitle) modalTitle.textContent = 'Vendor Profile';
    showModal('event-detail-modal');
  } catch (e) {
    console.error('Failed to load vendor profile', e);
  }
};

// Additional navigation helpers remain unchanged
function navigateTo(sectionId) {
  if (sectionId === 'admin') {
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      showModal('admin-login-modal');
      return;
    }
    loadAdminDashboard();
  }
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  document.querySelectorAll('nav a[data-section]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });
  const navMenu = document.querySelector('.nav-links');
  if (navMenu) navMenu.classList.remove('active');
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) hamburger.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadAdminDashboard() {
  loadDashboardStats();
  loadAdminEvents();
  loadEquipment();
  loadTrucks();
  loadPayments();
}

function handleAdminLogin(e) {
  e.preventDefault();
  const pinInput = document.querySelector('#admin-pin');
  const errorEl = document.querySelector('#admin-login-error');
  if (!pinInput) return;
  if (pinInput.value === '1234') {
    sessionStorage.setItem('adminAuth', 'true');
    hideModal('admin-login-modal');
    if (errorEl) errorEl.textContent = '';
    pinInput.value = '';
    navigateTo('admin');
  } else {
    if (errorEl) {
      errorEl.textContent = 'Incorrect PIN. Please try again.';
      errorEl.style.display = 'block';
    }
    showToast('Incorrect PIN. Access denied.', 'error');
  }
}

// Export remaining global functions for HTML attribute bindings
window.navigateTo = navigateTo;
window.handleAdminLogin = handleAdminLogin;
window.handleEventTypeChange = function(e) {
  const customGroup = document.getElementById('custom-type-group');
  if (!customGroup) return;
  customGroup.style.display = e.target.value === 'Other' ? 'block' : 'none';
};
window.handlePackageChange = function(e) {
  const summaryEl = document.getElementById('payment-summary');
  if (!summaryEl) return;
  const pkg = PACKAGES[e.target.value];
  if (pkg) {
    summaryEl.innerHTML = `
      <div class="summary-item"><strong>Package:</strong> ${pkg.name}</div>
      <div class="summary-item"><strong>Price:</strong> ${formatCurrency(pkg.price)}</div>
      <ul class="summary-features">${pkg.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>`;
    summaryEl.style.display = 'block';
  } else {
    summaryEl.style.display = 'none';
    summaryEl.innerHTML = '';
  }
};

// ── UI Wiring ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // --- Hamburger / mobile menu ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // close when a link is clicked
    navLinks.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  }

  // --- Nav scroll shadow ---
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // --- Admin tab switching ---
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = document.querySelector(`.admin-tab-content[data-tab="${tabName}"]`);
      if (content) content.classList.add('active');
    });
  });

  // --- Sidebar nav items ---
  document.querySelectorAll('.sidebar-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.dataset.panel;
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
    });
  });

  // --- Close modals on overlay click ---
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open', 'active');
    });
  });

  // --- Support FAB toggle ---
  const fab  = document.querySelector('.fab-support');
  const menu = document.querySelector('.support-menu');
  if (fab && menu) {
    fab.addEventListener('click', () => menu.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!fab.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
    });
  }

  // --- Intersection observer for scroll-reveal ---
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.event-card, .pricing-card, .vendor-card, .provider-card, .dash-card').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

});

// Expose viewEventDetail globally for table buttons
window.viewEventDetail = async function(eventId) {
  try {
    const { data: event } = await apiRequest(`/events/${eventId}`, 'GET');
    const modalBody  = document.querySelector('#event-detail-modal .modal-body');
    const modalTitle = document.querySelector('#event-detail-modal .modal-title');
    if (!modalBody) return;
    if (modalTitle) modalTitle.textContent = 'Event Details';
    const displayType = event.eventType === 'Other' ? event.customEventType : event.eventType;
    const pkg = PACKAGES[event.package] || {};
    modalBody.innerHTML = `
      <div class="event-detail-grid" style="display:grid;gap:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">ID: ${event.id}</span>
          <span class="badge badge-${(event.status||'').toLowerCase().replace(' ','-')}">${event.status}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Client</div><div style="font-weight:600;">${event.clientName}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Event Type</div><div>${displayType}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Date</div><div>${formatDate(event.eventDate)}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Venue</div><div>${event.venue}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Package</div><div class="badge badge-${(event.package||'').toLowerCase()}-pkg">${event.package}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Guests</div><div>${event.guests || 'N/A'}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Total Amount</div><div style="color:var(--gold);font-weight:700;">${formatCurrency(event.amount)}</div></div>
          <div><div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem;">Amount Paid</div><div>${formatCurrency(event.amountPaid||0)}</div></div>
        </div>
        ${event.specialRequirements ? `<div style="background:var(--gold-pale);border:1px solid var(--gold-border);border-radius:8px;padding:0.75rem;font-size:0.82rem;color:var(--text-secondary);">📋 ${event.specialRequirements}</div>` : ''}
        <div style="font-size:0.75rem;color:var(--text-muted);">Contact: ${event.clientEmail} · ${event.clientPhone}</div>
      </div>`;
    showModal('event-detail-modal');
  } catch(e) {
    console.error('Failed to load event detail', e);
  }
};

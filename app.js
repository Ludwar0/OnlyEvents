// ============================================================
// Only Events - Complete Application JavaScript
// ============================================================

// ---------- Package Pricing ----------
const PACKAGES = {
  Bronze: {
    price: 50000,
    name: 'Bronze',
    features: [
      'Basic tent setup',
      'Standard chairs & tables',
      'Basic lighting',
      'Setup & teardown'
    ]
  },
  Silver: {
    price: 100000,
    name: 'Silver',
    features: [
      'Premium tent setup',
      'Cushioned chairs & decorated tables',
      'Professional lighting & sound',
      'Decor & flowers',
      'Setup & teardown',
      'Event coordination'
    ]
  },
  Gold: {
    price: 200000,
    name: 'Gold',
    features: [
      'Luxury marquee tent',
      'Premium furniture & linens',
      'Professional lighting, sound & visual',
      'Premium decor, flowers & centerpieces',
      'Full event coordination',
      'Photography coverage',
      'Catering coordination',
      'VIP setup area'
    ]
  }
};

// ---------- Utility Functions ----------

function getFromStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix, items) {
  let maxNum = 0;
  items.forEach(item => {
    const parts = item.id.split('-');
    const num = parseInt(parts[1], 10);
    if (num > maxNum) maxNum = num;
  });
  const next = maxNum + 1;
  return prefix + '-' + String(next).padStart(3, '0');
}

function formatCurrency(amount) {
  return 'KES ' + Number(amount).toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getStarRating(rating) {
  let stars = '';
  const full = Math.floor(rating);
  const empty = 5 - full;
  for (let i = 0; i < full; i++) stars += '★';
  for (let i = 0; i < empty; i++) stars += '☆';
  return stars;
}

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
  // Trigger reflow for animation
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

function animateCounter(el, target, duration = 1500) {
  if (!el) return;
  let start = 0;
  const startTime = performance.now();
  const isRevenue = el.id === 'stat-revenue';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = isRevenue ? formatCurrency(current) : current.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

// ---------- Navigation & Routing ----------

function navigateTo(sectionId) {
  // Admin authentication check
  if (sectionId === 'admin') {
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      showModal('admin-login-modal');
      return;
    }
    loadAdminDashboard();
  }

  // Hide all sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(s => s.classList.remove('active'));

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  // Update nav active state
  const navLinks = document.querySelectorAll('nav a[data-section]');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    }
  });

  // Close mobile menu
  const navMenu = document.querySelector('.nav-links');
  if (navMenu) navMenu.classList.remove('active');
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) hamburger.classList.remove('active');

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Sample Data Initialization ----------

function initSampleData() {
  // Sample Events
  if (getFromStorage('events').length === 0) {
    const sampleEvents = [
      {
        id: 'EVT-001',
        clientName: 'Sarah Njeri',
        clientEmail: 'sarah@email.com',
        clientPhone: '0712345678',
        eventType: 'Wedding',
        customEventType: '',
        eventDate: '2026-07-15',
        venue: 'Karura Forest Gardens',
        package: 'Gold',
        guests: 300,
        specialRequirements: 'Live band, special lighting',
        amount: 200000,
        paymentStatus: 'Paid',
        amountPaid: 200000,
        status: 'Upcoming',
        allocatedEquipment: [],
        assignedTruck: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'EVT-002',
        clientName: 'James Ochieng',
        clientEmail: 'james@email.com',
        clientPhone: '0723456789',
        eventType: 'Corporate',
        customEventType: '',
        eventDate: '2026-07-02',
        venue: 'KICC Conference Hall',
        package: 'Silver',
        guests: 150,
        specialRequirements: 'Projector and screen needed',
        amount: 100000,
        paymentStatus: 'Partial',
        amountPaid: 50000,
        status: 'In Progress',
        allocatedEquipment: [],
        assignedTruck: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'EVT-003',
        clientName: 'Mary Wangari',
        clientEmail: 'mary@email.com',
        clientPhone: '0734567890',
        eventType: 'Ruracio',
        customEventType: '',
        eventDate: '2026-07-20',
        venue: 'Kiambu Country Home',
        package: 'Gold',
        guests: 200,
        specialRequirements: 'Traditional setup, cultural decorations',
        amount: 200000,
        paymentStatus: 'Pending',
        amountPaid: 0,
        status: 'Upcoming',
        allocatedEquipment: [],
        assignedTruck: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'EVT-004',
        clientName: 'Peter Kamau',
        clientEmail: 'peter@email.com',
        clientPhone: '0745678901',
        eventType: 'Funeral',
        customEventType: '',
        eventDate: '2026-06-20',
        venue: "Lang'ata Cemetery",
        package: 'Bronze',
        guests: 100,
        specialRequirements: 'Somber decor, PA system',
        amount: 50000,
        paymentStatus: 'Paid',
        amountPaid: 50000,
        status: 'Completed',
        allocatedEquipment: [],
        assignedTruck: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'EVT-005',
        clientName: 'Lucy Achieng',
        clientEmail: 'lucy@email.com',
        clientPhone: '0756789012',
        eventType: 'Birthday',
        customEventType: '',
        eventDate: '2026-08-10',
        venue: 'Westlands Rooftop Lounge',
        package: 'Silver',
        guests: 80,
        specialRequirements: 'Surprise setup, balloon arch',
        amount: 100000,
        paymentStatus: 'Pending',
        amountPaid: 0,
        status: 'Upcoming',
        allocatedEquipment: [],
        assignedTruck: null,
        createdAt: new Date().toISOString()
      }
    ];
    saveToStorage('events', sampleEvents);
  }

  // Sample Equipment
  if (getFromStorage('equipment').length === 0) {
    const sampleEquipment = [
      { id: 'EQP-001', name: 'Tent (100-seater)', category: 'Tents', totalQuantity: 5, availableQuantity: 3, condition: 'Good', status: 'Available' },
      { id: 'EQP-002', name: 'Tent (200-seater)', category: 'Tents', totalQuantity: 3, availableQuantity: 2, condition: 'Good', status: 'Available' },
      { id: 'EQP-003', name: 'Plastic Chairs', category: 'Chairs', totalQuantity: 500, availableQuantity: 350, condition: 'Good', status: 'Available' },
      { id: 'EQP-004', name: 'Cushioned Chairs', category: 'Chairs', totalQuantity: 200, availableQuantity: 150, condition: 'Good', status: 'Available' },
      { id: 'EQP-005', name: 'Round Tables (8-seater)', category: 'Tables', totalQuantity: 50, availableQuantity: 35, condition: 'Good', status: 'Available' },
      { id: 'EQP-006', name: 'LED Lights Set', category: 'Lighting', totalQuantity: 20, availableQuantity: 15, condition: 'Good', status: 'Available' },
      { id: 'EQP-007', name: 'Sound System', category: 'Sound', totalQuantity: 8, availableQuantity: 5, condition: 'Fair', status: 'Available' },
      { id: 'EQP-008', name: 'Table Linens', category: 'Decor', totalQuantity: 100, availableQuantity: 70, condition: 'Good', status: 'Available' }
    ];
    saveToStorage('equipment', sampleEquipment);
  }

  // Sample Trucks
  if (getFromStorage('trucks').length === 0) {
    const events = getFromStorage('events');
    const firstEventId = events.length > 0 ? events[0].id : null;
    const sampleTrucks = [
      { id: 'TRK-001', plateNumber: 'KBA 123A', driverName: 'John Kamau', driverPhone: '0711111111', capacity: '5 Tonnes', status: 'Available', assignedEventId: null, lastUpdated: new Date().toISOString() },
      { id: 'TRK-002', plateNumber: 'KBB 456B', driverName: 'Peter Odhiambo', driverPhone: '0722222222', capacity: '3 Tonnes', status: 'En Route', assignedEventId: firstEventId, lastUpdated: new Date().toISOString() },
      { id: 'TRK-003', plateNumber: 'KBC 789C', driverName: 'Mary Wanjiku', driverPhone: '0733333333', capacity: '8 Tonnes', status: 'Available', assignedEventId: null, lastUpdated: new Date().toISOString() }
    ];
    saveToStorage('trucks', sampleTrucks);
  }

  // Sample Vendors
  if (getFromStorage('vendors').length === 0) {
    const sampleVendors = [
      { id: 'VND-001', businessName: 'Savanna Catering', category: 'Catering', contactName: 'Jane Wambui', contactEmail: 'info@savannacatering.co.ke', contactPhone: '0712345678', description: 'Premium catering services for all events. Specializing in local and international cuisine with over 10 years of experience.', rating: 4.8, reviews: 124, location: 'Nairobi', featured: true, createdAt: new Date().toISOString() },
      { id: 'VND-002', businessName: 'Lens Masters Photography', category: 'Photography', contactName: 'David Mwangi', contactEmail: 'hello@lensmasters.co.ke', contactPhone: '0723456789', description: 'Capturing your precious moments with artistic flair. Professional photography and videography services.', rating: 4.9, reviews: 98, location: 'Nairobi', featured: true, createdAt: new Date().toISOString() },
      { id: 'VND-003', businessName: 'DJ Beats Kenya', category: 'Music/DJ', contactName: 'Brian Otieno', contactEmail: 'bookings@djbeats.co.ke', contactPhone: '0734567890', description: 'Top-rated DJ services for weddings, corporate events, and parties. State-of-the-art sound and lighting.', rating: 4.7, reviews: 156, location: 'Mombasa', featured: false, createdAt: new Date().toISOString() },
      { id: 'VND-004', businessName: 'Bloom Florals', category: 'Floristry', contactName: 'Grace Akinyi', contactEmail: 'orders@bloomflorals.co.ke', contactPhone: '0745678901', description: 'Beautiful floral arrangements for every occasion. Fresh flowers, bouquets, and venue decoration.', rating: 4.6, reviews: 87, location: 'Kisumu', featured: false, createdAt: new Date().toISOString() },
      { id: 'VND-005', businessName: 'MC Tony Events', category: 'MC/Host', contactName: 'Tony Kiptoo', contactEmail: 'book@mctony.co.ke', contactPhone: '0756789012', description: 'Energetic and professional MC services. Bilingual hosting in English and Swahili for memorable events.', rating: 4.8, reviews: 203, location: 'Nairobi', featured: true, createdAt: new Date().toISOString() },
      { id: 'VND-006', businessName: 'Elegant Spaces Decor', category: 'Decor', contactName: 'Amina Hassan', contactEmail: 'info@elegantspaces.co.ke', contactPhone: '0767890123', description: 'Transform your venue into a masterpiece. Specializing in themed decorations for weddings and corporate events.', rating: 4.5, reviews: 65, location: 'Nakuru', featured: false, createdAt: new Date().toISOString() }
    ];
    saveToStorage('vendors', sampleVendors);
  }
}

// ---------- Event Booking ----------

function handleEventTypeChange(e) {
  const customGroup = document.getElementById('custom-type-group');
  if (!customGroup) return;
  if (e.target.value === 'Other') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }
}

function handlePackageChange(e) {
  const summaryEl = document.getElementById('payment-summary');
  if (!summaryEl) return;
  const pkg = PACKAGES[e.target.value];
  if (pkg) {
    summaryEl.innerHTML = `
      <div class="summary-item">
        <strong>Package:</strong> ${pkg.name}
      </div>
      <div class="summary-item">
        <strong>Price:</strong> ${formatCurrency(pkg.price)}
      </div>
      <ul class="summary-features">
        ${pkg.features.map(f => `<li>✓ ${f}</li>`).join('')}
      </ul>
    `;
    summaryEl.style.display = 'block';
  } else {
    summaryEl.style.display = 'none';
    summaryEl.innerHTML = '';
  }
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const clientName = form.querySelector('#client-name').value.trim();
  const clientEmail = form.querySelector('#client-email').value.trim();
  const clientPhone = form.querySelector('#client-phone').value.trim();
  const eventType = form.querySelector('#event-type').value;
  const customEventType = form.querySelector('#custom-event-type') ? form.querySelector('#custom-event-type').value.trim() : '';
  const eventDate = form.querySelector('#event-date').value;
  const venue = form.querySelector('#event-venue').value.trim();
  const packageName = form.querySelector('#event-package').value;
  const guests = parseInt(form.querySelector('#event-guests').value, 10) || 0;
  const specialRequirements = form.querySelector('#special-requirements').value.trim();

  // Validation
  if (!clientName || !clientEmail || !clientPhone || !eventType || !eventDate || !venue || !packageName) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  if (eventType === 'Other' && !customEventType) {
    showToast('Please specify the custom event type.', 'error');
    return;
  }

  const events = getFromStorage('events');
  const id = generateId('EVT', events);
  const pkg = PACKAGES[packageName];
  const amount = pkg ? pkg.price : 0;

  const newEvent = {
    id,
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

  events.push(newEvent);
  saveToStorage('events', events);

  showToast('Event booked successfully! Your Event ID is ' + id, 'success');

  // Show payment prompt modal
  const modalBody = document.querySelector('#payment-prompt-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="payment-instructions">
        <h3>Complete Your Payment</h3>
        <p>To confirm your booking, please make payment via M-Pesa:</p>
        <div class="payment-details-box">
          <p><strong>Paybill Number:</strong> 123456</p>
          <p><strong>Account Number:</strong> ${id}</p>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
        </div>
        <p class="payment-note">Your booking reference is <strong>${id}</strong>. Please use this as your account number when making the payment.</p>
        <div class="payment-modal-actions">
          <button class="btn btn-secondary" onclick="hideModal('payment-prompt-modal')">Pay Later</button>
        </div>
      </div>
    `;
  }
  showModal('payment-prompt-modal');

  // Reset form
  form.reset();
  const summaryEl = document.getElementById('payment-summary');
  if (summaryEl) {
    summaryEl.style.display = 'none';
    summaryEl.innerHTML = '';
  }
  const customGroup = document.getElementById('custom-type-group');
  if (customGroup) customGroup.style.display = 'none';
}

// ---------- Marketplace ----------

function loadVendors(filterCategory = 'All', searchQuery = '') {
  const vendors = getFromStorage('vendors');
  const grid = document.getElementById('vendors-grid');
  if (!grid) return;

  let filtered = vendors;

  if (filterCategory && filterCategory !== 'All') {
    filtered = filtered.filter(v => v.category === filterCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(v =>
      v.businessName.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>No vendors found matching your criteria.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(vendor => {
    const initials = vendor.businessName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div class="vendor-card">
        <div class="vendor-image">
          <div class="vendor-avatar">${initials}</div>
        </div>
        <div class="vendor-info">
          <h3>${vendor.businessName}</h3>
          <span class="vendor-category">${vendor.category}</span>
          <div class="vendor-rating">
            <span class="stars">${getStarRating(vendor.rating)}</span>
            <span>(${vendor.reviews} reviews)</span>
          </div>
          <p>${vendor.description}</p>
          <p class="vendor-location"><i>📍</i> ${vendor.location}</p>
          <div class="vendor-actions">
            <button class="btn btn-sm btn-primary" onclick="contactVendor('${vendor.id}')">Contact</button>
            <button class="btn btn-sm btn-secondary" onclick="viewVendorProfile('${vendor.id}')">View Profile</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function contactVendor(vendorId) {
  const vendors = getFromStorage('vendors');
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) return;
  showToast(`Contact ${vendor.contactName} at ${vendor.contactPhone} or ${vendor.contactEmail}`, 'info');
}

function viewVendorProfile(vendorId) {
  const vendors = getFromStorage('vendors');
  const vendor = vendors.find(v => v.id === vendorId);
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
      </div>
    `;
  }
  const modalTitle = document.querySelector('#event-detail-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Vendor Profile';
  showModal('event-detail-modal');
}

function handleVendorFormSubmit(e) {
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

  const vendors = getFromStorage('vendors');
  const id = generateId('VND', vendors);

  const newVendor = {
    id,
    businessName,
    category,
    contactName,
    contactEmail,
    contactPhone,
    description,
    rating: 0,
    reviews: 0,
    location,
    featured: false,
    createdAt: new Date().toISOString()
  };

  vendors.push(newVendor);
  saveToStorage('vendors', vendors);

  loadVendors();
  hideModal('vendor-modal');
  showToast('Your business has been listed successfully!', 'success');
  form.reset();
}

// ---------- Admin Dashboard ----------

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

function loadAdminDashboard() {
  loadDashboardStats();
  loadAdminEvents();
  loadEquipment();
  loadTrucks();
  loadPayments();
}

function loadDashboardStats() {
  const events = getFromStorage('events');
  const equipment = getFromStorage('equipment');

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'In Progress').length;
  const totalEquipment = equipment.reduce((sum, eq) => sum + eq.totalQuantity, 0);
  const totalRevenue = events.reduce((sum, ev) => sum + (ev.amountPaid || 0), 0);

  const elTotalEvents = document.getElementById('stat-total-events');
  const elActiveEvents = document.getElementById('stat-active-events');
  const elEquipment = document.getElementById('stat-equipment');
  const elRevenue = document.getElementById('stat-revenue');

  animateCounter(elTotalEvents, totalEvents);
  animateCounter(elActiveEvents, activeEvents);
  animateCounter(elEquipment, totalEquipment);
  animateCounter(elRevenue, totalRevenue);
}

// ---------- Admin - Events Tab ----------

function loadAdminEvents() {
  const events = getFromStorage('events');
  const tbody = document.getElementById('events-table-body');
  if (!tbody) return;

  if (events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No events found.</td></tr>';
    return;
  }

  tbody.innerHTML = events.map(event => {
    const displayType = event.eventType === 'Other' ? event.customEventType : event.eventType;
    const statusClass = getStatusBadgeClass(event.status);
    const packageClass = event.package ? event.package.toLowerCase() : '';

    return `
      <tr>
        <td>${event.id}</td>
        <td>${event.clientName}</td>
        <td>${displayType}</td>
        <td>${formatDate(event.eventDate)}</td>
        <td>${event.venue}</td>
        <td><span class="badge badge-${packageClass}">${event.package}</span></td>
        <td><span class="badge ${statusClass}">${event.status}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="viewEventDetail('${event.id}')">View</button>
          <select class="form-control form-control-sm status-select" onchange="updateEventStatus('${event.id}', this.value)">
            <option value="Upcoming" ${event.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
            <option value="In Progress" ${event.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${event.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${event.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
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

function viewEventDetail(eventId) {
  const events = getFromStorage('events');
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const displayType = event.eventType === 'Other' ? event.customEventType : event.eventType;
  const balance = event.amount - event.amountPaid;

  const modalBody = document.querySelector('#event-detail-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="event-detail">
        <div class="detail-header">
          <h2>${event.id} - ${displayType}</h2>
          <span class="badge ${getStatusBadgeClass(event.status)}">${event.status}</span>
        </div>
        <div class="detail-grid">
          <div class="detail-section">
            <h4>Client Information</h4>
            <p><strong>Name:</strong> ${event.clientName}</p>
            <p><strong>Email:</strong> ${event.clientEmail}</p>
            <p><strong>Phone:</strong> ${event.clientPhone}</p>
          </div>
          <div class="detail-section">
            <h4>Event Details</h4>
            <p><strong>Type:</strong> ${displayType}</p>
            <p><strong>Date:</strong> ${formatDate(event.eventDate)}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Guests:</strong> ${event.guests}</p>
            <p><strong>Package:</strong> <span class="badge badge-${event.package.toLowerCase()}">${event.package}</span></p>
          </div>
          <div class="detail-section">
            <h4>Payment Information</h4>
            <p><strong>Total Amount:</strong> ${formatCurrency(event.amount)}</p>
            <p><strong>Amount Paid:</strong> ${formatCurrency(event.amountPaid)}</p>
            <p><strong>Balance:</strong> ${formatCurrency(balance)}</p>
            <p><strong>Payment Status:</strong> <span class="badge badge-${event.paymentStatus.toLowerCase()}">${event.paymentStatus}</span></p>
          </div>
          <div class="detail-section">
            <h4>Special Requirements</h4>
            <p>${event.specialRequirements || 'None specified'}</p>
          </div>
          <div class="detail-section">
            <h4>Allocated Equipment</h4>
            ${event.allocatedEquipment.length > 0 ?
              '<ul>' + event.allocatedEquipment.map(ae => {
                const equipment = getFromStorage('equipment');
                const eq = equipment.find(e => e.id === ae.equipmentId);
                return `<li>${eq ? eq.name : ae.equipmentId} - Qty: ${ae.quantity}</li>`;
              }).join('') + '</ul>'
              : '<p>No equipment allocated yet.</p>'
            }
          </div>
          <div class="detail-section">
            <h4>Logistics</h4>
            <p><strong>Assigned Truck:</strong> ${event.assignedTruck ? event.assignedTruck : 'Not assigned'}</p>
          </div>
        </div>
      </div>
    `;
  }
  const modalTitle = document.querySelector('#event-detail-modal .modal-title');
  if (modalTitle) modalTitle.textContent = 'Event Details';
  showModal('event-detail-modal');
}

function updateEventStatus(eventId, newStatus) {
  const events = getFromStorage('events');
  const idx = events.findIndex(e => e.id === eventId);
  if (idx === -1) return;

  events[idx].status = newStatus;
  saveToStorage('events', events);
  loadAdminEvents();
  loadDashboardStats();
  showToast(`Event ${eventId} status updated to "${newStatus}".`, 'success');
}

function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

  let events = getFromStorage('events');
  events = events.filter(e => e.id !== eventId);
  saveToStorage('events', events);

  // Unassign trucks
  let trucks = getFromStorage('trucks');
  trucks.forEach(t => {
    if (t.assignedEventId === eventId) {
      t.assignedEventId = null;
      t.status = 'Available';
    }
  });
  saveToStorage('trucks', trucks);

  loadAdminEvents();
  loadDashboardStats();
  loadTrucks();
  loadPayments();
  showToast(`Event ${eventId} has been deleted.`, 'success');
}

// ---------- Admin - Equipment Tab ----------

function handleEquipmentFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const name = form.querySelector('#equip-name').value.trim();
  const category = form.querySelector('#equip-category').value;
  const totalQuantity = parseInt(form.querySelector('#equip-quantity').value, 10) || 0;
  const condition = form.querySelector('#equip-condition').value;

  if (!name || !category || totalQuantity <= 0) {
    showToast('Please fill in all equipment fields with valid values.', 'error');
    return;
  }

  const equipment = getFromStorage('equipment');
  const id = generateId('EQP', equipment);

  const newEquipment = {
    id,
    name,
    category,
    totalQuantity,
    availableQuantity: totalQuantity,
    condition,
    status: 'Available'
  };

  equipment.push(newEquipment);
  saveToStorage('equipment', equipment);

  loadEquipment();
  loadDashboardStats();
  showToast(`Equipment "${name}" added successfully!`, 'success');
  form.reset();
}

function loadEquipment() {
  const equipment = getFromStorage('equipment');
  const tbody = document.getElementById('equipment-table-body');
  if (!tbody) return;

  if (equipment.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No equipment found.</td></tr>';
    return;
  }

  tbody.innerHTML = equipment.map(eq => {
    // Determine dynamic status
    let status = 'Available';
    let statusClass = 'badge-available';
    if (eq.availableQuantity === 0) {
      status = 'Allocated';
      statusClass = 'badge-active';
    } else if (eq.condition === 'Needs Repair') {
      status = 'Maintenance';
      statusClass = 'badge-cancelled';
    }

    return `
      <tr>
        <td>${eq.id}</td>
        <td>${eq.name}</td>
        <td>${eq.category}</td>
        <td>${eq.totalQuantity}</td>
        <td>${eq.availableQuantity}</td>
        <td>${eq.condition}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-primary" onclick="showAllocateModal('${eq.id}')" ${eq.availableQuantity === 0 ? 'disabled' : ''}>Allocate</button>
          <select class="form-control form-control-sm" onchange="updateEquipmentCondition('${eq.id}', this.value)">
            <option value="Good" ${eq.condition === 'Good' ? 'selected' : ''}>Good</option>
            <option value="Fair" ${eq.condition === 'Fair' ? 'selected' : ''}>Fair</option>
            <option value="Needs Repair" ${eq.condition === 'Needs Repair' ? 'selected' : ''}>Needs Repair</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function updateEquipmentCondition(equipmentId, newCondition) {
  const equipment = getFromStorage('equipment');
  const idx = equipment.findIndex(e => e.id === equipmentId);
  if (idx === -1) return;

  equipment[idx].condition = newCondition;
  saveToStorage('equipment', equipment);
  loadEquipment();
  showToast(`Equipment condition updated to "${newCondition}".`, 'success');
}

function showAllocateModal(equipmentId) {
  const events = getFromStorage('events');
  const activeEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'In Progress');

  const eventSelect = document.getElementById('allocate-event-select');
  if (eventSelect) {
    eventSelect.innerHTML = '<option value="">Select Event</option>' +
      activeEvents.map(e => `<option value="${e.id}">${e.id} - ${e.clientName} (${e.eventType})</option>`).join('');
  }

  const modal = document.getElementById('allocate-modal');
  if (modal) {
    modal.setAttribute('data-equipment-id', equipmentId);
  }

  // Show available quantity
  const equipment = getFromStorage('equipment');
  const eq = equipment.find(e => e.id === equipmentId);
  const availInfo = document.getElementById('allocate-available-info');
  if (availInfo && eq) {
    availInfo.textContent = `Available: ${eq.availableQuantity} of ${eq.totalQuantity}`;
  }

  showModal('allocate-modal');
}

function handleAllocateFormSubmit(e) {
  e.preventDefault();

  const modal = document.getElementById('allocate-modal');
  const equipmentId = modal ? modal.getAttribute('data-equipment-id') : null;
  if (!equipmentId) return;

  const eventId = document.getElementById('allocate-event-select').value;
  const quantity = parseInt(document.getElementById('allocate-quantity').value, 10) || 0;

  if (!eventId) {
    showToast('Please select an event.', 'error');
    return;
  }
  if (quantity <= 0) {
    showToast('Please enter a valid quantity.', 'error');
    return;
  }

  const equipment = getFromStorage('equipment');
  const eqIdx = equipment.findIndex(eq => eq.id === equipmentId);
  if (eqIdx === -1) return;

  if (quantity > equipment[eqIdx].availableQuantity) {
    showToast(`Only ${equipment[eqIdx].availableQuantity} available. Please reduce quantity.`, 'error');
    return;
  }

  // Update equipment
  equipment[eqIdx].availableQuantity -= quantity;
  saveToStorage('equipment', equipment);

  // Update event
  const events = getFromStorage('events');
  const evIdx = events.findIndex(ev => ev.id === eventId);
  if (evIdx !== -1) {
    if (!events[evIdx].allocatedEquipment) events[evIdx].allocatedEquipment = [];
    const existingAlloc = events[evIdx].allocatedEquipment.find(a => a.equipmentId === equipmentId);
    if (existingAlloc) {
      existingAlloc.quantity += quantity;
    } else {
      events[evIdx].allocatedEquipment.push({ equipmentId, quantity });
    }
    saveToStorage('events', events);
  }

  loadEquipment();
  loadAdminEvents();
  loadDashboardStats();
  hideModal('allocate-modal');
  showToast(`${quantity} unit(s) allocated to event ${eventId}.`, 'success');

  // Reset form
  document.getElementById('allocate-quantity').value = '';
  document.getElementById('allocate-event-select').value = '';
}

// ---------- Admin - Trucks Tab ----------

function handleTruckFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const plateNumber = form.querySelector('#truck-plate').value.trim();
  const driverName = form.querySelector('#truck-driver').value.trim();
  const driverPhone = form.querySelector('#truck-driver-phone').value.trim();
  const capacity = form.querySelector('#truck-capacity').value.trim();

  if (!plateNumber || !driverName || !driverPhone || !capacity) {
    showToast('Please fill in all truck fields.', 'error');
    return;
  }

  const trucks = getFromStorage('trucks');
  const id = generateId('TRK', trucks);

  const newTruck = {
    id,
    plateNumber,
    driverName,
    driverPhone,
    capacity,
    status: 'Available',
    assignedEventId: null,
    lastUpdated: new Date().toISOString()
  };

  trucks.push(newTruck);
  saveToStorage('trucks', trucks);

  loadTrucks();
  showToast(`Truck "${plateNumber}" added successfully!`, 'success');
  form.reset();
}

function loadTrucks() {
  const trucks = getFromStorage('trucks');
  const grid = document.getElementById('trucks-grid');
  if (!grid) return;

  if (trucks.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>No trucks registered.</p></div>';
    return;
  }

  const events = getFromStorage('events');

  grid.innerHTML = trucks.map(truck => {
    const statusClass = getTruckStatusClass(truck.status);
    let assignedEventName = 'Not assigned';
    if (truck.assignedEventId) {
      const event = events.find(e => e.id === truck.assignedEventId);
      assignedEventName = event ? `${truck.assignedEventId} - ${event.clientName}` : truck.assignedEventId;
    }

    return `
      <div class="truck-card">
        <div class="truck-header">
          <span class="truck-plate">${truck.plateNumber}</span>
          <span class="badge badge-${statusClass}">${truck.status}</span>
        </div>
        <div class="truck-body">
          <p><strong>Driver:</strong> ${truck.driverName}</p>
          <p><strong>Phone:</strong> ${truck.driverPhone}</p>
          <p><strong>Capacity:</strong> ${truck.capacity}</p>
          <p><strong>Event:</strong> ${assignedEventName}</p>
        </div>
        <div class="truck-actions">
          <select class="form-control" onchange="updateTruckStatus('${truck.id}', this.value)">
            <option value="Available" ${truck.status === 'Available' ? 'selected' : ''}>Available</option>
            <option value="En Route" ${truck.status === 'En Route' ? 'selected' : ''}>En Route</option>
            <option value="At Venue" ${truck.status === 'At Venue' ? 'selected' : ''}>At Venue</option>
            <option value="Returning" ${truck.status === 'Returning' ? 'selected' : ''}>Returning</option>
          </select>
          <button class="btn btn-sm btn-primary" onclick="showAssignTruckModal('${truck.id}')">Assign to Event</button>
        </div>
      </div>
    `;
  }).join('');
}

function getTruckStatusClass(status) {
  switch (status) {
    case 'Available': return 'available';
    case 'En Route': return 'active';
    case 'At Venue': return 'upcoming';
    case 'Returning': return 'completed';
    default: return '';
  }
}

function updateTruckStatus(truckId, newStatus) {
  const trucks = getFromStorage('trucks');
  const idx = trucks.findIndex(t => t.id === truckId);
  if (idx === -1) return;

  trucks[idx].status = newStatus;
  trucks[idx].lastUpdated = new Date().toISOString();

  // If returning or available, unassign from event
  if (newStatus === 'Available') {
    if (trucks[idx].assignedEventId) {
      const events = getFromStorage('events');
      const evIdx = events.findIndex(e => e.id === trucks[idx].assignedEventId);
      if (evIdx !== -1) {
        events[evIdx].assignedTruck = null;
        saveToStorage('events', events);
      }
      trucks[idx].assignedEventId = null;
    }
  }

  saveToStorage('trucks', trucks);
  loadTrucks();
  showToast(`Truck status updated to "${newStatus}".`, 'success');
}

function showAssignTruckModal(truckId) {
  const events = getFromStorage('events');
  const activeEvents = events.filter(e => e.status === 'Upcoming' || e.status === 'In Progress');

  if (activeEvents.length === 0) {
    showToast('No active events to assign.', 'error');
    return;
  }

  // Build a simple selection
  let options = activeEvents.map(e => `${e.id} - ${e.clientName} (${e.eventType})`);
  const selected = prompt('Assign truck to event:\n' + options.map((o, i) => `${i + 1}. ${o}`).join('\n') + '\n\nEnter the event number:');

  if (selected === null) return;
  const idx = parseInt(selected, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= activeEvents.length) {
    showToast('Invalid selection.', 'error');
    return;
  }

  assignTruckToEvent(truckId, activeEvents[idx].id);
}

function assignTruckToEvent(truckId, eventId) {
  const trucks = getFromStorage('trucks');
  const truckIdx = trucks.findIndex(t => t.id === truckId);
  if (truckIdx === -1) return;

  const events = getFromStorage('events');
  const eventIdx = events.findIndex(e => e.id === eventId);
  if (eventIdx === -1) return;

  // Unassign previous truck from the event if any
  if (events[eventIdx].assignedTruck) {
    const prevTruckIdx = trucks.findIndex(t => t.id === events[eventIdx].assignedTruck);
    if (prevTruckIdx !== -1) {
      trucks[prevTruckIdx].assignedEventId = null;
      trucks[prevTruckIdx].status = 'Available';
    }
  }

  // Assign
  trucks[truckIdx].assignedEventId = eventId;
  trucks[truckIdx].status = 'En Route';
  trucks[truckIdx].lastUpdated = new Date().toISOString();
  events[eventIdx].assignedTruck = truckId;

  saveToStorage('trucks', trucks);
  saveToStorage('events', events);

  loadTrucks();
  loadAdminEvents();
  showToast(`Truck ${trucks[truckIdx].plateNumber} assigned to event ${eventId}.`, 'success');
}

// ---------- Admin - Payments Tab ----------

function loadPayments() {
  const events = getFromStorage('events');
  const tbody = document.getElementById('payments-table-body');
  if (!tbody) return;

  // Calculate summary stats
  const totalRevenue = events.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
  const totalPending = events.reduce((sum, e) => sum + (e.amount - (e.amountPaid || 0)), 0);

  const elTotalRevenue = document.getElementById('payment-total-revenue');
  const elPending = document.getElementById('payment-pending');
  const elReceived = document.getElementById('payment-received');

  if (elTotalRevenue) elTotalRevenue.textContent = formatCurrency(totalRevenue + totalPending);
  if (elPending) elPending.textContent = formatCurrency(totalPending);
  if (elReceived) elReceived.textContent = formatCurrency(totalRevenue);

  if (events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No payment records found.</td></tr>';
    return;
  }

  tbody.innerHTML = events.map(event => {
    const balance = event.amount - (event.amountPaid || 0);
    const paymentStatusClass = getPaymentStatusClass(event.paymentStatus);
    const displayType = event.eventType === 'Other' ? event.customEventType : event.eventType;

    return `
      <tr>
        <td>${event.id}</td>
        <td>${event.clientName}</td>
        <td>${displayType}</td>
        <td>${formatCurrency(event.amount)}</td>
        <td>${formatCurrency(event.amountPaid || 0)}</td>
        <td>${formatCurrency(balance)}</td>
        <td><span class="badge ${paymentStatusClass}">${event.paymentStatus}</span></td>
        <td>
          ${event.paymentStatus !== 'Paid' ?
            `<button class="btn btn-sm btn-primary" onclick="showRecordPaymentForEvent('${event.id}')">Record Payment</button>` :
            '<span class="text-success">✓ Paid</span>'
          }
        </td>
      </tr>
    `;
  }).join('');
}

function getPaymentStatusClass(status) {
  switch (status) {
    case 'Paid': return 'badge-completed';
    case 'Pending': return 'badge-cancelled';
    case 'Partial': return 'badge-upcoming';
    default: return '';
  }
}

function showRecordPaymentModal() {
  const events = getFromStorage('events');
  const pendingEvents = events.filter(e => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partial');

  const eventSelect = document.getElementById('payment-event-select');
  if (eventSelect) {
    eventSelect.innerHTML = '<option value="">Select Event</option>' +
      pendingEvents.map(e => {
        const balance = e.amount - (e.amountPaid || 0);
        return `<option value="${e.id}">${e.id} - ${e.clientName} (Balance: ${formatCurrency(balance)})</option>`;
      }).join('');
  }

  showModal('payment-modal');
}

function showRecordPaymentForEvent(eventId) {
  const events = getFromStorage('events');
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const eventSelect = document.getElementById('payment-event-select');
  if (eventSelect) {
    const pendingEvents = events.filter(e => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partial');
    eventSelect.innerHTML = '<option value="">Select Event</option>' +
      pendingEvents.map(e => {
        const balance = e.amount - (e.amountPaid || 0);
        return `<option value="${e.id}" ${e.id === eventId ? 'selected' : ''}>${e.id} - ${e.clientName} (Balance: ${formatCurrency(balance)})</option>`;
      }).join('');
  }

  showModal('payment-modal');
}

function handlePaymentFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const eventId = form.querySelector('#payment-event-select').value;
  const amount = parseFloat(form.querySelector('#payment-amount').value) || 0;
  const method = form.querySelector('#payment-method').value;
  const reference = form.querySelector('#payment-reference').value.trim();

  if (!eventId) {
    showToast('Please select an event.', 'error');
    return;
  }
  if (amount <= 0) {
    showToast('Please enter a valid payment amount.', 'error');
    return;
  }
  if (!method) {
    showToast('Please select a payment method.', 'error');
    return;
  }

  const events = getFromStorage('events');
  const idx = events.findIndex(ev => ev.id === eventId);
  if (idx === -1) return;

  events[idx].amountPaid = (events[idx].amountPaid || 0) + amount;

  if (events[idx].amountPaid >= events[idx].amount) {
    events[idx].amountPaid = events[idx].amount; // cap at total
    events[idx].paymentStatus = 'Paid';
  } else {
    events[idx].paymentStatus = 'Partial';
  }

  saveToStorage('events', events);

  loadPayments();
  loadAdminEvents();
  loadDashboardStats();
  hideModal('payment-modal');
  showToast(`Payment of ${formatCurrency(amount)} recorded for ${eventId}.`, 'success');

  form.reset();
}

// ---------- Admin Tabs ----------

function setupAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all tabs
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide all tab contents
      const tabContents = document.querySelectorAll('.admin-tab-content');
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Show matching tab content
      const tabName = btn.getAttribute('data-tab');
      const targetContent = document.querySelector(`.admin-tab-content[data-tab="${tabName}"]`);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// ---------- Modal Close Handlers ----------

function setupModalCloseHandlers() {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close on X button click
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });
}

// ---------- Initialization ----------

document.addEventListener('DOMContentLoaded', () => {
  // Initialize sample data
  initSampleData();

  // Set up navigation
  const navLinks = document.querySelectorAll('nav a[data-section]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      navigateTo(sectionId);
    });
  });

  // Mobile hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-links');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Booking form - Event type change
  const eventTypeSelect = document.getElementById('event-type');
  if (eventTypeSelect) {
    eventTypeSelect.addEventListener('change', handleEventTypeChange);
  }

  // Booking form - Package change
  const packageSelect = document.getElementById('event-package');
  if (packageSelect) {
    packageSelect.addEventListener('change', handlePackageChange);
  }

  // Booking form submit
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  // Marketplace - Load vendors
  loadVendors();

  // Marketplace - Filter buttons
  const filterBtns = document.querySelectorAll('[data-category]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      const searchInput = document.getElementById('vendor-search');
      const searchQuery = searchInput ? searchInput.value : '';
      loadVendors(category, searchQuery);
    });
  });

  // Marketplace - Search input
  const vendorSearch = document.getElementById('vendor-search');
  if (vendorSearch) {
    vendorSearch.addEventListener('input', (e) => {
      const activeFilter = document.querySelector('[data-category].active');
      const category = activeFilter ? activeFilter.getAttribute('data-category') : 'All';
      loadVendors(category, e.target.value);
    });
  }

  // Marketplace - List Your Business button
  const listBusinessBtn = document.getElementById('list-business-btn');
  if (listBusinessBtn) {
    listBusinessBtn.addEventListener('click', () => {
      showModal('vendor-modal');
    });
  }

  // Vendor form submit
  const vendorForm = document.getElementById('vendor-form');
  if (vendorForm) {
    vendorForm.addEventListener('submit', handleVendorFormSubmit);
  }

  // Admin tabs
  setupAdminTabs();

  // Admin login form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }

  // Equipment form
  const equipmentForm = document.getElementById('equipment-form');
  if (equipmentForm) {
    equipmentForm.addEventListener('submit', handleEquipmentFormSubmit);
  }

  // Allocate form
  const allocateForm = document.getElementById('allocate-form');
  if (allocateForm) {
    allocateForm.addEventListener('submit', handleAllocateFormSubmit);
  }

  // Truck form
  const truckForm = document.getElementById('truck-form');
  if (truckForm) {
    truckForm.addEventListener('submit', handleTruckFormSubmit);
  }

  // Payment form
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePaymentFormSubmit);
  }

  // Record payment button
  const recordPaymentBtn = document.getElementById('record-payment-btn');
  if (recordPaymentBtn) {
    recordPaymentBtn.addEventListener('click', showRecordPaymentModal);
  }

  // Set up all modal close handlers
  setupModalCloseHandlers();

  // Navigate to home
  navigateTo('home');
});

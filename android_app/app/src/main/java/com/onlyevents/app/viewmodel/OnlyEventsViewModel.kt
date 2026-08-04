package com.onlyevents.app.viewmodel

import androidx.lifecycle.ViewModel
import com.onlyevents.app.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class OnlyEventsViewModel : ViewModel() {

    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    private val _bookings = MutableStateFlow<List<EventBooking>>(emptyList())
    val bookings: StateFlow<List<EventBooking>> = _bookings.asStateFlow()

    private val _providers = MutableStateFlow<List<ServiceProvider>>(emptyList())
    val providers: StateFlow<List<ServiceProvider>> = _providers.asStateFlow()

    private val _trucks = MutableStateFlow<List<FleetTruck>>(emptyList())
    val trucks: StateFlow<List<FleetTruck>> = _trucks.asStateFlow()

    private val _equipment = MutableStateFlow<List<EquipmentItem>>(emptyList())
    val equipment: StateFlow<List<EquipmentItem>> = _equipment.asStateFlow()

    private val _payments = MutableStateFlow<List<PaymentRecord>>(emptyList())
    val payments: StateFlow<List<PaymentRecord>> = _payments.asStateFlow()

    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    // Form state
    var formName = ""
    var formPhone = ""
    var formEmail = ""
    var formEventType = "Wedding"
    var formPackage = "Silver"
    var formDate = "2026-08-15"
    var formGuests = "150"
    var formVenue = "Karen, Nairobi"

    // Dialog flags
    private val _showPaymentDialog = MutableStateFlow(false)
    val showPaymentDialog: StateFlow<Boolean> = _showPaymentDialog.asStateFlow()

    private val _showReceiptDialog = MutableStateFlow(false)
    val showReceiptDialog: StateFlow<Boolean> = _showReceiptDialog.asStateFlow()

    private val _showLiveTracker = MutableStateFlow(false)
    val showLiveTracker: StateFlow<Boolean> = _showLiveTracker.asStateFlow()

    var lastPaymentRecord: PaymentRecord? = null

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        _bookings.value = listOf(
            EventBooking("EVT-101", "Sarah & Kamau", "+254 712 345 678", "sarah@example.com", "28491029", "Wedding", "Gold", "15 Aug 2026", 350, "Karen, Nairobi", "Private Compound", "Red carpet", 280000, 84000, "Active"),
            EventBooking("EVT-102", "Waweru Family", "+254 722 987 654", "waweru@example.com", "19402910", "Ruracio", "Silver", "22 Aug 2026", 120, "Thika, Kiambu", "Home Grounds", "Traditional tents", 120000, 36000, "Active"),
            EventBooking("EVT-103", "TechKe Summit", "+254 733 111 222", "info@techke.co.ke", "99201920", "Corporate", "Silver", "30 Aug 2026", 200, "KICC, Nairobi", "Banquet Hall", "Full sound", 120000, 120000, "Pending")
        )

        _providers.value = listOf(
            ServiceProvider("PRV-001", "Mama's Kitchen", "catering", "Award-winning caterers specialising in Kenyan buffet menus.", "From KES 1,500/head", "Nairobi, Kiambu", "4.9 ★", "+254 712 000 001", "🍲"),
            ServiceProvider("PRV-002", "Snap & Story", "photography", "Cinematic wedding and event photography with drone coverage.", "From KES 25,000", "Nairobi, Kiambu", "4.8 ★", "+254 723 000 002", "📸"),
            ServiceProvider("PRV-003", "Bloom & Drape", "decor", "Luxury floral arrangements & venue draping.", "From KES 30,000", "Nairobi", "4.7 ★", "+254 745 000 004", "🌸"),
            ServiceProvider("PRV-004", "DJ Karura", "entertainment", "Professional DJ with 10+ years experience for all events.", "From KES 15,000", "Nairobi", "4.6 ★", "+254 734 000 003", "🎧")
        )

        _trucks.value = listOf(
            FleetTruck("KDA 001X", "Truck 1 – Isuzu FRR", "🚛", "Deployed", "Sarah Wedding", "Peter Mwangi", "Karen, Nairobi"),
            FleetTruck("KBX 212K", "Truck 2 – Mitsubishi Fuso", "🚚", "Deployed", "Waweru Ruracio", "James Otieno", "Thika Road"),
            FleetTruck("KDD 445Z", "Truck 3 – Isuzu NPR", "🚛", "Available", "Unassigned", "Unassigned", "Depot – Thika Rd")
        )

        _equipment.value = listOf(
            EquipmentItem("EQ-01", "Marquee Tents", "⛺", 8, 5, "units"),
            EquipmentItem("EQ-02", "PA Systems (2000W)", "🔊", 6, 2, "units"),
            EquipmentItem("EQ-03", "Generators (50KVA)", "⚡", 5, 2, "units"),
            EquipmentItem("EQ-04", "Banquet Chairs", "🪑", 1200, 650, "pcs")
        )

        _payments.value = listOf(
            PaymentRecord("PAY-901", "Sarah & Kamau", "Gold", 84000, "Deposit 30%", "M-Pesa", "10 Aug 2026"),
            PaymentRecord("PAY-902", "Waweru Family", "Silver", 36000, "Deposit 30%", "M-Pesa", "12 Aug 2026")
        )
    }

    fun selectTab(index: Int) {
        _selectedTab.value = index
    }

    fun submitBooking() {
        if (formName.isBlank() || formPhone.isBlank()) {
            showToast("Please enter your name and phone number.")
            return
        }
        val price = if (formPackage == "Gold") 280000 else if (formPackage == "Silver") 120000 else 50000
        val deposit = (price * 0.3).toInt()

        val newBooking = EventBooking(
            id = "EVT-${(100..999).random()}",
            clientName = formName,
            clientPhone = formPhone,
            clientEmail = formEmail.ifBlank { "client@example.com" },
            nationalId = "12345678",
            eventType = formEventType,
            packageName = formPackage,
            eventDate = formDate,
            expectedGuests = formGuests.toIntOrNull() ?: 100,
            venue = formVenue,
            venueType = "Private",
            specialNotes = "",
            totalAmount = price,
            depositPaid = deposit,
            status = "Pending"
        )
        _bookings.value = listOf(newBooking) + _bookings.value
        showToast("Booking Submitted Successfully! 🎉")
        _showPaymentDialog.value = true
    }

    fun confirmPayment(method: String) {
        val amount = if (formPackage == "Gold") 84000 else if (formPackage == "Silver") 36000 else 15000
        val rec = PaymentRecord(
            id = "PAY-${(1000..9999).random()}",
            clientName = formName.ifBlank { "Valued Client" },
            packageName = formPackage,
            amount = amount,
            paymentType = "Deposit 30%",
            method = method,
            date = "Today"
        )
        lastPaymentRecord = rec
        _payments.value = listOf(rec) + _payments.value
        _showPaymentDialog.value = false
        _showReceiptDialog.value = true
        showToast("Payment Processed! 30% Deposit Paid.")
    }

    fun dismissPaymentDialog() { _showPaymentDialog.value = false }
    fun dismissReceiptDialog() { _showReceiptDialog.value = false }
    fun openLiveTracker() {
        _showReceiptDialog.value = false
        _showLiveTracker.value = true
    }
    fun dismissLiveTracker() { _showLiveTracker.value = false }

    fun showToast(msg: String) {
        _toastMessage.value = msg
    }
    fun clearToast() {
        _toastMessage.value = null
    }
}

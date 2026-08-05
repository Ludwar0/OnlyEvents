package com.onlyevents.app.models

data class PackageTier(
    val name: String,
    val price: Int,
    val guestCapacity: String,
    val description: String,
    val features: List<String>,
    val badge: String? = null,
    val isPopular: Boolean = false
)

data class EventCategory(
    val name: String,
    val icon: String,
    val description: String
)

data class EventBooking(
    val id: String,
    val clientName: String,
    val clientPhone: String,
    val clientEmail: String,
    val nationalId: String,
    val eventType: String,
    val packageName: String,
    val eventDate: String,
    val expectedGuests: Int,
    val venue: String,
    val venueType: String,
    val specialNotes: String,
    val totalAmount: Int,
    val depositPaid: Int,
    val status: String = "Pending"
)

data class ServiceProvider(
    val id: String,
    val name: String,
    val category: String,
    val description: String,
    val longDescription: String = "",
    val specialties: List<String> = emptyList(),
    val reviewsCount: Int = 0,
    val priceTag: String,
    val serviceArea: String,
    val rating: String,
    val phone: String,
    val icon: String,
    val isApproved: Boolean = true
)

data class EquipmentItem(
    val id: String,
    val name: String,
    val icon: String,
    val totalUnits: Int,
    val deployedUnits: Int,
    val unitType: String
)

data class FleetTruck(
    val id: String,
    val name: String,
    val icon: String,
    val status: String,
    val assignment: String,
    val driver: String,
    val location: String
)

data class PaymentRecord(
    val id: String,
    val clientName: String,
    val packageName: String,
    val amount: Int,
    val paymentType: String,
    val method: String,
    val date: String,
    val status: String = "Paid"
)

data class ChatMessage(
    val id: String,
    val senderId: String, // "User" or Provider ID
    val text: String,
    val timestamp: String,
    val isFromUser: Boolean
)

data class ChatSession(
    val providerId: String,
    val providerName: String,
    val lastMessage: String,
    val messages: List<ChatMessage>
)

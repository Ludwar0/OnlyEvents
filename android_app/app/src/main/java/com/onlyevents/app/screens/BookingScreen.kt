package com.onlyevents.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onlyevents.app.ui.theme.GoldPrimary
import com.onlyevents.app.viewmodel.OnlyEventsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(viewModel: OnlyEventsViewModel) {
    var name by remember { mutableStateOf(viewModel.formName) }
    var phone by remember { mutableStateOf(viewModel.formPhone) }
    var email by remember { mutableStateOf(viewModel.formEmail) }
    var eventType by remember { mutableStateOf(viewModel.formEventType) }
    var selectedPackage by remember { mutableStateOf(viewModel.formPackage) }
    var guests by remember { mutableStateOf(viewModel.formGuests) }
    var venue by remember { mutableStateOf(viewModel.formVenue) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Book an Event", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text("Fill in your details for an instant quote.", fontSize = 13.sp, color = Color.Gray)

        OutlinedTextField(
            value = name,
            onValueChange = { name = it; viewModel.formName = it },
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it; viewModel.formPhone = it },
            label = { Text("Phone Number (+254 700 000 000)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; viewModel.formEmail = it },
            label = { Text("Email Address") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = eventType,
            onValueChange = { eventType = it; viewModel.formEventType = it },
            label = { Text("Event Type (e.g. Wedding, Ruracio, Corporate)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = selectedPackage,
            onValueChange = { selectedPackage = it; viewModel.formPackage = it },
            label = { Text("Package (Bronze, Silver, Gold)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = guests,
            onValueChange = { guests = it; viewModel.formGuests = it },
            label = { Text("Expected Guests (e.g. 150)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = venue,
            onValueChange = { venue = it; viewModel.formVenue = it },
            label = { Text("Venue / Location (e.g. Karen, Nairobi)") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = { viewModel.submitBooking() },
            colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp)
        ) {
            Text("Submit Booking Request", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }
}
